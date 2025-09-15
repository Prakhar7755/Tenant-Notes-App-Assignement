# Multi-Tenant Notes SaaS (Next.js App Router + Mongoose)

A minimal multi-tenant Notes application (Next.js App Router + Mongoose/MongoDB) built to satisfy the assignment requirements:

* Multi-tenancy (shared schema with `tenantSlug`)
* JWT-based auth (Admin / Member roles)
* Subscription gating (Free = 3 notes per tenant, Pro = unlimited)
* Notes CRUD (tenant-scoped)
* Frontend (Next.js App Router) + backend APIs, deployable to Vercel

---

## Quick status / TL;DR

* **Tenant approach:** Shared schema. Every model that is tenant-scoped contains a `tenantSlug` string. All queries are filtered server-side by `tenantSlug` obtained from the authenticated JWT → strict isolation.
* **Test accounts (password for all is `password`):**

  * `admin@acme.test` (admin, tenant: `acme`)
  * `user@acme.test` (member, tenant: `acme`)
  * `admin@globex.test` (admin, tenant: `globex`)
  * `user@globex.test` (member, tenant: `globex`)


----
---

# Table of contents

* [Architecture & Models](#architecture--models)
* [Environment variables](#environment-variables)
* [How to run locally](#how-to-run-locally)
* [Seeding the DB (dev only)](#seeding-the-db-dev-only)
* [Frontend behavior](#frontend-behavior)
* [API endpoints (summary)](#api-endpoints-summary)
* [Security / Important notes](#security--important-notes)
* [Deployment to Vercel](#deployment-to-vercel)
* [Automated evaluation checklist](#automated-evaluation-checklist)
* [Troubleshooting](#troubleshooting)

---

# Architecture & Models

**Tenant approach (shared schema)**
Every tenant is represented by a `Tenant` document:

```js
// Tenant model (concept)
{
  slug: "acme",     // unique id used in URLs and DB filtering
  name: "Acme",
  plan: "free"      // "free" | "pro"
}
```

**User model**

```js
{
  email: "admin@acme.test",
  passwordHash: "<bcrypt-hash>",
  role: "admin" | "member",
  tenantSlug: "acme"
}
```

**Note model**

```js
{
  title: "Note title",    // required
  content: "optional",
  tenantSlug: "acme",
  createdBy: ObjectId("<user>")
}
```

All server-side API handlers ALWAYS filter using the `tenantSlug` from the authenticated JWT — **never trust client-provided tenant values**.

---

# Environment variables

Create `.env.local` in project root when developing:

```
MONGODB_URI="your-mongodb-connection-string"
JWT_SECRET="a-long-random-secret"
# (Do not set NODE_ENV manually; Next.js sets it for you)
```

* `MONGODB_URI` — MongoDB Atlas connection string (or local)
* `JWT_SECRET` — secret used to sign JWT tokens

> On Vercel set these in the Project Settings → Environment Variables.

---

# How to run locally

```bash
# install
npm install

# dev
npm run dev
# Open http://localhost:3000
```

Important: restart dev server after adding new `app/api` route files (sometimes required).


---

# Frontend behavior

Minimal UI pages (App Router):

* `/` — home page with test account list and link to login
* `/login` — login form (sends `{ email, password }` to `/api/auth/login`), stores `token` and `user` in `localStorage`
* `/signup` — signup form (bootstraps **new** tenants only; if tenant exists, user must be invited)
* `/notes` — list/create/delete/edit notes for current tenant; shows **Upgrade to Pro** when free tenant is at 3 notes; Add Note form accepts **title** (required) and **content** (optional)

Auth: frontend stores `token` and `user` in `localStorage`. All fetches use `Authorization: Bearer <token>` header.

---

# API endpoints (summary)

All App Router endpoints live under `app/api/...` (examples below show effective path):

## Public / auth

* `GET  /api/health`
  Response: `{ "status": "ok" }`

* `POST /api/auth/login`
  Body: `{ email, password }`
  Success: `{ token, user: { id, email, role, tenantSlug } }` (HTTP 200)

* `POST /api/auth/signup`

  * **Bootstrap flow**: if `tenantSlug` does NOT exist, creates the tenant and makes the new user an `admin`.
  * If `tenantSlug` exists, returns `403` instructing user to ask admin to invite them.

  Body: `{ email, password, tenantSlug }`
  Success bootstrap: `{ success: true, user }`

## Tenant management

* `POST /api/tenants/:slug/invite`
  Admin-only. Body: `{ email, password, role }`. Creates user in tenant.

* `POST /api/tenants/:slug/upgrade`
  Admin-only. Upgrades tenant to `plan: "pro"`.

* `GET /api/tenants/:slug`
  (Optional) Returns tenant info `{ tenant }`. Used by frontend to check plan.

## Notes (tenant-scoped)

* `GET  /api/notes` — list all notes for current tenant
  Response: `{ notes: [ ... ] }`

* `POST /api/notes` — create note
  Body: `{ title, content }`
  Responses:

  * 200/202 success: `{ note }`
  * 403: `{ error: "Free plan limit reached" }` when tenant is `free` and count ≥ 3
  * 401/404 as relevant

* `GET  /api/notes/:id` — get single note (tenant-scoped)

* `PUT  /api/notes/:id` — update note (tenant-scoped)

* `DELETE /api/notes/:id` — delete note (tenant-scoped)

---

# Error handling & expected status codes

* `401 Unauthorized` — invalid/no token
* `403 Forbidden` — role mismatch or business rule violation (e.g., free plan limit, attempting to sign up into existing tenant)
* `404 Not Found` — missing tenant or note
* `400 Bad Request` — validation failures (missing fields)
* All API responses are JSON. Frontend checks `res.ok` and handles `res.status` explicitly.

---

# Security / Important notes

* **Tenant isolation**: Every DB query uses `tenantSlug` from JWT (not from client).
* **Signup policy**:

  * If tenant does not exist → signup bootstraps tenant and makes first user an `admin` (useful for initial creation).
  * If tenant exists → signup is disallowed; users must be **invited** by a tenant Admin via `/api/tenants/:slug/invite`.
* **Seed route** is disabled in production (`NODE_ENV === "production"`).
* Use **long `JWT_SECRET`** in production.
* Production DB credentials must be secure (Vercel environment variables).

---

# Deploying to Vercel (high level)

1. Push repo to GitHub.
2. Create a new Project in Vercel and connect your repo.
3. In Vercel Project Settings → Environment Variables add:

   * `MONGODB_URI` (value from Atlas)
   * `JWT_SECRET`
4. Deploy. Vercel will set `NODE_ENV=production` automatically.
5. (Optional) If you used the `/api/seed` approach and want to seed on the deployed app, **do not** — the seed is disabled in production. Seed locally or seed on a staging instance only.


---

# Troubleshooting (common issues)

* **404 for `/api/...` after adding new routes**: restart dev server (`npm run dev`) — App Router sometimes needs restart after new API folders.
* **"Tenant not found"**: check the `tenants` collection for a `slug` field. Example in `mongosh`:

  ```js
  db.tenants.find().pretty()
  db.tenants.updateOne({ name: "Acme" }, { $set: { slug: "acme" } })
  ```
* **Mongoose connection errors in Vercel**: ensure connection caching is used (`globalThis` caching) to prevent too many connections.
* **Login works in Postman but not frontend**: ensure frontend sends `Authorization: Bearer <token>` and you saved both `token` and `user` correctly.
* **Frontend crashes on `note.title` undefined**: some old notes may not have `title`. Either update them in Mongo or render safely with `note?.title || "(No title)"`.

---

# Development notes & file locations

* Backend API (App Router): `app/api/*/route.js`
* Frontend pages (App Router): `app/login/page.jsx`, `app/signup/page.jsx`, `app/notes/page.jsx`
* Models: `src/models/*.js` or `models/*.js` depending on your layout (Tenant, User, Note)
* DB connection: `src/lib/db.js`
* Auth utilities: `src/lib/auth.js`
* Seed route (dev-only): `app/api/seed/route.js` (guarded by `NODE_ENV`)

---

# Final suggestions before submission

1. Run & verify login for the four required test accounts.
2. Verify `GET /api/health` responds with `{ status: "ok" }`.
3. Create exactly 3 notes as a free tenant and confirm the 4th fails with `403`.
4. Login as Admin and call `/api/tenants/:slug/upgrade` then try creating the 4th note again.
5. Remove or leave `/api/seed` guarded (recommended to keep guard or remove before final evaluation).
6. Add a small note in README that `/api/seed` is dev-only — helpful for graders.
