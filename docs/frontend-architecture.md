# CNC Portal — architecture and integration boundaries

## 1. Scope

This repository is the Next.js frontend for the public CNC portal and private CMS. The backend is a separate Laravel + PostgreSQL service. This architecture deliberately contains no database schema, SQL, Laravel model, migration, or server-side content store. The API contract is documented in [`../api-contract.md`](../api-contract.md).

The supplied React Router application was treated as a visual and behavior reference rather than the target runtime. The implementation uses App Router layouts, route segments, server-rendered data pages, shared domain/API modules and reusable client interaction components.

## 2. High-level request flow

```text
Browser
  │
  ├─ public URL (/pt/... or /en/...)
  │    └─ Next.js Proxy (locale routing)
  │         └─ App Router Server Component
  │              └─ src/lib/api/public.ts
  │                   └─ src/lib/api/client.ts ── HTTPS ── Laravel API
  │              └─ typed data ── reusable UI / Client Components
  │
  └─ admin URL (/admin/...)
       └─ Next.js Proxy session-cookie presence gate
            └─ admin Server Component layout
                 └─ GET /api/admin/me with incoming cookie
                      └─ Laravel session + authorization (authoritative)
                           └─ admin UI + centralized admin API functions
```

Public page reads and initial admin data loads happen on the server where practical; this keeps API secrets out of client bundles and produces crawlable HTML. Client Components are used for interactions that require browser state: carousel controls/swipe, query form submissions, interactive map controls, file uploads, subscriber/contact actions, editor controls, and login.

All content and permissions remain backend-owned. When the API is unreachable or has no records, the interface shows an error or empty state instead of fabricating content.

## 3. Application structure

### 3.1 Route tree

```text
src/app/
├── (public)/[locale]/             # next-intl public route group
│   ├── page.tsx                   # public home + hero + directory/map/news feeds
│   ├── cooperativas/              # cooperative listing and [slug] detail
│   ├── actualidade/               # news listing and [slug] detail
│   ├── institucional/
│   ├── documentos/
│   ├── estatisticas/
│   ├── contactos/
│   ├── pesquisa/
│   ├── loading.tsx, error.tsx,
│   │   not-found.tsx
│   └── layout.tsx                 # public shell, messages, global styles
├── (admin)/admin/
│   ├── login/
│   └── (dashboard)/               # protected AdminDashboardLayout
│       ├── page.tsx               # dashboard
│       ├── cooperativas/
│       ├── noticias/
│       ├── documentos/
│       ├── hero/
│       ├── institucional/
│       ├── estatisticas/
│       ├── media/
│       ├── redes-sociais/
│       ├── newsletter/
│       ├── contactos/
│       └── configuracoes/
├── robots.ts
└── sitemap.ts                     # dynamic API-backed entries
```

The route names displayed to users are translated by `src/i18n/routing.ts`; route components use stable internal pathnames. For example, the internal `/actualidade` path is rendered as `/news` in English. The root redirects to the default locale (`/pt`). The admin remains unprefixed at `/admin` and uses a Portuguese-oriented editor UI with separate `pt` and `en` content fields.

### 3.2 Shared components and features

- `src/components/layout`: public header, footer and shell.
- `src/components/home`: API-driven hero slider with accessibility and reduced-motion handling.
- `src/components/cooperatives`, `news`, `documents`, `maps`, `charts`: public domain presentation.
- `src/components/forms`: contact, newsletter and global search.
- `src/components/admin`: CMS shells, data tables, bilingual forms, uploads and managers.
- `src/components/ui`: shared buttons, containers, state messages, skeletons, breadcrumbs and pagination.
- `src/features/home/hero-slides.ts`: deterministic ordering/fallback logic, separated for tests.

The approved visual identity remains navy, green and gold. Shared CSS is in `src/app/globals.css`; admin-specific rules are in `src/app/(admin)/admin.css`. Responsive layout uses component-level classes rather than a generic template replacement.

## 4. Internationalization, SEO and crawlability

