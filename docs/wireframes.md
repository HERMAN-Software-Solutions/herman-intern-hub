# Wireframes (Text)

Low-fidelity screen layouts for HERMAN Intern Hub. Mobile-first, responsive.

**Version:** 1.1 (approval flow + onboarding)
**Last updated:** 2026-09-16

---

## Legend

- `[Button]` — clickable button
- `[____]` — input field
- `→` — navigates to
- `🔒` — requires login
- `🛡️` — requires specific status

---

# 1. Public Pages

## 1.1 Landing Page (`/`)

```
┌─────────────────────────────────────────────────────┐
│  HERMAN ◉  Intern Hub         Nav  Apply  Directory │
│                                Sign in               │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Launch your software career                       │
│   with HERMAN                                       │
│                                                     │
│   Real projects. Real mentorship. Real experience.  │
│                                                     │
│   [Apply now]   [Browse interns]                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│   What you'll learn                                 │
│   ● React  ● Next.js  ● Node.js  ● Python          │
│   ● PostgreSQL  ● Docker  ● AWS  ● Mobile          │
├─────────────────────────────────────────────────────┤
│   How it works                                      │
│                                                     │
│   ① Apply  →  ② Get approved  →  ③ Onboard         │
│      →  ④ Build real projects  →  ⑤ Get certified  │
│                                                     │
├─────────────────────────────────────────────────────┤
│   Current cohort                                    │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐                      │
│   │ 👤 │ │ 👤 │ │ 👤 │ │ 👤 │                      │
│   │Name│ │Name│ │Name│ │Name│                      │
│   └────┘ └────┘ └────┘ └────┘                      │
│   [See all interns →]                               │
├─────────────────────────────────────────────────────┤
│   Success stories                                   │
│   ┌──────────────────────┐ ┌──────────────────────┐│
│   │  Past intern card    │ │  Past intern card    ││
│   └──────────────────────┘ └──────────────────────┘│
├─────────────────────────────────────────────────────┤
│   FAQ                                               │
│   ▸ Who can apply?                                  │
│   ▸ Is it paid?                                     │
│   ▸ How long does it last?                          │
│   ▸ Do I get a certificate?                         │
├─────────────────────────────────────────────────────┤
│  HERMAN Software Solutions Limited                  │
│  📧 infohermansoftware@gmail.com                    │
│  📞 +256 772 723 188                                │
│  📍 Jinja, Gabula Rd, Uganda                        │
│  MIT License                                        │
└─────────────────────────────────────────────────────┘
```

---

## 1.2 Apply (`/apply`)

Multi-step form. No login required.

```
┌─────────────────────────────────────────────────────┐
│  Apply for an internship                            │
│  Step 1 of 5 — Personal details                     │
│  ●○○○○                                              │
├─────────────────────────────────────────────────────┤
│  Full name       [___________________________]      │
│  Email           [___________________________]      │
│  Phone           [___________________________]      │
│                                                     │
│                          [Continue →]               │
└─────────────────────────────────────────────────────┘
```

**Steps:**
1. Personal details (name, email, phone)
2. Academic (university, course, year of study)
3. Tech interest (multi-select)
4. Portfolio & message
5. Review + submit

**On submit:**
- Insert row into `applications` with `status = 'pending'`
- Send confirmation email
- Redirect to `/apply/success`

### `/apply/success`

```
┌─────────────────────────────────────────────────────┐
│  ✅  Application received                           │
│                                                     │
│  Thanks, [Name]. We'll review your application      │
│  within 5 working days.                             │
│                                                     │
│  Check status anytime:                              │
│  [Check my status →]                                │
└─────────────────────────────────────────────────────┘
```

---

## 1.3 Check Status (`/apply/status`)

```
┌─────────────────────────────────────────────────────┐
│  Check your application status                      │
│                                                     │
│  Email  [___________________________]               │
│                                                     │
│                     [Send status link]              │
│                                                     │
│  We'll email you a magic link.                      │
└─────────────────────────────────────────────────────┘
```

After clicking link:

```
┌─────────────────────────────────────────────────────┐
│  Status: Under review                               │
│  Submitted: 2026-09-10                              │
│                                                     │
│  We're reviewing your application. You'll hear      │
│  from us within 5 working days.                     │
└─────────────────────────────────────────────────────┘
```

