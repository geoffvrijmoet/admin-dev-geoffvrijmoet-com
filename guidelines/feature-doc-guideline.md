# Project Overview
Use this guide to build a web app that allows me to manage the backend of my web development freelance business.

# Feature Requirements
- The web app will be hosted at admin.dev.geoffvrijmoet.com.
- The web app should connect to Google Sheets and we will use one main sheet (its ID is KQuMYcmJz41S22PWmQvMG19N5la8KeZXOvbgo8kdLmQ) for keeping track of data such as how many hours I've worked on a project, how much has been invoiced for a project, how much has been paid for a project, etc.
- The web app should connect to Stripe and we will use one main account for keeping track of data such as how much has been invoiced for a project, how much has been paid for a project, etc.
- The web app should have lightning-fast performance.
- The entire app should be extremely mobile-friendly.
- We will use Next.js, Shadcn, Lucid, Clerk, MongoDB, and Tailwind CSS to build the app.

# Relevant Docs
This is the reference documentation for Clerk: https://clerk.com/docs/references/nextjs/

# Current File Structure
ADMIN-DEV-GEOFFVRIJMOET-COM/
├── app/
│   ├── fonts/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── guidelines/
│   └── feature-doc-guideline.md
├── lib/
├── node_modules/
├── .cursorrules
├── .eslintrc.json
├── .gitignore
├── components.json
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json

# Rules
- All new components should go in /components and be named like example-component.tsx unless otherwise specified.
- All new pages go in /app.