# Paymino — Frontend (Nuxt 4 + Vue 3)

Persian (RTL) storefront for gift cards, account recharge and international digital subscriptions, paid with crypto.
This repo is the **frontend only**. It ships with a **mock API** (Nitro server routes) shaped exactly like the planned
Django REST API, so the UI is fully clickable now and switches to Django with one environment variable.

## Stack

- Nuxt 4, Vue 3, TypeScript (strict), Pinia
- Tailwind CSS v4 (custom Paymino design tokens in `app/assets/css/main.css`)
- Vazirmatn variable font, self-hosted in `public/fonts` (OFL licence included)
- `lucide-vue-next` icons, `qrcode` for payment QR codes
- Vitest for unit tests

## Run

```bash
npm install          # .npmrc sets legacy-peer-deps (needed for npm 10 + Nuxt 4.6)
npm run dev          # http://localhost:3000
npm run test         # unit tests
npm run typecheck
npm run build && node .output/server/index.mjs
```

**Demo login (mock API):** `demo@paymino.test` / `Demo1234` — has a completed and an in-progress order.

**Mock emails:** verification codes and password-reset links are printed in the dev server terminal.

**Payment simulator:** on the payment page, a dashed purple panel (visible only in `npm run dev`) sends correctly
signed webhooks to the mock gateway so you can walk through detected → confirming → confirmed / underpaid /
overpaid / expired / failed / fulfilled. Mock invoices use fake `TEST-ONLY-…` addresses and the UI shows a red
"sandbox — do not pay" warning.

## Switching to Django

```bash
NUXT_PUBLIC_API_BASE=https://api.paymino.ir/api npm run build
```

The browser then calls Django directly with cookies (`credentials: 'include'`). On Django, enable session auth +
CSRF, CORS with credentials for the site origin, and `SameSite=Lax` cookies on a shared parent domain.
Delete `server/` once Django serves every endpoint below.

### API contract (implemented by the mock, to be implemented in DRF)

Types live in `shared/types/index.ts`. Errors use DRF shape: `{ "detail": "…" }` or `{ "field": ["…"] }`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/catalog/categories` | |
| GET | `/catalog/products` | `q, category, provider, region, duration, minPrice, maxPrice, ordering, page, pageSize` → `{count, results, facets}` |
| GET | `/catalog/products/:slug` | |
| POST | `/cart/quote` | `{items}` → server prices, fee, total, per-line issues. **Client prices are never trusted.** |
| POST | `/auth/register` · `/auth/login` · `/auth/logout` | session cookie |
| GET / PATCH | `/auth/me` | |
| POST | `/auth/verify-email` · `/auth/resend-verification` | |
| POST | `/auth/password-reset` · `/auth/password-reset-confirm` | reset always returns 200 (no account enumeration) |
| POST | `/auth/change-password` | |
| GET / POST | `/orders` | POST needs `Idempotency-Key` header; returns 409 `quote_changed` if price/total moved |
| GET | `/orders/:id` | owner only (404 otherwise) |
| POST | `/orders/:id/invoice` | new invoice after expiry/failure |
| POST | `/orders/:id/cancel` | only before payment |
| GET | `/payments/currencies` | currencies, networks, rates, minimums |
| POST | `/payments/webhook` | HMAC-signed; the **only** way payment status changes |
| GET / POST | `/support/tickets`, `/support/tickets/:id`, `/support/tickets/:id/messages` | |

Order and payment statuses are separate; allowed transitions are in `shared/utils/status.ts` — mirror that table in Django.

## Structure

```
app/
  assets/css/main.css     design tokens (navy / teal), RTL + LTR-isolation utilities
  components/             ui/, layout/, catalog/, cart/, checkout/, payment/, order/, account/, home/
  composables/            useApi (fetch + error normalizer), useCatalog, useCountdown, useToast
  stores/                 auth, cart (persisted in localStorage, survives login)
  pages/                  home, shop, c/[slug], p/[slug], cart, checkout, checkout/pay/[id],
                          auth/*, account/*, faq, support, terms, privacy, refund-policy
  utils/                  formatting (Persian digits, Toman), status labels, FAQ + policy copy
  app.config.ts           support contact details
server/                   MOCK API — delete when Django is live
shared/                   API types + status transition rules (used by both sides)
tests/                    pricing, status transitions, crypto amount math, redirect safety
```

## Before launch (placeholders to replace)

- Support email / Telegram / hours in `app/app.config.ts`.
- Policy and FAQ text in `app/utils/content.ts` — draft copy; review against your real refund and service policy.
- Catalog, prices, fee rate and crypto rates are **sample data** in `server/utils/` — real data comes from Django admin.
- Only list services you can actually provide under each provider's terms and regional rules (AI subscriptions in particular).
- Product images: upload per product (`imageUrl`); until then a neutral category icon is shown. No brand logos are bundled.
- Choose the crypto gateway; implement invoice creation + webhook verification in Django following `server/utils/payments.ts`.