**Possible states:** pending, reviewing, accepted, rejected, withdrawn.

---

## 1.4 Accept Invitation (`/invite/[token]`)

Public page. No login required (yet).

```
┌─────────────────────────────────────────────────────┐
│  Welcome to HERMAN Intern Hub                       │
│                                                     │
│  Hi [Name from invitation],                         │
│  You've been invited as an intern.                  │
│  Please set your password to continue.              │
│                                                     │
│  Email     your@email.com (read-only)               │
│  Password  [___________________________]            │
│  Confirm   [___________________________]            │
│                                                     │
│  ☐ I agree to the Code of Conduct and               │
│    Internship Terms                                 │
│                                                     │
│                 [Create my account →]               │
└─────────────────────────────────────────────────────┘
```

**Error states:**
- **Expired** → "This invitation expired. [Request a new one]"
- **Already used** → auto-redirect to `/login`
- **Invalid token** → 404 page
- **Revoked** → "This invitation was revoked. Contact admin."

---

## 1.5 Public Intern Directory (`/interns`)

```
┌─────────────────────────────────────────────────────┐
│  Our interns                                        │
│                                                     │
│  Filters: [Tech stack ▾] [University ▾] [Status ▾] │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │   👤    │  │   👤    │  │   👤    │          │
│  │  Alice  │  │  Brian  │  │  Carol  │          │
│  │ Makerere│  │  Kyambogo│ │  MUST   │          │
│  │ React   │  │  Python │  │  Node   │          │
│  │ [View]  │  │  [View] │  │ [View]  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                     │
│  ... (paginated)                                    │
└─────────────────────────────────────────────────────┘
```

**Only shows:** `status IN ('active', 'completed')` AND `directory_visible = TRUE`.

---

## 1.6 Success Stories (`/success-stories`)

```
┌─────────────────────────────────────────────────────┐
│  Where our interns go                               │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  👤  Past Intern Name                        │   │
│  │  Interned: Jan–Apr 2025                      │   │
│  │  Now: Software Engineer at [Company]         │   │
│  │  "Quote about the experience..."             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ... (more cards)                                   │
└─────────────────────────────────────────────────────┘
```

---

## 1.7 Login (`/login`)

```
┌─────────────────────────────────────────────────────┐
│  Sign in to HERMAN Intern Hub                       │
│                                                     │
│  Email     [___________________________]            │
│  Password  [___________________________]            │
│                                                     │
│              [Sign in →]                            │
│                                                     │
│  Forgot password?                                   │
│                                                     │
│  Don't have an account? [Apply for an internship]   │
└─────────────────────────────────────────────────────┘
```

⚠️ **No "Sign up" link exists** — only "Apply".

---

# 2. Onboarding Wizard (🔒 🛡️ `status = 'onboarding'`)

Shown only to users whose `profiles.status = 'onboarding'`.

## 2.1 Welcome (`/onboarding/welcome`)

```
┌─────────────────────────────────────────────────────┐
│  Welcome, [Name]! 🎉                                │
│                                                     │
│  You're in. Here's what happens next:               │
│                                                     │
│  ① Complete your profile       (~2 min)             │
│  ② Choose your tech stack      (~1 min)             │
│  ③ Sign the agreement          (~1 min)             │
│  ④ Wait for mentor assignment  (we'll email you)    │
│                                                     │
│                   [Let's start →]                   │
└─────────────────────────────────────────────────────┘
```

---

## 2.2 Profile (`/onboarding/profile`)

```
┌─────────────────────────────────────────────────────┐
│  Step 1 of 3 — Your profile                         │
│  ●○○                                                │
├─────────────────────────────────────────────────────┤
│  [Upload photo]                                     │
│                                                     │
│  Full name    [___________________________]         │
│  Phone        [___________________________]         │
│  University   [___________________________]         │
│  Course       [___________________________]         │
│  Year         [▼ Select]                            │
│  Bio (short)  [___________________________]         │
│               [___________________________]         │
│                                                     │
│                          [Continue →]               │
└─────────────────────────────────────────────────────┘
```

---

