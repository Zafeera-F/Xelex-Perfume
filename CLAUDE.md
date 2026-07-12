# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

XeleX Perfumes — a full-stack e-commerce storefront + admin panel. Two independent apps in one repo:

- **Frontend** (repo root: `src/`) — React 19 + Vite + Tailwind v4 SPA (customer storefront + admin panel, same app, different routes).
- **Backend** (`backend/`) — Express 5 + Prisma + PostgreSQL REST API, its own `package.json`/`node_modules`.

They run as separate dev processes and talk over HTTP; there is no shared build step.

## Commands

Frontend (run from repo root):
```
npm run dev       # vite dev server, http://localhost:5173
npm run build     # production build
npm run lint      # oxlint
npm run preview   # preview a production build
```

Backend (run from `backend/`):
```
npm run dev              # node --watch src/server.js, http://localhost:5000
npm start                # node src/server.js (no watch)
npm run prisma:generate  # regenerate Prisma client after schema.prisma changes
npm run prisma:migrate   # create/apply a dev migration
npm run prisma:studio    # Prisma Studio GUI
npm run prisma:seed      # (re)seed DB, including the bootstrap SUPER_ADMIN from .env
```

No test runner is configured in either package. There is no single-test command.

Both apps need a `.env` (copy from the adjacent `.env.example`). Backend requires a running PostgreSQL instance and `DATABASE_URL`, `JWT_SECRET`, `ADMIN_JWT_SECRET` at minimum — the server fails fast at startup if the JWT secrets are unset. Razorpay env vars are optional; UPI payment routes return 503 until they're configured, everything else (COD checkout, auth, browsing) works without them.

## Backend architecture

Layered, one direction of dependency: **routes → controllers → services → repositories → Prisma**. This layering is deliberate and consistent across every feature (auth, products, orders, payments, admin variants, ...) — follow it for new features rather than reaching into Prisma from a controller.

