# Cache — a card catalog for your snippets

Save, tag, and search the code and prompts you keep re-writing from memory. Free plan holds
5 snippets; Pro ($9/mo) is unlimited. Any snippet can be flipped to public and shared with a
single link.

Built with Next.js 14 (App Router), Prisma + Postgres, NextAuth (credentials), Tailwind, and
Stripe in test mode.

## Stack

- **Frontend/Backend:** Next.js 14, React 18, Tailwind CSS
- **Database:** Postgres via Prisma
- **Auth:** NextAuth.js, credentials provider (email + password), JWT sessions
- **Payments:** Stripe Checkout (subscriptions) + webhooks
- **Deploy target:** Railway (free tier), Postgres via Neon

## Project structure

```
app/
  page.tsx                 marketing/landing page
  signup/, login/          auth pages
  dashboard/                the product (snippet CRUD + search)
  billing/                  plan status, upgrade, manage/cancel
  s/[id]/                   public shareable snippet page
  api/
    register/               create account
    auth/[...nextauth]/     NextAuth handler
    snippets/               CRUD, plan-gated on create
    stripe/checkout/        creates a Stripe Checkout session
    stripe/webhook/         handles checkout.session.completed, invoice.paid, subscription updates
    stripe/portal/          Stripe billing portal (manage/cancel)
prisma/schema.prisma        User + Snippet models
lib/                        prisma client, authOptions, stripe client
components/                 shared client components
```

## 1. Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` (see the sections below for where each value comes from), then:

```bash
npx prisma db push   # creates tables in your database
npm run dev
```

Visit http://localhost:3000.

## 2. Free Postgres database (Neon)

1. Go to https://neon.tech → sign up → **New Project**.
2. Copy the **pooled connection string** it gives you.
3. Paste it into `DATABASE_URL` in `.env`.
4. Run `npx prisma db push` to create the tables.

(Supabase's free Postgres works the same way if you'd rather use that.)

## 3. Auth secret

```bash
openssl rand -base64 32
```

Paste the output into `NEXTAUTH_SECRET`. `NEXTAUTH_URL` is `http://localhost:3000` locally
and your live URL once deployed.

## 4. Stripe test mode

1. Create a free account at https://dashboard.stripe.com — stay in **Test mode** (toggle,
   top right).
2. **API keys** (https://dashboard.stripe.com/test/apikeys) → copy the **Secret key** into
   `STRIPE_SECRET_KEY`.
3. **Products** (https://dashboard.stripe.com/test/products) → **Add product** → name it
   "Pro", set a **recurring** price of $9.00/month → save → copy the **Price ID**
   (`price_...`) into `STRIPE_PRO_PRICE_ID`.
4. **Webhooks** (https://dashboard.stripe.com/test/webhooks):
   - While developing locally, easier to use the CLI instead of the dashboard:
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
     This prints a `whsec_...` — put it in `STRIPE_WEBHOOK_SECRET`.
   - For production, add an endpoint pointing at
     `https://YOUR-DOMAIN/api/stripe/webhook`, subscribe it to
     `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, and
     `customer.subscription.deleted`, then copy **that** endpoint's signing secret into
     the production env var.
5. Test card for checkout: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

## 5. Deploy for free (Railway)

1. Push this repo to GitHub.
2. Go to https://railway.app → **New Project** → **Deploy from GitHub repo** → select this
   repo.
3. Railway auto-detects the Next.js app and builds it. Go to the service's **Variables**
   tab and add everything from your `.env`:
   - `DATABASE_URL`, `NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`,
     `STRIPE_WEBHOOK_SECRET` — same values as local
   - `NEXTAUTH_URL` — leave a placeholder for now; you'll set the real value in step 5
4. Go to the service's **Settings → Networking** tab → under "Public Networking," click
   **Generate Domain** if one hasn't been created yet. Copy the domain it gives you, e.g.
   `your-app.up.railway.app`.
5. Back in **Variables**, set `NEXTAUTH_URL` to that domain with `https://` and **no
   trailing slash**, e.g. `https://your-app.up.railway.app`. Save — Railway redeploys
   automatically on variable changes.
6. In Stripe (test mode) → **Developers → Webhooks** → **Add destination** (or "Add
   endpoint" depending on the dashboard version) → set the URL to
   `https://your-app.up.railway.app/api/stripe/webhook` → select events
   `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`,
   `customer.subscription.deleted` → create it. Open the new endpoint, reveal its
   **Signing secret** (`whsec_...`), and put that value — not your local CLI one — into
   Railway's `STRIPE_WEBHOOK_SECRET`, then let it redeploy.
7. Visit your live URL, sign up, and click **Upgrade to Pro** with the Stripe test card
   to confirm the whole loop — checkout → webhook → account upgraded — works end to end.

That's the whole path from `git push` to a public URL with working test-mode payments,
at no cost.

### Troubleshooting a Railway build failure

If the build fails on a security-vulnerability check, it's a flagged dependency version,
not a code issue — bump the affected package in `package.json` to the patched version it
names and redeploy. If the build fails with a prerender error mentioning
`useSearchParams`, any page using that hook needs to be wrapped in a React `<Suspense>`
boundary (already done for `/signup` in this repo, but keep this in mind if you add new
pages that read query params).

### If the live URL won't load in your browser

If the page fails to load with something like `DNS_PROBE_POSSIBLE` but the deployment
shows "Success" in Railway, it's almost always your local network's DNS, not the app —
some school/office networks or VPNs block resolution of unfamiliar domains. Confirm by
running `nslookup your-app.up.railway.app` in a terminal on your own machine (not
Railway's Console tab); a `Query refused` response means switching your network adapter's
DNS to a public resolver (e.g. Cloudflare's `1.1.1.1` / `1.0.0.1`) will fix it.

## Notes on the plan gate

The free plan is capped at 5 snippets (`FREE_PLAN_SNIPPET_LIMIT` in `lib/stripe.ts`). The
cap is enforced server-side in `app/api/snippets/route.ts`, not just hidden in the UI, so
it can't be bypassed by calling the API directly. When `checkout.session.completed` (or a
later `invoice.paid` / `customer.subscription.updated`) fires, the webhook updates the
user's `plan` field in the database — that's the one place plan state is read from, so
Stripe and the app never disagree about what a user is entitled to.
