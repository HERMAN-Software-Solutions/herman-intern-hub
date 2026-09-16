# Certificate Specification

Design and generation spec for HERMAN Intern Hub completion certificates.

**Version:** 1.0
**Status:** Design finalized — ready for Phase 2 build
**Owner:** HERMAN Software Solutions Limited
**Last updated:** 2026-09-16

---

## 1. Purpose

Every intern who completes a HERMAN internship receives a **verifiable, data-driven certificate** showing:

- That they completed the internship
- What they actually worked on
- How they performed (measured, not arbitrary)
- Who mentored them
- Company authenticity

The certificate must feel like a document worth framing — not a printed Word template.

---

## 2. Design Principles

| Principle | Meaning |
|---|---|
| **Data-driven** | Every number comes from real system data, not admin typing |
| **Verifiable** | Unique ID + public verification URL |
| **Professional** | Company branding, signatures, official seal |
| **Legible** | Readable when printed at A4 |
| **Exportable** | One click → PDF, stored securely, shareable |
| **Transparent** | Intern sees their own score before/after issuance |

---

## 3. Certificate Layout

**Format:** A4 Landscape (297mm × 210mm)
**Orientation:** Landscape
**Margins:** 15mm

### 3.1 Sections (top to bottom)
┌─────────────────────────────────────────────────────────────┐
│ HEADER │
│ [HERMAN LOGO] Issue Date: YYYY-MM-DD │
│ HERMAN Software Solutions Limited │
│ Jinja, Gabula Rd, Uganda │
├─────────────────────────────────────────────────────────────┤
│ TITLE │
│ CERTIFICATE OF INTERNSHIP │
├─────────────────────────────────────────────────────────────┤
│ BODY │
│ This is to certify that │
│ │
│ [INTERN FULL NAME] │
│ │
│ has successfully completed a [DURATION]-week │
│ internship in [TRACK] at HERMAN Software │
│ Solutions Limited, from [START] to [END]. │
├─────────────────────────────────────────────────────────────┤
│ PERFORMANCE SUMMARY (table) │
│ Overall Rating ⭐⭐⭐⭐⭐ Excellent (4.8 / 5.0) │
│ Task Completion 24 of 26 tasks (92%) │
│ Consistency 58 of 60 days logged (97%) │
│ Mentor Assessment Exceeds expectations │
├─────────────────────────────────────────────────────────────┤
│ KEY CONTRIBUTIONS (bulleted list) │
│ ▪ Migrated 40+ pages to modern CMS architecture │
│ ▪ Built real-time vote tallying feature │
│ ▪ Improved Lighthouse score from 62 to 94 │
│ ▪ Led frontend team of 2 interns │
├─────────────────────────────────────────────────────────────┤
│ SIGNATURES │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ [sig] │ │ [sig] │ │ [seal] │ │
│ │ Name │ │ Name │ │ HERMAN │ │
│ │ CEO │ │ Mentor │ │ Official │ │
│ └──────────┘ └──────────┘ └──────────┘ │
├─────────────────────────────────────────────────────────────┤
│ FOOTER │
│ Certificate ID: HRM-YYYY-NNNN │
│ Verify at: interns.hermansoftware.com/verify/HRM-YYYY-NNNN │
│ [QR CODE] │
└─────────────────────────────────────────────────────────────┘

text

---

## 4. Data Sources

Every field comes from the database:

| Certificate Field | Source |
|---|---|
| Intern full name | `profiles.full_name` |
| Duration (weeks) | `(profiles.end_date - profiles.start_date) / 7` |
| Track | Primary from `intern_tech_stacks` where `is_primary = true` |
| Start date | `profiles.start_date` |
| End date | `profiles.end_date` |
| Overall rating | Computed (see §6) |
| Task completion | `COUNT(tasks where status='done') / COUNT(tasks assigned)` |
| Consistency | `COUNT(daily_logs) / working_days_in_period` |
| Mentor assessment | `performance_reviews.strengths` (short version) |
| Key contributions | Aggregated from `submissions` + `tasks` (top 5 marked as highlights) |
| Mentor name | `profiles.mentor_id → profiles.full_name` |
| CEO name | Config — `HERMAN_CEO_NAME` env var (default: "Robert Kisitu") |
| Issue date | `documents.issued_date` (today at generation) |
| Certificate ID | Generated (see §7) |

