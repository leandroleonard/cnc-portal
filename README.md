# CNC Portal — frontend

Responsive public website and private content-management interface for **Conselho Nacional de Cooperativas (CNC)**, built with Next.js App Router, React, TypeScript, next-intl and ESLint. This is the API-first frontend only; it consumes a separate FastAPI service. Backend persistence details are outside this repository's scope. No database schema, SQL, FastAPI models or migrations are created here.

## Product scope

### Public portal

- Portuguese and English routes/UI (`pt` and `en`), locale-preserving navigation, translated metadata, canonical/alternate links, robots and runtime sitemap.
- API-driven home, branded accessible hero carousel, cooperative directory/detail and map, news/detail, documents, public statistics, institutional pages, contacts, global search and newsletter.
- Server-side API pagination and query filters; translated content comes from the API.
- Loading, empty and API-failure states. Empty/missing API data is not replaced with fictional cooperatives, articles, documents or numbers.

### Private CMS

- FastAPI OAuth2 password-bearer login, in-memory access token, `/api/admin/me` validation, dashboard and permission-aware navigation.
- API-connected management for hero slides, cooperatives, news, documents, institutional sections, statistics, media uploads, social links, newsletter subscribers, contact messages and site settings.
- Translatable content is represented as separate `pt` and `en` fields. The API is authoritative for token validation, roles and every permission check.

## Requirements

- Node.js 20.9+ (Next.js 16 requirement; use Node 20 LTS or newer in CI and production).
- npm 10 (or npm version shipped with your chosen Node 20 image).
- A reachable FastAPI service that implements [`api-contract.md`](./api-contract.md) for live content and CMS functionality.

## Quick start

```bash
npm ci
cp .env.example .env.local
# Set the FastAPI URL and canonical site URL.
npm run dev
```

Open <http://localhost:3000>. The root route resolves to `/pt`; English routes are under `/en`. Public pages render honest empty/API-configuration states while the API is not connected. Admin screens require a token issued by the FastAPI service; no demo account or hardcoded password is included.

### Admin bearer-token lifecycle

The login screen uses the OAuth2 password-bearer contract: `POST /api/auth/token` with `application/x-www-form-urlencoded` fields `username` and `password`; it expects `access_token`, `token_type: "bearer"` and optional `expires_in`. The token is held **only in JavaScript memory**, attached to admin requests as `Authorization: Bearer …`, and cleared on logout, expiry, or an API `401`. It is never stored in a cookie, `localStorage` or `sessionStorage`. Refreshing/reopening the page requires a new login. Admin content is loaded client-side after `/api/admin/me` validates the token; the server does not render private API data.

### Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_API_URL` | for live data | FastAPI origin/root, without a trailing slash; the frontend appends `/api/...`. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical website URL used for metadata and sitemap generation. |
| `NEXT_PUBLIC_IMAGE_DOMAINS` | optional | Comma-separated additional CDN hostnames allowed by `next/image`. |

Never put secrets in `NEXT_PUBLIC_*` variables. Those values are embedded in browser-visible code. Do not configure cookie auth for this frontend.

### CORS requirements

Configure FastAPI CORS for the exact public website origin. Allow the `Authorization`, `Accept` and `Content-Type` headers and the required methods, including `OPTIONS` preflight. The frontend explicitly omits browser credentials on API calls; do not enable credentialed cookies or wildcard-origin access for authenticated requests. Access tokens are sent only in the Authorization header. See [`api-contract.md`](./api-contract.md).

## Routes

| Locale | PT | EN |
|---|---|---|
| Home | `/pt` | `/en` |
| Cooperatives | `/pt/cooperativas` | `/en/cooperatives` |
| Cooperative detail | `/pt/cooperativas/{slug}` | `/en/cooperatives/{slug}` |
| News | `/pt/actualidade` | `/en/news` |
| News article | `/pt/actualidade/{slug}` | `/en/news/{slug}` |
| Institutional | `/pt/institucional` | `/en/about` |
| Documents | `/pt/documentos` | `/en/documents` |
| Statistics | `/pt/estatisticas` | `/en/statistics` |
| Contacts | `/pt/contactos` | `/en/contact` |
| Search | `/pt/pesquisa` | `/en/search` |

