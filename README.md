# LUSC Management Portal

A full-stack Landmark University Student Council membership portal with a browser interface and an Electron desktop wrapper.

## Included in this revision
- Applicant registration with a free-text position field and suggestions from the existing council role list.
- Applicants may enter a new position; the system creates a role entry when needed. The designation is displayed as `LUSC / [POSITION]`.
- Applicant/member dashboard showing current application status, approved role and official membership ID.
- Member profile photo upload (local development storage only).
- Independent VCM and VCF application decisions; either authorised office can approve or reject a pending application.
- Unique membership IDs generated transactionally by role code and tenure year.
- Admin member search by name, email, role or official membership ID; CSV export.
- Admin ratings and tenure-completion controls.
- Admin-controlled issuance flags for appointment letters, ID cards and end-of-tenure certificates. Applicants can view/print only documents that the administrator has issued; certificates also require tenure completion.
- Audit log entries for approval decisions and member/document updates.
- No seeded/demo member records or default council office accounts.

## Technology
- Next.js App Router + TypeScript
- PostgreSQL + Prisma
- bcrypt password hashing and signed HTTP-only session cookies
- Electron desktop wrapper

## Setup / update on Windows
1. Extract the ZIP and open `lusc-management-portal` in VS Code.
2. Open Terminal → New Terminal.
3. Run `npm install`.
4. If `.env` does not exist, run `copy .env.example .env`.
5. Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (32+ random characters), `APP_URL`, and `TENURE_YEAR` in `.env`. Use the pooled connection for `DATABASE_URL` and the direct connection for `DIRECT_URL`. Do not share `.env` or its secrets.
6. Run `npx prisma generate`.
7. For a brand-new empty PostgreSQL database, run `npx prisma migrate deploy` to apply the complete migration history. For an existing database containing records, back it up first and use `npx prisma migrate dev` only after reviewing the migration plan. Never run `migrate reset` against real records.
8. Run `npx prisma generate`.
9. Create the first administrator with `npm run admin:create`. This bootstrap command creates the initial ADMIN account directly; it does not require an existing administrator to approve it. Keep the terminal and database credentials private.
9. Run `npm run dev` and open `http://localhost:3000`.

## Desktop
With the web server running, open another terminal and run `npm run desktop`. For local development in one command, run `npm run desktop:dev`.

## Important role policy
Many people may legitimately hold the same general position (for example, multiple College Representatives or Hostel Representatives). Therefore the system permits multiple members to select the same role title. Membership IDs remain unique. If LUSC requires each seat to be unique, define the seat more precisely (for example, `College Representative — College of Science`) and have the administrator approve the role dictionary. Do not globally enforce unique role titles without resolving this policy.

## Before official deployment
- Move profile images to durable private object storage; `public/uploads` is only for local development and is not suitable for serverless hosting.
- Add institutional email verification, password reset, rate limiting, CSRF/origin protection, security headers and an independent security review.
- Add secure private storage and final PDF issuance/signature workflow for official documents. Current documents are printable portal views gated by admin issuance flags, not cryptographically signed institutional PDFs. The certificate is landscape A4 and the ID card is landscape wallet-card size. Official crest, signatures and signatory names still require approval from LUSC.
- Confirm official role names/codes, tenure year, crest, approved document wording and signatories.
- Member-to-management messaging, persistent message history and in-app notifications are included. Messaging is one-to-one; applicants may contact ADMIN, VCM or VCF, while management may reply to member accounts.
- Configure database backups, monitoring, privacy notice, data-retention policy and incident response.

## Status
This is an enhanced development build, not a certified production release. Run the Prisma generation/migration and test the flows locally before using it for actual council records. The official crest, approved document wording, signatures and authorised signatory details must be supplied by LUSC; they are not fabricated here.