---

## 5. Rating Bands

| Score | Rating | Stars | Color |
|---|---|---|---|
| 4.5 – 5.0 | Excellent | ⭐⭐⭐⭐⭐ | `#16A34A` (green) |
| 3.5 – 4.4 | Very Good | ⭐⭐⭐⭐ | `#2563EB` (blue) |
| 2.5 – 3.4 | Good | ⭐⭐⭐ | `#CA8A04` (amber) |
| 1.5 – 2.4 | Satisfactory | ⭐⭐ | `#EA580C` (orange) |
| 0 – 1.4 | Needs Improvement | ⭐ | `#DC2626` (red) |

---

## 6. Performance Score Formula
score = (task_completion_rate × 0.30)

(submission_quality_rate × 0.25)

(log_consistency_rate × 0.15)

(mentor_rating / 5 × 0.20)

(peer_rating / 5 × 0.10)

final = round(score × 5, 1) // out of 5.0

text

Where:

- **task_completion_rate** = tasks completed ÷ tasks assigned
- **submission_quality_rate** = submissions approved on first try ÷ total submissions
- **log_consistency_rate** = days logged ÷ working days in internship period
- **mentor_rating** = 1–5 from `performance_reviews.mentor_rating` (required)
- **peer_rating** = 1–5 from `performance_reviews.peer_rating` (optional, defaults to mentor_rating if missing)

**Rounding:** one decimal place (e.g. 4.8, 3.2).

**Missing data rule:** if `mentor_rating` is missing, certificate **cannot be issued** — admin must prompt mentor first.

---

## 7. Certificate ID Format
HRM-YYYY-NNNN

text

- `HRM` — fixed prefix
- `YYYY` — issue year
- `NNNN` — sequential, zero-padded, resets each year

**Sequence source:** `certificate_id_seq` (Postgres sequence)

**Uniqueness:** enforced by `documents.certificate_id UNIQUE` constraint

**Examples:**
- `HRM-2026-0001`
- `HRM-2026-0042`
- `HRM-2027-0001`

---

## 8. Visual Design

### 8.1 Colors

| Element | Hex | Purpose |
|---|---|---|
| Primary text | `#0F172A` | Names, headings |
| Secondary text | `#64748B` | Labels, meta |
| Border | `#E2E8F0` | Section dividers |
| Background | `#FFFFFF` | Page |
| Accent (frame) | `#0F172A` | Outer border |
| Header rule | `#0F172A` | Under company name |
| Seal | `#B45309` | Official seal |

### 8.2 Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Company name | Inter | 14pt | 600 |
| Company address | Inter | 9pt | 400 |
| Certificate title | Georgia / Serif | 28pt | 700 |
| "This is to certify" | Inter | 12pt | 400 |
| Intern name | Georgia / Serif | 26pt | 700 |
| Body text | Inter | 11pt | 400 |
| Section headers | Inter | 9pt | 700 (uppercase, letter-spacing) |
| Performance rows | Inter | 11pt | 400 |
| Signatures | Inter | 10pt | 400 |
| Footer | Inter | 8pt | 400 |

### 8.3 Logo

- Path: `public/brand/logo.png`
- Size: 1000×1000
- Rendered at: 40mm × 40mm, top-left of header
- Maintains aspect ratio

---

## 9. Supporting Documents

When a certificate is issued, the system **also generates**:

| Document | Purpose | Auto-sent |
|---|---|---|
| **Experience Letter** | Formal letter on company letterhead for job applications | Yes (email) |
| **Performance Report** | 2-page detailed breakdown (all metrics, all feedback) | On request |
| **Appendix** | Full list of every task completed + project + dates | On request |

All stored in Supabase Storage bucket `documents` with signed URLs.

---

## 10. Verification

Every certificate has a **public verification page**:
/verify/[certificateId]

text

Example: `https://interns.hermansoftware.com/verify/HRM-2026-0001`

**Public (no login).** Shows:
┌──────────────────────────────────────────┐
│ ✅ Certificate Verified │
│ │
│ Certificate ID: HRM-2026-0001 │
│ Issued to: Jane Nakato │
│ Issued by: HERMAN Software Ltd │
│ Issued on: 2026-12-01 │
│ Performance: Excellent (4.8 / 5.0) │
│ │
│ This certificate is authentic. │
│ │
│ [View original PDF] │
└──────────────────────────────────────────┘

