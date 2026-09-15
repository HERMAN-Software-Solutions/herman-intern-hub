# Authentication & Access Flow

HERMAN Intern Hub has **no public self-registration**. Users enter through one of two approved paths, and access is gated by status at every step.

**Version:** 1.0
**Last updated:** 2026-09-16

---

## TL;DR

- No `/signup` page exists
- Entry is only via `/apply` (public) or admin invite
- Admin approves → system sends invitation email → user accepts → onboarding → mentor assigned → active
- Every protected route checks the user's `profiles.status`
- Database Row-Level Security enforces the same rules as a second layer

---

## Two Entry Paths

### Path A — Public Application (default)

```
Visitor → /apply → Admin reviews → Approved → Invitation sent
        → Account created → Onboarding → Active
```

### Path B — Admin Direct Invite

```
Admin → /admin/interns/invite → Invitation sent
      → Account created → Onboarding → Active
```

Both paths converge at the **invitation** step.

---

## State Machine

```
                    ┌─────────────────┐
                    │  No account     │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     ┌────────────────┐          ┌──────────────────┐
     │ /apply         │          │ Admin invite     │
     │ (public)       │          │ (admin only)     │
     └────────┬───────┘          └────────┬─────────┘
              │                           │
              ▼                           │
     ┌────────────────┐                   │
     │ Application    │                   │
     │ status: pending│                   │
     └────────┬───────┘                   │
              │                           │
        ┌─────┴─────┐                     │
        │           │                     │
        ▼           ▼                     │
   ┌────────┐  ┌──────────┐               │
   │Rejected│  │ Approved │◄──────────────┘
   └────────┘  └────┬─────┘
                    │
                    ▼
           ┌──────────────────┐
           │ Invitation sent  │
           │ (email w/ token) │
           │ Expires in 7 days│
           └────────┬─────────┘
                    │
                    ▼ (user clicks link, sets password, verifies email)
           ┌──────────────────┐
           │ profile.status = │
           │  'onboarding'    │
           └────────┬─────────┘
                    │
                    ▼ (onboarding wizard: profile + tech stack + agreement)
           ┌──────────────────┐
           │ onboarding       │
           │ complete         │
           └────────┬─────────┘
                    │
                    ▼ (admin assigns mentor)
           ┌──────────────────┐
           │ profile.status = │
           │  'active'        │
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │  Full dashboard  │
           └──────────────────┘
```

---

## Route Access Matrix

