# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities as public GitHub issues.**

Instead, use one of these private channels:

1. **GitHub Security Advisories** (preferred):
   [Report privately](https://github.com/HERMAN-Software-Solutions/herman-intern-hub/security/advisories/new)

2. **Email:**
   Send details to **infohermansoftware@gmail.com** with subject line `[SECURITY]`.

## What to include

- A description of the vulnerability
- Steps to reproduce
- Impact assessment (what an attacker could do)
- Any suggested fix
- Your name + contact (if you'd like credit)

## Response timeline

| Stage | Target |
|---|---|
| Initial acknowledgement | Within 48 hours |
| Triage + severity assessment | Within 5 days |
| Fix for critical issues | Within 14 days |
| Public disclosure (coordinated) | After fix ships |

## Scope

In scope:
- `herman-intern-hub.vercel.app`
- The code in this repository
- Supabase RLS policies
- Authentication & session handling
- File upload handling

Out of scope:
- Denial of service attacks
- Social engineering
- Issues in third-party services (report those to Supabase, Vercel, or Brevo directly)
- Findings from automated scanners without proof of exploitability

## Safe harbor

We will not pursue legal action against researchers who:
- Follow this policy
- Act in good faith
- Do not access, modify, or delete user data beyond what's necessary to demonstrate the issue
- Give us reasonable time to fix before disclosure

Thank you for helping keep HERMAN Intern Hub and our interns' data safe.