- `routes/*.routes.js` — wires URL + HTTP verb + validator chain + auth middleware + controller. Route files mix public and `requireAuth`/`requireAdmin`-gated routes per-route rather than splitting into separate files (see `product.routes.js`, which hosts both product and review sub-routes).
- `controllers/*.controller.js` — thin. Pulls request data, calls one service method, wraps the result in `ApiResponse`. Every handler is wrapped in `asyncHandler` so thrown/rejected errors reach the centralized error handler instead of needing per-route try/catch.
- `services/*.service.js` — business logic, the only layer allowed to coordinate multiple repositories or open a Prisma transaction.
- `repositories/*.repository.js` — the only layer that imports `config/prisma.js` / writes Prisma queries. Customer-facing repository methods are pre-scoped to visibility filters (e.g. `product.repository.js`'s `CUSTOMER_VISIBLE = { isActive: true, deletedAt: null }`); admin methods (`findAllForAdmin`, etc.) deliberately see everything, including soft-deleted rows.
- `app.js` builds and configures the Express app but never calls `.listen()`; `server.js` is the only file that does, so `app` stays importable for future supertest-style testing.

Errors: throw `ApiError(status, message, errors?)` anywhere below the controller; the single `errorHandler` middleware (registered last in `app.js`) is the only place that formats an HTTP error response. Success responses are `new ApiResponse(message, data)`. `express-validator` validator chains + the shared `validate` middleware turn validation failures into a 422 `ApiError` automatically — controllers never check `req.body` shape themselves.

### Auth: two isolated realms

Customers and admins are deliberately kept cryptographically and architecturally separate — a leaked/forged token from one can never be replayed as the other:

- Customer: `JWT_SECRET`, cookie `xelex_token` (see `utils/cookies.js`), `requireAuth` middleware trusts the JWT payload alone (no DB hit).
- Admin: `ADMIN_JWT_SECRET`, separate cookie (see `utils/adminCookies.js`), `requireAdmin` middleware re-checks the DB (`deletedAt`) on every request so revoking an admin takes effect immediately rather than waiting out the token's remaining lifetime — admins hold more destructive power, so that tradeoff (one extra indexed lookup per request) is intentional.

Both cookies are httpOnly; the frontend never reads the token directly, which is why `AuthContext`/`AdminAuthContext` resolve session state by calling a `/profile` endpoint on mount instead of inspecting a cookie client-side.

### Data model conventions (see `backend/prisma/schema.prisma`)

- All PKs are UUIDs; every model has `createdAt`/`updatedAt`.
- Soft delete (`deletedAt`) is used selectively — only where a row must stay referenceable by historical records (User, Category, Collection, Product, Address, Review). Orders, OrderItems, and Payments are **never** soft- or hard-deleted; cancellation is a status transition, not a delete, because they're financial/legal records.
- `OrderItem` snapshots `productName`/`unitPrice` at purchase time rather than joining live — a later price change or rename must never rewrite what a past invoice says the customer paid. The same "never trust the client, re-fetch server-side" rule applies to cart/checkout pricing in general.
- `PaymentIntent` bridges "customer clicked pay" and "gateway confirmed" for the Razorpay UPI flow — a real `Order`/`Payment` can't exist yet at that point, so the cart/shipping snapshot lives here (as `cartSnapshot` JSON) until payment verification succeeds. `order.service.js`'s `buildOrderInTransaction` is exported and reused by `payment.service.js` so COD and UPI orders are built by exactly one code path, never two copies that could drift.
- Payment finalization (`payment.service.js`) is idempotent by design: both the browser's `/verify` call and the Razorpay webhook can race to finalize the same intent (`paymentIntentRepository.claimForFinalization`), and the loser reads back the winner's already-committed order instead of erroring.

### Pricing rule duplication (intentional)

Shipping/total calculation (`FREE_SHIPPING_THRESHOLD = 1999`, `FLAT_SHIPPING_FEE = 99`) exists in three places that must be kept in sync: `src/lib/pricing.js` (frontend preview), `backend/src/services/order.service.js` (authoritative, COD), and `backend/src/services/payment.service.js` (authoritative, UPI). If you change one, change all three.

## Frontend architecture

- `src/App.jsx` — all routing (`react-router-dom`), two layouts: `MainLayout` (storefront) and `AdminLayout` (admin panel, assumes an authenticated admin — `AdminLogin` is intentionally standalone, not nested under it). `src/routes/paths.js` is the single source of truth for every URL; components import `PATHS` rather than hardcoding route strings.
- `src/lib/api.js` — the only place that calls `fetch` directly. `apiRequest(path, opts)` sends `credentials: "include"` (so the httpOnly cookie flows) and normalizes the backend's `{ success, message, data }` / `{ success, message, errors }` shape into a resolved value or a thrown `ApiClientError`. Other `src/lib/*.js` files (`products.js`, `orders.js`, `payments.js`, `wishlist.js`, `reviews.js`, `admin*.js`) are thin feature-specific wrappers around it — add new API calls there, not as raw `fetch`s in components.
- `src/context/` — `AuthContext` and `AdminAuthContext` resolve session state via a `/profile`-style call on mount (`status`: `"loading" | "authenticated" | "guest"` — check `status`, not just truthiness of `user`, so a guest isn't briefly treated as logged in/out during that resolution). `CartContext` and `WishlistContext` follow the customer-auth realm.
- Cart storage (`CartContext`): persisted to `localStorage` (`xelex_cart_v1`) as `{ productId, quantity }` pairs only — never a snapshot of price/name/image, so catalog edits are always reflected live. Cart lines are hydrated against freshly-fetched product data; entries referencing a since-removed product are silently dropped. `isLoading` distinguishes "genuinely empty cart" from "still hydrating" so pages don't redirect away from a non-empty cart before hydration finishes.
- Styling: Tailwind v4 via `@tailwindcss/vite` (no separate `tailwind.config.js` — v4 is CSS-first, see `src/index.css`).
- Path alias / env: `VITE_API_URL` (default `http://localhost:5000`) is the only required frontend env var.

## Cross-cutting notes

- CORS is locked to `CORS_ORIGIN` (comma-separated origins) with `credentials: true` — required for the httpOnly cookies to flow cross-origin between the Vite dev server and the API.
- `/uploads` (admin product images) is served with a relaxed `Cross-Origin-Resource-Policy: cross-origin` header specifically so the frontend (a different origin in dev) can render them in `<img>` tags despite helmet's stricter default.
- The Razorpay webhook route needs the *raw* request bytes (not re-serialized JSON) to verify `X-Razorpay-Signature`, since the signature is computed over the literal bytes sent — this is why `app.js`'s `express.json()` stashes `req.rawBody` in its `verify` callback.
