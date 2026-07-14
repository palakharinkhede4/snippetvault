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
- **Deploy target:** Vercel + Neon (both free tiers)

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

## 5. Deploy for free (Vercel)

1. Push this repo to GitHub.
2. Go to https://vercel.com → **Add New Project** → import the repo.
3. In **Environment Variables**, add everything from your `.env` — but set
   `NEXTAUTH_URL` to the URL Vercel will give you, e.g.
   `https://your-app.vercel.app` (you can add/edit it after the first deploy once you
   know the final URL).
4. Deploy.
5. Once live, go back to Stripe → Webhooks → add the production endpoint described in
   step 4 above, using your real Vercel URL, and update `STRIPE_WEBHOOK_SECRET` in
   Vercel's env vars to match, then redeploy.
6. Visit your live URL, sign up, and click **Upgrade to Pro** with the Stripe test card
   to confirm the whole loop — checkout → webhook → account upgraded — works end to end.

That's the whole path from `git push` to a public URL with working test-mode payments,
at no cost.

## Notes on the plan gate

The free plan is capped at 5 snippets (`FREE_PLAN_SNIPPET_LIMIT` in `lib/stripe.ts`). The
cap is enforced server-side in `app/api/snippets/route.ts`, not just hidden in the UI, so
it can't be bypassed by calling the API directly. When `checkout.session.completed` (or a
later `invoice.paid` / `customer.subscription.updated`) fires, the webhook updates the
user's `plan` field in the database — that's the one place plan state is read from, so
Stripe and the app never disagree about what a user is entitled to.