## 2.3 Tech Stack (`/onboarding/tech-stack`)

```
┌─────────────────────────────────────────────────────┐
│  Step 2 of 3 — Choose your learning track           │
│  ○●○                                                │
├─────────────────────────────────────────────────────┤
│  Pick at least one. You can add more later.         │
│                                                     │
│  ☑ React           [Beginner ▾]   ☐ Primary        │
│  ☐ Next.js                                          │
│  ☐ Node.js                                          │
│  ☐ Python                                           │
│  ☑ PostgreSQL      [Intermediate ▾] ☑ Primary      │
│  ☐ MongoDB                                          │
│  ☐ Docker                                           │
│  ☐ AWS                                              │
│                                                     │
│                          [Continue →]               │
└─────────────────────────────────────────────────────┘
```

---

## 2.4 Agreement (`/onboarding/agreement`)

```
┌─────────────────────────────────────────────────────┐
│  Step 3 of 3 — Sign the agreement                   │
│  ○○●                                                │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐ │
│  │  HERMAN Internship Terms v1.0                 │ │
│  │                                                │ │
│  │  1. Code of conduct                            │ │
│  │  2. Working hours and expectations             │ │
│  │  3. Confidentiality                            │ │
│  │  4. IP ownership                               │ │
│  │  5. Compensation (unpaid unless client work)   │ │
│  │  6. Termination                                │ │
│  │  ... (scrollable)                              │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ☐ I have read and agree to the above terms         │
│                                                     │
│                  [Sign and continue →]              │
└─────────────────────────────────────────────────────┘
```

**On submit:** sets `profiles.agreement_signed_at` and `agreement_version`.

---

## 2.5 Pending (`/onboarding/pending`)

```
┌─────────────────────────────────────────────────────┐
│  ✅  Onboarding complete!                           │
│                                                     │
│  Now we're assigning your mentor. This usually      │
│  takes 1–2 business days.                           │
│                                                     │
│  What's happening:                                  │
│  ✅ Profile complete                                │
│  ✅ Tech stack selected                             │
│  ✅ Agreement signed                                │
│  ⏳ Mentor assignment                                │
│                                                     │
│  You'll get an email when you're ready to go.       │
│                                                     │
│  Questions? [Contact admin]                         │
└─────────────────────────────────────────────────────┘
```

---

# 3. Intern Dashboard (🔒 🛡️ `status = 'active'`)

## 3.1 Layout (shared)

```
┌───────────┬─────────────────────────────────────────┐
│  HERMAN   │  [Search]        🔔  👤  [Name ▾]       │
│  Intern   ├─────────────────────────────────────────┤
│  Hub      │                                         │
│           │  [page content]                         │
│  Dashboard│                                         │
│  Projects │                                         │
│  Tasks    │                                         │
│  Daily Log│                                         │
│  Reports  │                                         │
│  Documents│                                         │
│  Profile  │                                         │
│           │                                         │
│  Sign out │                                         │
└───────────┴─────────────────────────────────────────┘
```

---

## 3.2 Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────────────────┐
│  Good morning, [Name] 👋                            │
│  Week 3 of 12                                      │
├─────────────────────────────────────────────────────┤
│  Active projects                                    │
│  ┌───────────────────────────────────────────────┐ │
│  │  Jinja School Website        [████████░░] 80% │ │
│  │  Voting Portal Redesign      [████░░░░░░] 40% │ │
│  └───────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  Tasks due this week                                │
│  ☐ Fix mobile nav bug        Due: Wed              │
│  ☐ Write tests for login     Due: Thu              │
│  ☑ Submit design mockup      Done ✓                │
├─────────────────────────────────────────────────────┤
│  Today's log                                        │
│  ┌───────────────────────────────────────────────┐ │
│  │  Hours [__]  What did you work on?            │ │
│  │  [_____________________________________]      │ │
│  │  [Save log]                                   │ │
│  └───────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  Recent feedback                                    │
│  • Nice work on the login flow! — Mentor A          │
│  • Please add error handling here — Mentor B        │
└─────────────────────────────────────────────────────┘
```

---

## 3.3 Projects (`/dashboard/projects`)

```
┌─────────────────────────────────────────────────────┐
│  My Projects                          [+ New?]      │
│                                                     │
│  [Active ▾]  [Completed]                            │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Jinja School Website                         │ │
│  │  Role: Contributor                            │ │
│  │  Progress: [████████░░] 80%                   │ │
│  │  Due: 2026-10-15                              │ │
│  │  [Open →]                                     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Voting Portal Redesign                       │ │
│  │  Role: Lead                                   │ │
│  │  Progress: [████░░░░░░] 40%                   │ │
│  │  Due: 2026-11-01                              │ │
│  │  [Open →]                                     │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 3.4 Project Detail (`/dashboard/projects/[id]`)

