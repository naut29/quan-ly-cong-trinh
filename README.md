# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Contact form email (Cloudflare Pages + Resend)

The `/contact` page submits to the Cloudflare Pages Function endpoint:
`POST /api/contact` (`functions/api/contact.ts`).

Set these environment variables in Cloudflare Pages:

- `RESEND_API_KEY` (required)
- `CONTACT_TO_EMAIL` (optional, default `contact@quanlycongtrinh.com`)
- `CONTACT_FROM_EMAIL` (optional, default `no-reply@quanlycongtrinh.com`)

Cloudflare Pages dashboard path:
`Workers & Pages` -> `<your-project>` -> `Settings` -> `Environment variables`.

## Environment variables (Supabase + Demo mode)

Client-side variables for Vite (set in Cloudflare Pages for both `Production` and `Preview`):

- `VITE_SUPABASE_URL` (required)
- `VITE_SUPABASE_ANON_KEY` (required)
- `VITE_DEMO_MODE` (optional, default `false` in production; set `true` only for explicit demo build)

Server-side variables (never expose to browser):

- `SUPABASE_SERVICE_ROLE_KEY` (only for server/edge functions, not in Vite client env)

CI/CD (GitHub Actions secrets):

- `SUPABASE_ACCESS_TOKEN` (required for `supabase db push` in CI)
- `SUPABASE_PROJECT_REF` (recommended)
- `SUPABASE_DB_PASSWORD` (if your workflow requires database password auth)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.



## Trial form worker (Cloudflare)

A minimal Worker to handle `/api/trial` submissions and send email via Resend is included at:
`workers/trial-form/index.ts`.

Deployment steps:

1) Create a Cloudflare Worker and set the route to `quanlycongtrinh.com/api/*`.
2) Set secrets (Worker environment variables):
   - `RESEND_API_KEY`
   - `TO_EMAIL=contact@quanlycongtrinh.com`
   - `FROM_EMAIL` (must be a verified sender)
3) Deploy the worker:

```sh
wrangler deploy
```


## Trial API worker (Cloudflare)

A Worker example to handle `/api/trial` submissions is included at:
`workers/trial-api/index.ts`.

Deployment steps:

1) Create a Cloudflare Worker and set the route to `quanlycongtrinh.com/api/*`.
2) Set secrets (Worker environment variables):
   - `RESEND_API_KEY`
   - `TO_EMAIL=contact@quanlycongtrinh.com`
   - `FROM_EMAIL` (verified sender)
3) Deploy the worker:

```sh
wrangler deploy
```