text

**If invalid:** shows a clear "not found" message.

**QR code** on the certificate links to this page.

---

## 11. Generation Flow
Admin opens /admin/interns/[id]

Clicks [Issue Certificate]

System checks:

Intern status is 'completed' or 'active'

performance_reviews row exists with mentor_rating

No certificate already issued

System computes score → 4.8

System generates certificate ID → HRM-2026-0001

System renders PDF via @react-pdf/renderer

System uploads to Supabase Storage → documents/certificates/HRM-2026-0001.pdf

System inserts row in documents table

System sends email to intern with link

System logs to audit_log

Admin sees success + downloadable link

text

**Idempotency:** if certificate exists, admin sees a "View" button instead of "Issue".

---

## 12. Email Notification

**Subject:** `Your HERMAN internship certificate is ready 🎓`

**Body:**

- Congratulations message
- Certificate ID
- Download link (signed URL, valid 30 days)
- Verification URL (permanent)
- Invitation to share on LinkedIn

Uses Brevo, same template system as other emails.

---

## 13. File Structure
src/
├── lib/
│ └── certificates/
│ ├── compute-score.ts # Performance score logic
│ ├── generate-id.ts # HRM-YYYY-NNNN generator
│ ├── generate-pdf.ts # Renders + uploads
│ └── template/
│ ├── certificate.tsx # @react-pdf layout
│ ├── header.tsx
│ ├── performance.tsx
│ ├── contributions.tsx
│ └── signatures.tsx
├── app/
│ ├── admin/
│ │ └── interns/[id]/
│ │ └── issue-certificate/
│ │ └── route.ts # POST endpoint
│ └── verify/
│ └── [certificateId]/
│ └── page.tsx # Public verification

text

---

## 14. Database Changes Required

### New table: `performance_reviews`

```sql
CREATE TABLE performance_reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id         UUID NOT NULL REFERENCES profiles(id),
  mentor_rating     NUMERIC(2,1) NOT NULL CHECK (mentor_rating BETWEEN 1 AND 5),
  peer_rating       NUMERIC(2,1) CHECK (peer_rating BETWEEN 1 AND 5),
  strengths         TEXT,
  improvements      TEXT,
  comments          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (intern_id)
);

CREATE INDEX idx_perf_reviews_intern ON performance_reviews(intern_id);
Extend documents
sql
ALTER TABLE documents ADD COLUMN certificate_id TEXT UNIQUE;
ALTER TABLE documents ADD COLUMN performance_score NUMERIC(3,1);
ALTER TABLE documents ADD COLUMN verified BOOLEAN NOT NULL DEFAULT FALSE;

CREATE SEQUENCE IF NOT EXISTS certificate_id_seq START 1;
Add is_highlight to tasks
sql
ALTER TABLE tasks ADD COLUMN is_highlight BOOLEAN NOT NULL DEFAULT FALSE;
Admin or mentor marks up to 5 tasks as "highlights" — these appear in "Key Contributions".

15. Edge Cases
Case	Behavior
No tasks completed	Certificate still issues but shows "0 of 0 tasks"
No daily logs	Consistency shows "—"
No mentor assigned	Certificate cannot be issued — show error
No performance review	Admin sees "Prompt mentor to complete review" button
Certificate already exists	Show "View" + "Revoke" instead of "Issue"
Score computation fails	Log error, don't issue, alert admin
Intern withdrawn	No certificate
Intern paused	No certificate until resumed + completed
16. Future Enhancements
Blockchain verification — hash stored on-chain (Phase 4)

LinkedIn integration — one-click "Add to profile"

Multi-language — English, French, Swahili

Custom branding — logo overrides per certificate type

Digital signature — PKI-signed PDFs

Bulk issuance — issue certificates for entire cohort at once

17. References
Spec: SPEC.md

Data model: docs/data-model.md

Brand: docs/brand.md

Wireframes: docs/wireframes.md

© HERMAN Software Solutions Limited — Jinja, Gabula Rd, Uganda
Contact: infohermansoftware@gmail.com · +256 772 723 188