```
┌─────────────────────────────────────────────────────┐
│  ← Back                                             │
│                                                     │
│  Jinja School Website                               │
│  Due 2026-10-15 · Role: Contributor                 │
│                                                     │
│  Description                                        │
│  Rebuild the public-facing website with modern      │
│  CMS integration and mobile-first design.           │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Tasks                                              │
│  ☐ Fix mobile nav bug             Due Wed · Todo   │
│  ☐ Write tests for login          Due Thu · Todo   │
│  ☑ Submit design mockup           Done ✓           │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Files                                              │
│  📎 design.fig · 📎 spec.pdf                        │
└─────────────────────────────────────────────────────┘
```

---

## 3.5 Tasks (`/dashboard/tasks`)

```
┌─────────────────────────────────────────────────────┐
│  My Tasks                          [Filter ▾]       │
│                                                     │
│  Todo (2)                                           │
│  ☐ Fix mobile nav bug        Project: Jinja School │
│  ☐ Write tests for login     Project: Voting       │
│                                                     │
│  In progress (1)                                    │
│  ◐ Update homepage copy       Project: Jinja School │
│                                                     │
│  Review (0)                                         │
│                                                     │
│  Done (5)                                           │
│  ☑ Submit design mockup                             │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

---

## 3.6 Daily Log (`/dashboard/logs`)

```
┌─────────────────────────────────────────────────────┐
│  Daily Log                          [+ Add entry]   │
├─────────────────────────────────────────────────────┤
│  Date       [2026-09-16 📅]                         │
│  Hours      [__]                                    │
│  Worked on  [_____________________________________] │
│             [_____________________________________] │
│                                                     │
│                              [Save]                 │
├─────────────────────────────────────────────────────┤
│  This week                                          │
│  Mon 2026-09-14  6h  Fixed bug, code review         │
│  Tue 2026-09-15  5h  Pair programming with mentor   │
│  Wed 2026-09-16  —   (today, not yet logged)        │
│                                                     │
│  Total: 11h                                         │
└─────────────────────────────────────────────────────┘
```

---

## 3.7 Weekly Reports (`/dashboard/reports`)

```
┌─────────────────────────────────────────────────────┐
│  Weekly Reports                                     │
│                                                     │
│  Sep 8 – Sep 14, 2026                               │
│  Total: 30h · Auto-generated Monday 00:00           │
│  [View PDF]  [Download]                             │
│                                                     │
│  Sep 1 – Sep 7, 2026                                │
│  Total: 28h · [View PDF]                            │
│                                                     │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

---

## 3.8 Documents (`/dashboard/documents`)

```
┌─────────────────────────────────────────────────────┐
│  My Documents                                       │
│                                                     │
│  Type                  Issued      Actions          │
│  ─────────────────────────────────────────────      │
│  Offer letter          2026-09-01  [View] [Download]│
│  Internship agreement  2026-09-01  [View] [Download]│
│  Certificate           —           (on completion)  │
│  Experience letter     —           (on request)     │
└─────────────────────────────────────────────────────┘
```

---

## 3.9 Profile (`/dashboard/profile`)

Standard edit form: name, phone, university, course, bio, avatar, directory visibility toggle.

---

# 4. Admin Dashboard (🔒 🛡️ `role IN (admin, super_admin)`)

## 4.1 Layout (shared)

