# test-nextjs

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_g37n5Yj1sEUZ50Bx3YWFfil5Fmrn)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

## Project Architecture

```text
.
├── .env
├── .env.example
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── app
│   ├── api
│   │   ├── ingest
│   │   ├── logs
│   │   └── secure
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── protected
│       └── dashboard
├── components.json
├── components
│   └── ui
│       └── button.tsx
├── drizzle.config.ts
├── drizzle
│   ├── 0000_brave_black_knight.sql
│   └── meta
│       ├── 0000_snapshot.json
│       └── _journal.json
├── lib
│   ├── db
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── ingestion
│   │   ├── normalize.ts
│   │   ├── sync.ts
│   │   └── types.ts
│   └── utils.ts
├── lighthouse-a11y-report.json
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── public
│   ├── apple-icon.png
│   ├── icon-dark-32x32.png
│   ├── icon-light-32x32.png
│   ├── icon.svg
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
└── tsconfig.json
```
