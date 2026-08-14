# SnippetVault — a card catalog for your snippets

Save, tag, and search the code and prompts you keep re-writing from memory. Free plan holds
5 snippets; Pro ($9/mo) is unlimited. Any snippet can be flipped to public and shared with a
single link.

Built with Next.js 14 (App Router), Prisma + Postgres, NextAuth (credentials), Tailwind, and
Stripe in test mode.

## Stack

- **Frontend/Backend:** Next.js 14, React 18, Tailwind CSS
- **Database:** Postgres via Prisma (Neon / Supabase)
- **Auth:** NextAuth.js (credentials & OTP), JWT sessions
- **Payments:** Stripe Checkout (subscriptions) + webhooks
- **Email:** Resend API or SMTP (for OTP verification)
- **Deploy target:** Vercel (Hobby / Free plan)

## Project structure

```
app/
  page.tsx                 marketing/landing page
  signup/, login/          auth pages (password + OTP support)
  dashboard/                the product (snippet CRUD + search)
  billing/                  plan status, upgrade, manage/cancel
  s/[id]/                   public shareable snippet page
  api/
    register/               create account
    auth/[...nextauth]/     NextAuth handler
    auth/send-otp/          generate & dispatch OTP codes
    snippets/               CRUD, plan-gated on create
    stripe/checkout/        creates a Stripe Checkout session
    stripe/webhook/         handles checkout.session.completed, invoice.paid, subscription updates
    stripe/portal/          Stripe billing portal (manage/cancel)
prisma/schema.prisma        User, OtpToken, Snippet models
lib/                        prisma client, authOptions, email, stripe client
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
2. Copy the **Pooled connection string** (ends with `?sslmode=require`).
3. Paste it into `DATABASE_URL` in `.env`.
4. Run `npx prisma db push` to create the tables in your database.

*(Supabase's free Postgres or any standard Postgres service works the same way).*

## 3. Auth secret

Generate a 32-byte secret:

```bash
openssl rand -base64 32
```

Paste the output into `NEXTAUTH_SECRET`. Set `NEXTAUTH_URL` to `http://localhost:3000` for local dev.

## 4. Email (Resend) for OTP verification

1. Sign up for free at https://resend.com.
2. Go to **API Keys** → create key → paste into `RESEND_API_KEY`.
3. Set `RESEND_FROM="SnippetVault <onboarding@resend.dev>"` (or your verified domain).

## 5. Stripe test mode

1. Create a free account at https://dashboard.stripe.com — stay in **Test mode** (toggle at top right).
2. **API keys** (https://dashboard.stripe.com/test/apikeys) → copy the **Secret key** into `STRIPE_SECRET_KEY`.
3. **Products** (https://dashboard.stripe.com/test/products) → **Add product** → name it "Pro", set a **recurring** price of $9.00/month → save → copy the **Price ID** (`price_...`) into `STRIPE_PRO_PRICE_ID`.
4. **Webhooks** (https://dashboard.stripe.com/test/webhooks):
   - **Local testing via CLI**:
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
     Copy the `whsec_...` into `STRIPE_WEBHOOK_SECRET`.
   - **Production Vercel URL**:
     Once deployed on Vercel, create a webhook endpoint in Stripe pointing to:
     `https://<your-vercel-domain>.vercel.app/api/stripe/webhook`
     Subscribe to:
     `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`.
     Copy its signing secret (`whsec_...`) into Vercel's `STRIPE_WEBHOOK_SECRET`.
5. Test card for checkout: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

## 6. Deploy for free to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```
2. Go to https://vercel.com → Log in → click **Add New...** → **Project**.
3. Import your GitHub repository (`palakharinkhede4/snippetvault`).
4. In the **Configure Project** screen, expand **Environment Variables** and add:
   - `DATABASE_URL`: Your Neon Postgres pooled connection URL
   - `NEXTAUTH_SECRET`: Random 32-character string (`openssl rand -base64 32`)
   - `NEXTAUTH_URL`: `https://your-project-name.vercel.app` (your Vercel project URL)
   - `STRIPE_SECRET_KEY`: `sk_test_...`
   - `STRIPE_PRO_PRICE_ID`: `price_...`
   - `STRIPE_WEBHOOK_SECRET`: `whsec_...` (from Stripe Webhooks step)
   - `RESEND_API_KEY`: `re_...`
   - `RESEND_FROM`: `SnippetVault <onboarding@resend.dev>`
5. Click **Deploy**. Vercel will automatically run `prisma generate` and build the Next.js app.
6. Once deployed, copy your assigned Vercel URL (e.g., `https://snippetvault.vercel.app`):
   - Ensure `NEXTAUTH_URL` matches this exact domain (no trailing slash).
   - In your Stripe Dashboard, update/add the webhook endpoint for `https://<your-domain>.vercel.app/api/stripe/webhook`.
7. Visit your live site, sign up / log in with OTP verification, and test snippet creation and Pro upgrade!

## Notes on the plan gate

The free plan is capped at 5 snippets (`FREE_PLAN_SNIPPET_LIMIT` in `lib/stripe.ts`). The cap is enforced server-side in `app/api/snippets/route.ts`. When Stripe webhook events fire, the user's `plan` field in Postgres is updated directly so Stripe and the app stay in sync.