- `next-intl` is configured in `src/i18n` with locales `pt` and `en`, localized route aliases, translated navigation and fixed UI messages.
- Public data reads carry an explicit `locale`; the API returns localized titles, names, rich text, categories and settings. Admin edit payloads hold distinct `translations.pt` and `translations.en` values.
- Page metadata is generated from the active locale, including descriptions, canonical URLs and PT/EN alternate links where appropriate. Search is `noindex`.
- `src/app/robots.ts` controls crawl policy; `src/app/sitemap.ts` adds the localized static routes and published API-backed article/cooperative slugs. The sitemap uses `force-dynamic` because publishing happens independently of the frontend deployment.
- The sitemap reads both locales and paginates API results in bounded batches. The current implementation caps collection traversal; if CNC content volumes outgrow that bound or the sitemap approaches search-engine limits, add a dedicated paginated backend sitemap feed and split sitemaps.
- The sitemap can contain only content the API reports. If the API is absent during sitemap generation/request, it returns static route entries only.

## 5. API client and data contracts

### 5.1 Modules

- `src/types/domain.ts`: shared resource/domain and CMS input types.
- `src/types/api.ts`: envelopes, pagination, filters and endpoint query inputs.
- `src/lib/api/client.ts`: common `apiRequest`, JSON headers, credentials, XSRF header, configuration error and normalized `ApiError`.
- `src/lib/api/query.ts`: API query encoding, route-query mapping, positive page handling and sort direction normalization.
- `src/lib/api/public.ts`: public endpoint functions.
- `src/lib/api/admin.ts`: admin list/CRUD/manager functions.
- `src/lib/api/auth.ts`: login, current-session identity, logout.
- `src/lib/api/media.ts`: multipart upload with credentialed XHR progress and abort support.
- `src/lib/api/loader.ts`: server route data loading without throwing through expected API-unavailable states.

Components should call these functions rather than place ad-hoc `fetch()` calls in UI code. Request failures are normalized to `ApiError` and pages choose a translated error message. The backend contract remains the source of truth for validation and permissions.

### 5.2 Cache and freshness

API client requests default to `cache: 'no-store'`; public information changes through the CMS and admin/private data must not leak across sessions. Route-level rendering remains dynamic when reading request search params/cookies or API content. If a future API cache is introduced, it must define explicit tags/revalidation behavior and must not cache admin data across users.

### 5.3 Empty/unconfigured API behavior

- `NEXT_PUBLIC_API_URL` is required for live API data.
- Without it, `ApiConfigurationError` reaches a clear configuration state. The frontend does not silently swap in fake lists or example statistics.
- Empty API arrays and `null` totals are rendered as empty/unpublished states.
- The home carousel is the narrow exception: it renders a branded CNC institutional presentation fallback when there is no API institutional slide. That UI fallback uses the static CNC logo and cover artwork, is not an API record, is not a campaign, and is not shown as a real cooperative/news item.

## 6. Authentication and admin security boundary

### 6.1 Session flow

The backend uses Laravel/Sanctum-compatible cookie sessions. Before login, the browser initializes the CSRF cookie at `/sanctum/csrf-cookie` (or the configured `NEXT_PUBLIC_SANCTUM_URL`). A login POST includes credentials; the API sets a session cookie. Subsequent requests carry credentials; the client adds the decoded `XSRF-TOKEN` as `X-XSRF-TOKEN` for unsafe methods.

The Next.js Proxy checks only whether the configured `ADMIN_SESSION_COOKIE` exists before serving protected routes. It does not claim that the cookie is valid. `src/app/(admin)/admin/(dashboard)/layout.tsx` forwards the incoming cookie to `getCurrentAdmin()` and redirects if the API rejects it. API authorization on every operation is mandatory even if a user has permission flags in the rendered shell.

The frontend never stores access/session tokens in `localStorage` or `sessionStorage`. Session cookie domain, expiry, rotation, `HttpOnly`, `Secure`, `SameSite`, CSRF, CORS and login throttling are backend/deployment responsibilities.