The private CMS uses `/admin` and `/admin/login` (not a public locale-prefixed route).

## Commands and verification

```bash
npm run dev        # development server
npm run lint       # ESLint
npm run typecheck  # TypeScript, no emit
npm test           # Vitest critical behavior tests
npm run build      # optimized Next.js production build
npm start          # serve a built app
```

Before a release, run all four checks (lint, typecheck, test, build) with the production environment variables and the FastAPI contract version used by the backend. The Vitest suite covers API query serialization, form validation, API errors, OAuth2 password-bearer requests and in-memory token lifecycle, safe `?next=` redirects, UI permission matching and hero-slide behavior. Add FastAPI integration/contract tests in the backend project.

## Architecture and integration

- App Router pages and layouts live under `src/app`; public routes are locale-prefixed and use next-intl pathname mapping.
- Public API functions are centralized in `src/lib/api/public.ts`; admin functions in `admin.ts`, `auth.ts` and `media.ts`. Shared request/error/token handling and query serialization are in `src/lib/api/client.ts` and `query.ts`. Domain/transport types are in `src/types`.
- Public route pages fetch API data on the server. All private CMS API reads and mutations run in client components after the in-memory bearer token is verified; this is required because no token is placed in cookies or sent to the Next.js server.
- No final mock records are shipped. The institutional hero fallback is brand UI copy/media only, used to avoid an empty hero before the API is configured; it is not represented as a campaign or data record.
- API failures and unavailable content are surfaced in the public/admin UI; API-backed content is never silently replaced by invented sample data.
- More detail is in [`docs/architecture.md`](./docs/architecture.md). Endpoint behavior, examples, permissions and errors are in [`api-contract.md`](./api-contract.md).

## Map asset attribution and limits

The map background at `public/images/angola-provinces-21.webp` is adapted from “Provincias Angola 2025.png” by Petnog, via Wikimedia Commons, licensed CC0 1.0; it was downloaded through the paises.net WebP adaptation. The caption in the UI includes attribution. Province names, IDs, counts and selectable results come from the API. The client has manually positioned click targets over the visual image; these are interface hit targets, **not an official GIS boundary dataset** and must not be used for spatial analysis. The API is responsible for authoritative provincial and municipality data.

## Content and backend responsibilities

- The API must seed/import any approved official content, including the client-provided Agritech Show Luanda 2026 article if CNC approves it. This frontend deliberately does not hardcode that article.
- Empty statistics remain null/empty until approved CNC values are supplied. The API owns provenance, period and publication state.
- Admin accounts, token signing/expiry/revocation, FastAPI validation, server-side permissions, media storage/scanning, persistence, retention, audit logging and rate limiting are backend responsibilities.
- Full HTTP request/response examples and accepted fields are in `api-contract.md`.

## Security and release notes

- Bearer tokens remain in memory only; do not move them to cookies, `localStorage` or `sessionStorage`. A refresh requires signing in again.
- API permissions are checked on the server. UI permission helpers only improve navigation and cannot replace backend authorization.
- All public forms validate client-side for usability and still require equivalent server-side validation, rate limiting and abuse controls.
- `npm audit --omit=dev` currently reports **0 production dependency vulnerabilities**. Full `npm audit` reports **5 high-severity advisories in development-only ESLint tooling dependencies** (`eslint-config-next` / `@next/eslint-plugin-next`, `fast-glob`, `micromatch`, `braces`), with no critical/moderate findings. npm's suggested automatic fix would downgrade the Next ESLint config to v14; that incompatible downgrade was not applied. Recheck the lockfile and update the lint toolchain when a safe upstream fix is available.
