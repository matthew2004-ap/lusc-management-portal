# LUSC Portal — Fresh PostgreSQL Database Setup (Windows)

This guide is for a **new, empty PostgreSQL database**. It does not delete or reset any existing database.

## 1. Create a new PostgreSQL database

Use your PostgreSQL provider (for example, Prisma Postgres) and create a brand-new database/project for the LUSC Management Portal. Give it a clear name such as `lusc-management-portal-prod` or `lusc-management-portal-dev`. Do not reuse the previous database if you intend to start with a clean database.

Copy both PostgreSQL connection strings if your provider supplies them. This project uses `DATABASE_URL` (pooled) for normal application traffic and `DIRECT_URL` (direct) for Prisma migration operations. Prisma Postgres provides both; use the matching values from the same newly created database.

## 2. Configure the project

Open the project folder in VS Code. In the terminal run:

```bat
copy .env.example .env
```

Open `.env` and set:

```env
DATABASE_URL="YOUR_NEW_POOLED_POSTGRESQL_CONNECTION_STRING"
DIRECT_URL="YOUR_NEW_DIRECT_POSTGRESQL_CONNECTION_STRING"
AUTH_SECRET="A_PRIVATE_RANDOM_SECRET_AT_LEAST_32_CHARACTERS_LONG"
APP_URL="http://localhost:3000"
TENURE_YEAR="2026"
```

Use a new `AUTH_SECRET`. Do not paste `.env` into chats, GitHub, or screenshots.

## 3. Install and apply the schema

```bat
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma validate
```

`migrate deploy` applies the committed migration files in order to the new, empty database. It does not create sample applicants or dummy members. Do not use `prisma migrate reset` as a routine setup command.

## 4. Create the first administrator

```bat
npm run admin:create
```

Enter the real administrator's name, official email and a strong password of at least 12 characters. The script creates the first `ADMIN` account directly because no administrator exists yet to approve it. It refuses to create another bootstrap administrator once one exists.

Then start the portal:

```bat
npm run dev
```

Open `http://localhost:3000` and sign in using the administrator account.

## 5. Set up VCM and VCF office accounts

1. Create a separate account for each office-holder using the registration page.
2. Sign in as the administrator.
3. Open **Administration → Authorized office accounts**.
4. Change the appropriate account permission to `VCM` or `VCF`, then save.
5. Sign out and have the office-holder sign in again.

Only the administrator can assign these permissions. VCM, VCF and ADMIN can review pending applications; either VCM or VCF can independently approve or reject an application.

## 6. Main application flows

- New applicants create accounts and are signed in automatically to their dashboard. Their applications begin as `PENDING`.
- The VCM, VCF or ADMIN reviews applications in **Approval Queue**.
- Approval creates a unique LUSC membership ID and sends an in-app notification.
- Applicants and members can message ADMIN, VCM or VCF from **Messages**. Management can reply; the conversation is saved in PostgreSQL and a notification is created for the recipient.
- Admin controls ID-card and appointment-letter issuance. The completion certificate becomes available only after tenure is marked complete and the certificate is issued.
- The certificate prints in A4 landscape. The member ID card prints in landscape wallet-card dimensions.

## Security and deployment notes

- Keep database credentials and `AUTH_SECRET` private. Rotate any credentials that may have been included in an uploaded archive.
- Back up the database before any production migration.
- For production hosting, replace local `public/uploads` image storage with durable private object storage.
- The printable ID card and certificate are portal-generated documents. They are not cryptographically signed; LUSC must approve the official crest, final wording, signatures and signatory names before institutional issuance.