### 6.2 Permission-aware UI

`src/lib/utils/permissions.ts` supports checking explicit permission keys and broad grants for showing controls/navigation. This is strictly a presentation aid. It does not authorize API calls; every endpoint must enforce CNC policy server-side.

### 6.3 Personal data

Contact messages and newsletter subscriber emails are sensitive. UI screens only display backend-authorized records. Apply least privilege, audit access/export, retention policy, and secure transport/storage in the API environment.

## 7. Content editing and uploads

- Translatable resources submit separate PT and EN values. The frontend does not auto-translate or copy missing text.
- Structured content is represented by typed rich-text blocks rather than executable HTML. Future block types must be coordinated between frontend and API.
- The admin media picker consumes a paginated API library. Uploads are multipart, credentialed, progress-reporting and abortable; the XHR path is used specifically because fetch does not provide upload progress consistently.
- The frontend validates selected file size/type for usability (default 20 MiB upload cap) but the backend must independently verify actual file content, size, malware policy, access, storage path and referenced-asset deletion rules.
- The media API returns absolute URLs. Configure `NEXT_PUBLIC_IMAGE_DOMAINS` and the API hostname in Next `remotePatterns` for remote images.

## 8. Cooperative map and data integrity

The map visual is the 2025-era 21-province map asset adapted from Petnog/Wikimedia Commons (CC0 1.0), via paises.net. It is for presentation only. Province records, localized names, IDs and cooperative counts are API data; the code does not insert synthetic province records. The clickable hotspots are manually placed UI targets and not authoritative vector boundaries or GIS coordinates. For accurate geospatial search, the backend must expose validated geometries/coordinates and the frontend must use a proper map provider/dataset under an approved license.

## 9. Styling, accessibility and interaction

- Responsive layout retains the prototype's institutional hierarchy and colors.
- Semantic headings/landmarks, labelled inputs, live status/error messages, keyboard focus, and disabled/loading states are used throughout.
- The hero supports previous/next controls, indicators, pause/resume, keyboard arrows, pointer swipe, focus/hover pause and `prefers-reduced-motion`. A zero-slide API response uses the branded fallback; one slide avoids auto-advance; inactive API slides are ignored.
- Native links/forms are preferred, icons are decorative unless explicitly labelled, and images use meaningful alt text from the API or localized UI.
- Search and directory page controls preserve filters in the URL so results can be linked/reloaded.

## 10. Validation and tests

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Vitest currently verifies:

- public API query serialization and locale-specific cooperative filter mapping;
- server-side pagination query inputs and missing/invalid page normalization;
- API error status/field error values;
- newsletter/contact Zod schema behavior;
- explicit and broad UI permission matching;
- hero slide active-state filtering, order, institutional-first behavior and zero/one-slide fallback.

These are frontend unit tests, not a substitute for backend authorization, Laravel integration, browser E2E, accessibility audits or live API contract tests. Add those in the corresponding execution environment when backend credentials/services are available.

## 11. Deployment checklist

1. Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, optional `NEXT_PUBLIC_SANCTUM_URL`, allowed image domains and actual `ADMIN_SESSION_COOKIE` before build.
2. Confirm exact-origin credentialed CORS, cookie domain/stateful domains, CSRF behavior and session invalidation against the real browser origin.
3. Confirm the API implements every route and type in `api-contract.md`, especially pagination envelopes, PT/EN fields, auth errors, upload response and public publication filtering.
4. Provision CNC admin accounts and permissions in the backend; no demo credentials are shipped.
5. Run lint, typecheck, unit tests and optimized build in CI. Run `npm audit` and triage lockfile advisories before release.
6. Verify `/pt` and `/en` metadata/routes, robots, runtime sitemap, empty states, forms, uploads, media image host allowlist, and authenticated CMS behavior against staging.
7. Monitor request IDs and server errors; do not log passwords, cookies, contact messages or subscriber email lists.