| Route | No account | Pending | Onboarding | Active | Paused/Completed | Admin |
|---|---|---|---|---|---|---|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/apply` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/apply/status` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/interns` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/invite/[token]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/onboarding/*` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/dashboard/*` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/account-status` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/admin/*` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Middleware Enforcement

Next.js middleware checks the user's `profiles.status` on every protected route.

### `src/middleware.ts` (concept)

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED = ['/dashboard', '/onboarding', '/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!PROTECTED.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Fetch profile status + role
  const { data: profile } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('id', user.id)
    .single()

  // No profile yet → send to onboarding welcome (rare)
  if (!profile) {
    if (pathname.startsWith('/onboarding')) return res
    return NextResponse.redirect(new URL('/onboarding/welcome', req.url))
  }

  // Admin routes: role check
  if (pathname.startsWith('/admin')) {
    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return res
  }

  // Dashboard routes: must be active
  if (pathname.startsWith('/dashboard')) {
    if (profile.status !== 'active') {
      if (profile.status === 'onboarding') {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
      return NextResponse.redirect(new URL('/account-status', req.url))
    }
    return res
  }

  // Onboarding routes: only for onboarding status
  if (pathname.startsWith('/onboarding')) {
    if (profile.status === 'active') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (profile.status !== 'onboarding') {
      return NextResponse.redirect(new URL('/account-status', req.url))
    }
    return res
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/admin/:path*'],
}
```

---

## Invitation Token Flow

### Creating an invitation (admin action)

Triggered from:
- `/admin/applications/[id]` — Approve button
- `/admin/interns/invite` — Direct invite

**Server action pseudocode:**

```typescript
'use server'

export async function createInvitation({
  email,
  role = 'intern',
  applicationId,
  welcomeMessage,
  mentorId,
  startDate,
  endDate,
  techStacks,
}) {
  const supabase = createAdminClient()  // service_role

  // 1. Create the invitation row
  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      email,
      role,
      application_id: applicationId ?? null,
      invited_by: currentUser.id,
      metadata: { welcomeMessage, mentorId, startDate, endDate, techStacks },
    })
    .select()
    .single()

  if (error) throw error

  // 2. Send the email (Brevo) with a link to /invite/<token>
  await sendInvitationEmail({
    to: email,
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`,
    invitedBy: currentUser.full_name,
  })

  // 3. Update the application, if any
  if (applicationId) {
    await supabase
      .from('applications')
      .update({
        status: 'accepted',
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
  }

  // 4. Audit log
  await supabase.from('audit_log').insert({
    actor_id: currentUser.id,
    action: 'invitation.created',
    entity: 'invitations',
    entity_id: invitation.id,
    metadata: { email, role },
  })

  return invitation
}
```

### Accepting an invitation (user action)

**Page:** `/invite/[token]`

**Server flow:**

```typescript
export async function acceptInvitation(token, password, agreementAccepted) {
  const supabase = createAdminClient()

  // 1. Validate token
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invitation) throw new Error('Invalid or expired invitation')

  // 2. Create the auth user
  const { data: authUser, error } = await supabase.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
    user_metadata: { invited_via: invitation.id },
  })

  if (error) throw error

  // 3. Create the profile
  await supabase.from('profiles').insert({
    id: authUser.user.id,
    email: invitation.email,
    role: invitation.role,
    status: 'onboarding',
    invited_via: invitation.id,
    approved_by: invitation.invited_by,
    approved_at: invitation.created_at,
    agreement_signed_at: agreementAccepted ? new Date().toISOString() : null,
    agreement_version: '1.0',
    ...invitation.metadata,
  })

  // 4. Mark invitation accepted
  await supabase
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  // 5. Audit
  await supabase.from('audit_log').insert({
    actor_id: authUser.user.id,
    action: 'invitation.accepted',
    entity: 'invitations',
    entity_id: invitation.id,
  })

  return authUser.user
}
```

### Edge cases

| Case | Behavior |
|---|---|
| Token expired | Show "expired" page with **Request new invite** button |
| Token already used | Redirect to `/login` |
| User already exists | Send password reset instead of creating account |
| Invalid token | Show 404 |
| Revoked invitation | Show "This invitation was revoked" |

---

## Onboarding Gate

Before `profiles.status` becomes `active`, an intern must complete:

| Step | Route | Required | Sets |
|---|---|---|---|
| Welcome | `/onboarding/welcome` | ✅ | (nothing, intro only) |
| Profile | `/onboarding/profile` | ✅ | name, phone, university, course, bio |
| Tech stack | `/onboarding/tech-stack` | ✅ | `intern_tech_stacks` rows |
| Agreement | `/onboarding/agreement` | ✅ | `agreement_signed_at` |
| Pending | `/onboarding/pending` | ✅ | (auto-advances) |

When all required fields are present **and** an admin assigns a mentor, a **database trigger** flips `profiles.status` from `onboarding` to `active`.

**Trigger:**

```sql
CREATE OR REPLACE FUNCTION maybe_activate_intern()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mentor_id IS NOT NULL
     AND NEW.status = 'onboarding'
     AND NEW.agreement_signed_at IS NOT NULL
     AND NEW.full_name IS NOT NULL
     AND NEW.university IS NOT NULL THEN
    NEW.status := 'active';
    NEW.mentor_assigned_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_activate_intern
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION maybe_activate_intern();
```

After activation, an email is sent to the intern ("You're all set") and to their mentor ("New intern assigned").

---

## Admin Approval Screen

When admin clicks **Approve** on `/admin/applications/[id]`:

| Field | Required | Default |
|---|---|---|
| Start date | ✅ | Today + 7 days |
| End date (or duration) | ✅ | 3 months |
| Mentor | ✅ | Empty — admin must choose |
| Tech stack | ⬜ | Pre-filled from application |
| Welcome message | ⬜ | Generic template |
| Send invitation now? | ✅ | Yes |

Click **Send invitation** → invitation created + email sent + application marked accepted.

---

## Security Notes

- **Never trust client-side status** — every check happens server-side (middleware + server actions).
- **RLS enforces at the DB level** — even if middleware is bypassed, queries return nothing for unapproved users.
- **Invitation tokens are single-use** — marked accepted on first use.
- **Tokens expire in 7 days** — cron job cleans up expired ones hourly.
- **Admin actions logged** — every approve/revoke/write to `audit_log`.
- **No public signup route exists** — the only way in is an invitation.
- **Service-role key is server-only** — never in client bundles or `NEXT_PUBLIC_*`.
- **Email verification is required** — Supabase enforces this at sign-up.

---

## What This Prevents

| Risk | Mitigation |
|---|---|
| Random stranger signs up | No public signup route |
| Intern logs in before approval | Status gate in middleware + RLS |
| Intern sees data without mentor | Onboarding gate + trigger |
| Spam applications | Rate limit on `/apply` (Vercel KV or Upstash) |
| Mentor exceeds authority | Admin-only approval + invite routes |
| Intern accesses others' data | RLS policies on every table |
| Used invitation reused | Single-use token + status check |
| Stale invitations linger | Hourly expiry job via `pg_cron` |

---

## Future Enhancements

- **Magic link login** for interns (no password) — via Supabase `signInWithOtp`
- **SSO** for admin accounts (Google Workspace)
- **2FA** for admin + mentor roles
- **IP allowlist** for `/admin/*`
- **Email domain allowlist** for applications (e.g. only `.ac.ug` universities)