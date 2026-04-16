This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database Backups

The app uses MongoDB Atlas. On the free tier, the practical backup path is a local
`mongodump` archive.

### Prerequisites

Install MongoDB Database Tools so `mongodump` is available:

```bash
brew tap mongodb/brew
brew install mongodb-database-tools
```

### Create a backup

From the repo root:

```bash
npm run backup:db
```

This script:

- loads `MONGODB_URI` from `.env.local` or `.env`
- creates a local `backups/` directory if needed
- writes a compressed archive like `backups/archery-backup-20260416-171847.archive`

### Validate a backup

Basic checks:

```bash
ls -lh backups
gzip -t < backups/your-backup-file.archive && echo "gzip ok"
```

Best validation is a test restore into a temporary database:

```bash
set -a
source .env
set +a

mongorestore \
  --uri "$MONGODB_URI" \
  --archive="backups/your-backup-file.archive" \
  --gzip \
  --nsFrom="archery_db_dev.*" \
  --nsTo="archery_db_restore_check_$(date +%Y%m%d).*"
```

### Weekly automatic backups

Yes, weekly backups are possible.

The simplest approach on a Mac is to schedule the repo script with `launchd` or a
cron job so it runs weekly and writes into `backups/` or another synced folder.

Example weekly cron entry:

```cron
0 7 * * 1 cd /absolute/path/to/archery-score-site && npm run backup:db >> /tmp/archery-backup.log 2>&1
```

Recommended follow-up if you automate this:

- store backups somewhere outside the repo folder long term
- rotate old archives so disk usage does not grow forever
- occasionally test a restore, not just backup creation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
