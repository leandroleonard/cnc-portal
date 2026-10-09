# CNC Portal — frontend

Responsive public website and private content-management interface for **Conselho Nacional de Cooperativas (CNC)**, built with Next.js App Router, React, TypeScript, next-intl and ESLint. This project is the API-first frontend only. The backend is Laravel + PostgreSQL and is intentionally outside this repository's scope: there are no Laravel models, migrations, database schemas or SQL here.

## Product scope

### Public portal

- Portuguese and English routes/UI (`pt` and `en`), locale-preserving navigation, translated metadata, canonical/alternate links, robots and runtime sitemap.
- API-driven home, branded accessible hero carousel, cooperative directory/detail, cooperative map, news/detail, documents, public statistics, institutional pages, contacts, global search and newsletter sign-up.
- Server-side API pagination and query filters; translated data comes from the API.
- Loading, empty and API-failure states. Empty/missing API data is not replaced with fictional cooperatives, articles, documents or numbers.

### Private CMS

- Cookie-session login and logout, protected admin layout, dashboard and permission-aware navigation.
- API-connected management for hero slides, cooperatives, news, documents, institutional sections, statistics, media uploads, social links, newsletter subscribers, contact messages and site settings.
- Translatable content is represented as separate `pt` and `en` fields. The API is authoritative for sessions, roles and every permission check.

## Requirements

- Node.js 20.9+ (Next.js 16 requirement; use Node 20 LTS or newer in CI and production).
- npm 10 (or npm version shipped with your chosen Node 20 image).
- A reachable CNC API that implements [`api-contract.md`](./api-contract.md) for real content/admin functionality.

## Quick start

```bash
npm ci
cp .env.example .env.local
# Edit .env.local with the public API URL and canonical site URL.
npm run dev
```

Open <http://localhost:3000>. The root route resolves to `/pt`; the site also has English routes under `/en`. Public pages render honest empty/API-configuration states while the API is not connected. Admin screens require a valid API session; no demo account or hardcoded password is included.

### Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_API_URL` | for live data | Laravel API origin/root, without a trailing slash; frontend appends `/api/...`. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical public website URL used for metadata and sitemap. |
| `NEXT_PUBLIC_IMAGE_DOMAINS` | optional | Comma-separated additional CDN hostnames allowed by `next/image`. |
| `NEXT_PUBLIC_SANCTUM_URL` | optional | Sanctum origin if it differs from `NEXT_PUBLIC_API_URL`; the frontend requests `/sanctum/csrf-cookie` before login. |
| `ADMIN_SESSION_COOKIE` | optional | Session cookie name checked by the admin-route Proxy; default is `cnc_admin_session`. Set it to the actual cookie name issued for the website domain. |

Never put secrets in `NEXT_PUBLIC_*` variables. Those values are embedded in browser-visible code. Keep private credentials on the API/server.

### Cookie/CORS deployment requirement

Admin authentication uses a credentialed server session rather than local storage. For browser and Next.js server-rendered checks to work, the session cookie needs an appropriate same-site domain visible to the CNC website, and the API must allow the exact website origin with credentials. Configure the Laravel/Sanctum stateful domains, `Secure`/`HttpOnly`/`SameSite` attributes, CORS allow-origin, CSRF cookie and `X-XSRF-TOKEN` handling together. Do not use wildcard CORS with credentials. A same-site reverse proxy or sibling API hostname under the CNC domain is recommended. See the authentication section of [`api-contract.md`](./api-contract.md).

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

Before a release, run all four checks (lint, typecheck, test, build) with the production environment variables and the API contract version used by the backend. The current Vitest suite covers API query serialization, form validation, error types, admin permission gating and hero slide ordering/fallback behavior; the API team should add integration/contract tests in its own backend project.

## Architecture and integration

- App Router pages and layouts live under `src/app`; public routes are locale-prefixed and use next-intl pathname mapping.
- API functions are centralized in `src/lib/api/public.ts`, `admin.ts`, `auth.ts` and `media.ts`. Shared requests/errors and query serialization are in `src/lib/api/client.ts` and `query.ts`. Domain/transport types are in `src/types`.
- Public route pages fetch API data on the server and pass plain typed results to reusable components. Interactive filters, forms, carousel and CMS controls are client components.
- No final mock records are shipped. The institutional hero fallback is brand UI copy/media only, used to avoid an empty hero before the API is configured; it is not represented as a campaign or data record.
- API failures and unavailable content are surfaced in the public/admin UI; API-backed content is never silently replaced by invented sample data.
- More detail, data flow and backend responsibilities are in [`docs/architecture.md`](./docs/architecture.md). Endpoint behavior, examples, permissions and error rules are in [`api-contract.md`](./api-contract.md).

## Map asset attribution and limits

The map background at `public/images/angola-provinces-21.webp` is adapted from “Provincias Angola 2025.png” by Petnog, via Wikimedia Commons, licensed CC0 1.0; it was downloaded through the paises.net WebP adaptation. The caption in the UI includes attribution. Province names, IDs, counts and selectable results come from the API. The client has manually positioned click targets over the visual image; these are interface hit targets, **not an official GIS boundary dataset** and must not be used for spatial analysis. The API is responsible for authoritative provincial and municipality data.

## Content and backend responsibilities

- The API must seed/import any approved official content, including the client-provided Agritech Show Luanda 2026 article if CNC approves it. This frontend deliberately does not hardcode that article.
- Empty statistics remain null/empty until approved CNC values are supplied. The API owns provenance, period and publication state.
- Admin login requires a running Laravel session/CSRF integration and an account provisioned by the CNC backend administrator; there are no default credentials.
- Media storage, virus scanning, database persistence, workflow, retention, backup, audit logging and permission enforcement are backend responsibilities.
- Full HTTP request/response examples and accepted field contracts are in `api-contract.md`.

## Security and release notes

- Session tokens are not persisted in browser storage; do not add that pattern.
- API permissions are checked on the server. UI permission helpers only improve navigation and cannot replace backend authorization.
- All public forms validate client-side for usability and still require equivalent server-side validation, rate limiting and abuse controls.
- `npm audit --omit=dev` currently reports **0 production dependency vulnerabilities**. Full `npm audit` reports **5 high-severity advisories in development-only ESLint tooling dependencies** (`eslint-config-next` / `@next/eslint-plugin-next`, `fast-glob`, `micromatch`, `braces`), with no critical/moderate findings. npm's suggested automatic fix would downgrade the Next ESLint config to v14; that incompatible downgrade was not applied. Recheck the lockfile and update the lint toolchain when a safe upstream fix is available.
