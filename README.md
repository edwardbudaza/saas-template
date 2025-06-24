# 🚀 T3 SaaS Boilerplate

This is a modern, extensible, and secure SaaS starter built with the **T3 Stack**: **Next.js (App Router)**, **TypeScript**, **TailwindCSS**, **Prisma**, **Auth.js**, and **LemonSqueezy** for billing.

> Designed to **kickstart SaaS products** quickly with robust authentication, credits system, billing flow, protected routes, and clean UI components.

---

## 📁 Project Structure

```
.
├── prisma/                 # Prisma DB schema and SQLite DB
├── public/                 # Public static assets
├── src/
│   ├── actions/            # Server Actions (e.g. billing logic)
│   ├── app/                # App Router structure (auth, billing pages, API)
│   ├── components/         # UI components and feature-specific components
│   ├── env.js              # Runtime environment variables
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility and integration libraries (e.g. LemonSqueezy)
│   ├── server/             # Server-only modules (auth, DB)
│   └── styles/             # Global styles (Tailwind)
├── .env                    # Environment variables
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

---

## ✅ Features

### 🧠 Core

* 🔐 Auth.js with **NextAuth** (Credentials + Socials ready)
* 🎟️ **Credits system** for usage-based billing
* 💳 LemonSqueezy Webhook + Checkout integration
* 📦 Prisma ORM with SQLite (local) or MySQL (prod)
* ✨ ShadCN UI components (customizable)

### 📦 Billing System

* `createCheckoutAction()` server action creates dynamic checkout links
* Webhook handler (`/api/lemonsqueezy/webhook`) listens to order events
* Credits are **added**, **deducted**, or **refunded**
* `/billing/success` page confirms new credits and shows recent order

### 🔒 Authentication

* Custom credentials flow (`/api/auth/signup`)
* Protected routes using:

  * `auth()` in `layout.tsx`
  * `<AuthProvider>` and `useRequireAuth()` hook

### 🧩 Modular Design

* Hooks like `useAuth`, `useMobile`, `useAuthAction`
* UI/UX encapsulated into composable components
* Easy to plug in new pages or features

---

## 🚧 How It Works (Behind the Scenes)

### Auth

* Defined in `src/server/auth/config.ts`
* Session middleware checks for auth on all pages
* Signup uses bcrypt and zod for validation

### Billing

* Pages: `/billing`, `/billing/success`
* Components: `PricingCards`, `CheckoutForm`
* Checkout: calls `createCheckoutAction` → LemonSqueezy URL
* Webhook:

  * Validates request with HMAC-SHA256
  * Increments/decrements credits
  * Records orders in `lemonSqueezyOrder` table

### Credits Enforcement

Use server actions like:

```ts
await consumeCredits(5, "AI Tool Usage");
```

It validates balance, updates the DB, and optionally redirects or throws.

---

## 🧪 Local Development

### Setup

```bash
git clone https://github.com/your-username/your-saas-boilerplate.git
cd your-saas-boilerplate
npm install
```

### .env File

Create `.env`:

```env
DATABASE_URL="file:./db.sqlite"
AUTH_SECRET="your-long-random-secret"
LEMONSQUEEZY_API_KEY="..."
LEMONSQUEEZY_STORE_ID="..."
LEMONSQUEEZY_WEBHOOK_SECRET="..."
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Run Locally

```bash
npx prisma migrate dev
npm run dev
```

---

## 🧱 Cloning for a New SaaS Idea

1. **Rename project**

   * Change name in `package.json` and metadata in `src/app/layout.tsx`

2. **Reset DB**

   ```bash
   rm prisma/db.sqlite
   npx prisma migrate reset
   ```

3. **Adjust features**

   * Remove or replace billing if not needed
   * Add new routes under `src/app/(main)/your-feature`
   * Extend credit logic in `actions/lemonsqueezy.ts`

4. **Reuse UI**

   * `components/ui` includes reusable elements (button, modal, card, etc.)
   * Customize theme, branding, layout as needed

---

## 🛠️ Commands

| Command                  | Description               |
| ------------------------ | ------------------------- |
| `npm run dev`            | Start development server  |
| `npm run build`          | Build for production      |
| `npm run lint`           | Run ESLint                |
| `npx prisma studio`      | Explore DB in web UI      |
| `npx prisma migrate dev` | Run migrations (dev only) |

---

## 📌 Notes for Future Upgrades

* Replace SQLite with PostgreSQL or MySQL by updating `DATABASE_URL` and running `prisma migrate`.
* Replace LemonSqueezy with Stripe (credit logic remains the same).
* Easily add onboarding, teams, subscriptions, or usage limits.
* Move to **Vercel** or **Render** for deployment (Edge-ready).
* Add Vite, TurboRepo, or bun for performance, if needed.

---

## 📄 License

MIT — free to use, clone, and modify for personal or commercial use.

---

## ✍️ Author Notes

This project is built to **scale and pivot fast**. You can:

* Reuse components for multiple SaaS ideas.
* Keep it as a monorepo or extract modules.
* Clone and swap out backend tools (e.g., Stripe, Supabase).
* Focus on features while skipping boilerplate and auth headaches.

> *“This is your launchpad. Build fast, fail fast, and ship something valuable.”*

---