```
┌───────────┬─────────────────────────────────────────┐
│  HERMAN   │  [Search]        🔔  👤  [Admin ▾]      │
│  Admin    ├─────────────────────────────────────────┤
│           │                                         │
│  Overview │  [page content]                         │
│  Interns  │                                         │
│  Projects │                                         │
│  Apps     │                                         │
│  Invites  │                                         │
│  Docs     │                                         │
│  Reports  │                                         │
│  Settings │                                         │
└───────────┴─────────────────────────────────────────┘
```

---

## 4.2 Overview (`/admin`)

```
┌─────────────────────────────────────────────────────┐
│  Overview                                           │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Active   │ │ Pending  │ │ Apps     │ │ Certs  │ │
│  │ interns  │ │ reviews  │ │ this mo. │ │ issued │ │
│  │   12     │ │    4     │ │    8     │ │   23   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├─────────────────────────────────────────────────────┤
│  Pending approvals                                  │
│  • [Name] · submitted 2d ago · [Review]             │
│  • [Name] · submitted 3d ago · [Review]             │
├─────────────────────────────────────────────────────┤
│  Log gaps (no entry in 2+ days)                     │
│  • [Intern A] · last log 3 days ago                 │
│  • [Intern B] · last log 4 days ago                 │
├─────────────────────────────────────────────────────┤
│  Recent activity                                    │
│  • Mentor A approved task "Fix nav" · 1h ago        │
│  • Certificate issued for Carol · 3h ago            │
└─────────────────────────────────────────────────────┘
```

---

## 4.3 Applications (`/admin/applications`)

```
┌─────────────────────────────────────────────────────┐
│  Applications              [Pending ▾]  [Search]    │
│                                                     │
│  Name           Email            University   Act.  │
│  ─────────────────────────────────────────────────  │
│  Alice Nakato   ali@x.com        Makerere     [→]   │
│  Brian Okello   bri@x.com        Kyambogo     [→]   │
│  Carol Auma     car@x.com        MUST         [→]   │
└─────────────────────────────────────────────────────┘
```

---

## 4.4 Application Detail + Approve (`/admin/applications/[id]`)

```
┌─────────────────────────────────────────────────────┐
│  ← Back                                             │
│                                                     │
│  Alice Nakato                                       │
│  ali@x.com · +256 700 000 000                       │
│  Makerere University · BSc CS · Year 3              │
│                                                     │
│  Tech interest: React, PostgreSQL                   │
│  Portfolio: github.com/alice                        │
│                                                     │
│  Message:                                           │
│  "I want to learn production-grade web dev..."      │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Internal notes                                     │
│  [_____________________________________]            │
├─────────────────────────────────────────────────────┤
│  [Reject]                        [Approve →]        │
└─────────────────────────────────────────────────────┘
```

**Click Approve → modal:**

```
┌─────────────────────────────────────────────────────┐
│  Approve Alice Nakato                               │
│                                                     │
│  Start date       [2026-09-23 📅]                   │
│  Duration         [3 months ▾]                      │
│  End date         [2026-12-23] (auto)               │
│  Mentor           [▼ Select mentor]                 │
│  Tech stack       [React ✕] [PostgreSQL ✕] [+]      │
│  Welcome message  [Hi Alice, welcome aboard...]     │
│                                                     │
│  ☑ Send invitation email now                        │
│                                                     │
│              [Cancel]   [Send invitation →]         │
└─────────────────────────────────────────────────────┘
```

**On submit:**
- Creates `invitations` row
- Sends email
- Updates application → `accepted`
- Logs to `audit_log`

---

## 4.5 Invitations (`/admin/invitations`)

```
┌─────────────────────────────────────────────────────┐
│  Invitations                    [+ Invite directly] │
│                                                     │
│  Email          Role     Status    Expires   Act.   │
│  ─────────────────────────────────────────────────  │
│  ali@x.com      intern   pending   6d        [⋯]    │
│  bri@x.com      intern   accepted  —         [⋯]    │
│  car@x.com      intern   expired   —         [⋯]    │
└─────────────────────────────────────────────────────┘
```

**Actions menu:** Resend, Revoke, Copy link.

---

## 4.6 Direct Invite (`/admin/interns/invite`)

