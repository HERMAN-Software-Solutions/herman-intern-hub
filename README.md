<div align="center">

<img src="https://raw.githubusercontent.com/HERMAN-Software-Solutions/herman-intern-hub/main/public/brand/logo.webp" alt="HERMAN" width="100" />

# HERMAN Intern Hub

**Intern lifecycle management for [HERMAN Software Solutions Limited](https://herman-software-website.vercel.app)**

Apply → Approve → Onboard → Build → Review → Certify — all in one place.

[![Live](https://img.shields.io/badge/live-herman--intern--hub.vercel.app-0f172a?style=flat-square)](https://herman-intern-hub.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-95%2F100%2F100%2F100-10b981?style=flat-square)](https://herman-intern-hub.vercel.app)

</div>

---

## What it is

HERMAN Intern Hub replaces spreadsheets, WhatsApp threads, and manual paperwork with a single, opinionated system for managing software internships end-to-end.

Built and used by **HERMAN Software Solutions Limited** (Jinja, Uganda).

## The full lifecycle

| Stage | Who | What happens |
|---|---|---|
| **Apply** | Public | Visitors fill a multi-step application form — no login required |
| **Review** | Admin | Admins review applications, approve or reject |
| **Invite** | System | Approved applicants receive an email invitation with a secure token |
| **Onboard** | Intern | Set password, complete profile, pick tech stack, sign agreement |
| **Work** | Intern + Mentor | Get assigned to projects, submit work, log daily activity |
| **Certify** | Admin | Complete performance review → issue certificate + experience letter |

Each stage is enforced by the system — you cannot skip ahead.

## Roles

The platform supports three distinct user roles with dedicated experiences:

- **Interns** — onboarding wizard, task workspace, daily logs, weekly reports, certificates
- **Mentors** — assigned intern roster, submission review queue, performance reviews
- **Admins** — full management: applications, interns, mentors, projects, certificates, analytics

Each role gets routed to its own panel by middleware:

- Interns → `/dashboard`
- Mentors → `/mentor`
- Admins → `/admin`

## Features

### For applicants

- 📝 Public multi-step application form — no login required
- 🔍 Application status checker by email
- 📧 Email confirmation on submission

### For interns

- 🚀 Onboarding wizard (profile → tech stack → agreement)
- 📋 Task workspace with file submissions
- 📆 Daily work log
- 📊 Auto-generated weekly reports (PDF + email)
- 🎓 Verifiable certificate + experience letter on completion
- 🔔 Real-time notifications

### For mentors

- 👥 Assigned intern roster with stats
- ✅ Submission review queue (approve / request revision)
- 💬 Feedback threads on every submission
- ⭐ Performance reviews with mentor + peer ratings
- 👤 Own profile management

### For admins

- 📥 Applications inbox with approve / reject
- 🧑‍💼 Intern management (mentor assignment, dates, status)
- 👔 Mentor management (invite flow, assigned interns, overview)
- 📁 Project management (create, assign interns, tasks)
- 📄 Document registry (certificates, letters, revoke/restore)
- 📈 Analytics dashboard (KPIs, charts, log gaps, activity feed)
- 🎓 Certificate issuance (auto-computes performance score)
- 📜 Full audit log of every action

### For the public

- 🏠 Marketing landing page
- 👥 Browsable intern directory (opt-in)
- 🌟 Alumni success stories
- 🔍 Certificate verification at `/verify/[id]`
- 📄 Legal pages (Terms, Privacy, Cookies)

## Tech stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Styling | **Tailwind CSS v4** |
| Icons | **Lucide** |
| Database | **PostgreSQL** via Supabase |
| Auth | **Supabase Auth** (invitation-only) |
| Storage | **Supabase Storage** |
| PDF | `@react-pdf/renderer` |
| QR codes | `qrcode` |
| Charts | `recharts` (lazy-loaded) |
| Email | **Brevo** |
| Hosting | **Vercel** |

## Architecture highlights

- **No public signup** — every account flows through an invitation
- **Row-Level Security** on every table (60+ policies)
- **Middleware role gates** — routes enforce intern / mentor / admin access
- **Automatic activation** — assigning a mentor flips `onboarding → active` via a DB trigger
- **Audit log** — every sensitive action recorded
- **Realtime notifications** — in-app bell updates via Supabase Realtime
- **Data-driven certificates** — performance score computed from real metrics (task completion, submission quality, log consistency, mentor rating)
- **Design system** — hand-rolled UI primitives (`Button`, `Input`, `Card`, `Badge`, `Avatar`, …)
- **Breadcrumbs everywhere** — consistent navigation across panels
- **Accessibility-first** — WCAG AA contrast, ARIA labels, keyboard navigation, `role="alert"` on form errors

## Screenshots

<div align="center">

### Landing page
<img src="https://raw.githubusercontent.com/HERMAN-Software-Solutions/herman-intern-hub/main/public/brand/screenshot-landing.png" alt="Landing page" width="720" />

### Admin dashboard
<img src="https://raw.githubusercontent.com/HERMAN-Software-Solutions/herman-intern-hub/main/public/brand/screenshot-admin.png" alt="Admin dashboard" width="720" />

### Login
<img src="https://raw.githubusercontent.com/HERMAN-Software-Solutions/herman-intern-hub/main/public/brand/screenshot-login.png" alt="Login" width="720" />

</div>

## Quick start

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Brevo](https://brevo.com) account
- A [Vercel](https://vercel.com) account (for deploy)

### 1. Clone

```bash
git clone https://github.com/HERMAN-Software-Solutions/herman-intern-hub.git
cd herman-intern-hub