```
┌─────────────────────────────────────────────────────┐
│  Invite an intern directly                          │
│                                                     │
│  Full name    [___________________________]         │
│  Email        [___________________________]         │
│  Role         [intern ▾]                            │
│                                                     │
│  Start date   [2026-09-23 📅]                       │
│  Duration     [3 months ▾]                          │
│  Mentor       [▼ Select mentor]                     │
│                                                     │
│  Welcome message (optional)                         │
│  [_____________________________________]            │
│                                                     │
│                    [Send invitation →]              │
└─────────────────────────────────────────────────────┘
```

---

## 4.7 Interns (`/admin/interns`)

```
┌─────────────────────────────────────────────────────┐
│  Interns                           [Filter ▾]       │
│                                                     │
│  Name          Status      Mentor      Progress     │
│  ─────────────────────────────────────────────────  │
│  Alice Nakato  active      Mentor A    ████░        │
│  Brian Okello  onboarding  —           ░░░░░        │
│  Carol Auma    active      Mentor B    ██████       │
└─────────────────────────────────────────────────────┘
```

---

## 4.8 Intern Detail (`/admin/interns/[id]`)

```
┌─────────────────────────────────────────────────────┐
│  ← Back                                             │
│                                                     │
│  Alice Nakato · active · Week 3 of 12               │
│                                                     │
│  [Profile] [Projects] [Tasks] [Logs] [Docs] [Audit] │
├─────────────────────────────────────────────────────┤
│  Profile                                            │
│  Email    ali@x.com                                 │
│  Mentor   [Mentor A ▾]                              │
│  Start    2026-09-01                                │
│  End      2026-12-01                                │
│                                                     │
│  Actions:                                           │
│  [Generate certificate]                             │
│  [Generate experience letter]                       │
│  [Pause]   [Mark completed]   [Withdraw]            │
└─────────────────────────────────────────────────────┘
```

---

## 4.9 Projects (`/admin/projects/[id]`)

Kanban-style task board + assignments.

```
┌─────────────────────────────────────────────────────┐
│  Jinja School Website          [Edit] [Archive]     │
│                                                     │
│  Assigned interns                                   │
│  • Alice Nakato  ·  Contributor  ·  unpaid          │
│  • Brian Okello  ·  Lead         ·  paid (signed)   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Tasks                                              │
│                                                     │
│  Todo        │  In progress  │  Review  │  Done     │
│  ─────────   │  ──────────   │  ──────  │  ────     │
│  ▸ Fix nav   │  ▸ Homepage   │  (0)     │  ▸ Mockup │
│  ▸ Tests     │               │          │           │
└─────────────────────────────────────────────────────┘
```

---

# 5. Certificate PDF Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           HERMAN SOFTWARE SOLUTIONS LIMITED         │
│           ─────────────────────────────             │
│                                                     │
│                                                     │
│              CERTIFICATE OF INTERNSHIP              │
│                                                     │
│                                                     │
│           This certifies that                       │
│                                                     │
│              [INTERN FULL NAME]                     │
│                                                     │
│           successfully completed an internship      │
│           in [TECH STACK] from                      │
│           [START DATE] to [END DATE].               │
│                                                     │
│                                                     │
│           Signed:                                   │
│           ______________________                    │
│           [Mentor name]                             │
│                                                     │
│           ______________________                    │
│           [Admin name]                              │
│                                                     │
│                                                     │
│           Jinja, Gabula Rd, Uganda                  │
│           infohermansoftware@gmail.com              │
│           +256 772 723 188                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

# 6. Account Status (`/account-status`)

For interns in `paused`, `completed`, or `withdrawn` state.

```
┌─────────────────────────────────────────────────────┐
│  Your account status                                │
│                                                     │
│  Status:  Completed ✓                               │
│                                                     │
│  Your internship ran from Sep 1 to Dec 1, 2026.     │
│  You can still access your documents below.         │
│                                                     │
│  Documents:                                         │
│  • Certificate          [Download]                  │
│  • Experience letter    [Download]                  │
│                                                     │
│  Questions? [Contact admin]                         │
└─────────────────────────────────────────────────────┘
```

---

# 7. Design Tokens

See `docs/brand.md`.

---

# 8. Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `< 640px` | Single column, bottom nav for intern portal |
| `640–1024px` | Two columns, collapsible sidebar |
| `> 1024px` | Full sidebar + multi-column content |