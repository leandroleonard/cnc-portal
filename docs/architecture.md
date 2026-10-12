# CNC Portal — architecture and integration boundaries

## 1. Scope

This repository is the Next.js frontend for the public CNC portal and private CMS. The private API is a separate FastAPI service. Its persistence implementation is outside this repository's scope; there is no database schema, SQL, FastAPI model, migration or server-side content store here. The HTTP behavior is specified in [`../api-contract.md`](../api-contract.md).

The supplied React Router application was treated as a visual and behavior reference rather than the target runtime. The implementation uses App Router layouts, route segments, server-rendered public pages, shared domain/API modules and reusable client interaction components.

## 2. High-level request flow

```text
Browser
  │
  ├─ public URL (/pt/... or /en/...)
  │    └─ src/proxy.ts (next-intl locale routing; bypasses /admin)
  │         └─ App Router Server Component
  │              └─ src/lib/api/public.ts
  │                   └─ src/lib/api/client.ts ── HTTPS ── FastAPI public API
  │              └─ typed data ── reusable UI / Client Components
  │
  └─ admin URL (/admin/...)
       └─ client-side AdminDashboardLayout guard
            ├─ in-memory token store ── Authorization: Bearer …
            ├─ GET /api/admin/me ── FastAPI validates token/permissions
            └─ client admin page ── admin.ts/media.ts ── FastAPI admin API
```

Public page reads happen on the server where practical and are unauthenticated. Private CMS API calls happen in client components because the bearer token is intentionally held only in browser memory: it is not put into a cookie, storage, a URL, HTML, or a request to the Next.js server. Admin data is rendered only after `/api/admin/me` succeeds.

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
│   └── (dashboard)/               # client bearer-token guard
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

src/proxy.ts                       # locale proxy; /admin routes pass through
```

The route names displayed to users are translated by `src/i18n/routing.ts`; route components use stable internal pathnames. For example, the internal `/actualidade` path is rendered as `/news` in English. The root redirects to the default locale (`/pt`). The admin remains unprefixed at `/admin` and uses a Portuguese-oriented editor UI with separate `pt` and `en` content fields.

### 3.2 Shared components and features

- `src/components/layout`: public header, footer and shell.
- `src/components/home`: API-driven hero slider with accessibility and reduced-motion handling.
- `src/components/cooperatives`, `news`, `documents`, `maps`, `charts`: public domain presentation.
- `src/components/forms`: contact, newsletter and global search.
- `src/components/admin`: CMS shell, client-loaded route views, bilingual forms, tables, uploads and managers.
- `src/components/admin/useAdminResource.ts`: keyed, cancellable client resource loading for admin pages.
- `src/features/home/hero-slides.ts`: deterministic ordering/fallback logic, separated for tests.

The approved visual identity remains navy, green and gold. Shared CSS is in `src/app/globals.css`; admin-specific rules are in `src/app/(admin)/admin.css`. Responsive layout uses component-level classes rather than a generic template replacement.

## 4. Internationalization, SEO and crawlability

- `next-intl` is configured in `src/i18n` with locales `pt` and `en`, localized route aliases, translated navigation and fixed UI messages.
- Public data reads carry an explicit `locale`; the API returns localized titles, names, rich text, categories and settings. Admin edit payloads hold distinct `translations.pt` and `translations.en` values.
- Page metadata is generated from the active locale, including descriptions, canonical URLs and PT/EN alternate links where appropriate. Search is `noindex`.
- `src/app/robots.ts` controls crawl policy; `src/app/sitemap.ts` adds localized static routes and published API-backed article/cooperative slugs. The sitemap uses `force-dynamic` because publishing happens independently of the frontend deployment.
- The sitemap reads both locales and paginates API results in bounded batches. The current implementation caps collection traversal; if CNC content volumes outgrow that bound or the sitemap approaches search-engine limits, add a dedicated paginated backend sitemap feed and split sitemaps.
- The sitemap can contain only content the API reports. If the API is absent, it returns static route entries only.

## 5. API client and data contracts

### 5.1 Modules

- `src/types/domain.ts`: shared resource/domain and CMS input types.
- `src/types/api.ts`: envelopes, pagination, filters and endpoint query inputs.
- `src/lib/api/client.ts`: common `apiRequest`, `adminRequest`, JSON headers, `credentials: omit`, centralized bearer header, in-memory token lifecycle and normalized `ApiError`.
- `src/lib/api/query.ts`: API query encoding, route-query mapping, positive page handling and sort direction normalization.
- `src/lib/api/public.ts`: public endpoint functions.
- `src/lib/api/admin.ts`: admin list/CRUD/manager functions; all protected functions use `adminRequest`.
- `src/lib/api/auth.ts`: OAuth2 token request, current admin identity and optional revocation call.
- `src/lib/api/media.ts`: multipart upload using `adminRequest` and an abort signal. Fetch does not provide portable upload-byte progress, so the UI reports the uploading state and completion rather than claiming byte-accurate progress.
- `src/lib/api/loader.ts`: server route data loading for expected public API-unavailable states.

Components call these functions rather than putting ad-hoc `fetch()` calls in the UI. Public requests use no authentication; private functions explicitly attach `Authorization: Bearer <access_token>`. Every API call uses `credentials: omit` so browser cookies are not part of the auth contract.

### 5.2 Cache and freshness

API client requests default to `cache: 'no-store'`; public information changes through the CMS and private data must not leak across users. Route-level public rendering remains dynamic when reading request search params or API content. Private data is requested from the browser only after authentication. If a future API cache is introduced, it must define explicit tags/revalidation behavior and must never cache admin data across tokens.

### 5.3 Empty/unconfigured API behavior

- `NEXT_PUBLIC_API_URL` is required for live API data.
- Without it, `ApiConfigurationError` reaches a clear configuration state. The frontend does not silently swap in fake lists or example statistics.
- Empty API arrays and `null` totals are rendered as empty/unpublished states.
- The home carousel is the narrow exception: it renders a branded CNC institutional presentation fallback when there is no API institutional slide. That UI fallback uses the static CNC logo and cover artwork; it is not an API record, is not a campaign, and is not shown as a real cooperative/news item.

## 6. Authentication and admin security boundary

### 6.1 OAuth2 bearer lifecycle

The FastAPI contract uses the OAuth2 password-bearer token endpoint:

1. The browser posts `application/x-www-form-urlencoded` fields `username` and `password` to `POST /api/auth/token`.
2. The API returns `access_token`, `token_type: "bearer"`, and optional `expires_in` according to [`api-contract.md`](../api-contract.md).
3. `src/lib/api/client.ts` keeps that token in a module-level in-memory store and starts an expiry timer if `expires_in` is present. It never writes the token to a cookie, URL, HTML, `localStorage` or `sessionStorage`.
4. Admin API calls attach `Authorization: Bearer <access_token>`. `GET /api/admin/me` validates the token and returns the current user/permissions before the protected shell is rendered.
5. Logout optionally asks the API to revoke the token, then clears the in-memory value. A `401` or expiry also clears it and redirects to login.

**Reload behavior:** an in-memory token disappears on refresh or a new tab, so the user signs in again. This is intentional: the app has no refresh token or persistent credential. If the backend later provides a refresh-token flow, it requires a separate security review and contract update; do not silently persist tokens in browser storage.

### 6.2 Private page rendering

The middleware replacement, `src/proxy.ts`, only routes public locales and bypasses `/admin`; it does not authenticate the user. The dashboard layout is a Client Component that subscribes to the token store and calls `/api/admin/me`. All private API reads, uploads and writes are client-side. Server Components may return the non-sensitive page shell, but they do not fetch or serialize private records or tokens.

### 6.3 Authorization and CORS

Permission values in `AdminUser` are used to hide UI controls and navigation only. FastAPI must authorize every endpoint, mutation and record independently. CORS should allow the exact public website origin and the `Authorization`, `Accept` and `Content-Type` headers. The frontend uses `credentials: omit`; cookie auth, CSRF cookies and credentialed CORS are not part of this design. FastAPI should return normalized JSON errors; OAuth token failures may use the standard OAuth `detail` form.

### 6.4 Personal data

Contact messages and newsletter subscriber emails are sensitive. UI screens only display backend-authorized records. Apply least privilege, audit access/export, retention policy and secure transport/storage in the API environment. Never log bearer tokens, credentials, contact messages or subscriber email lists.

## 7. Content editing and uploads

- Translatable resources submit separate PT and EN values. The frontend does not auto-translate or copy missing text.
- Structured content is represented by typed rich-text blocks rather than executable HTML. Future block types must be coordinated between frontend and API.
- The admin media picker consumes a paginated API library. Uploads are multipart, bearer-authorized and abortable. The frontend does not send cookies. Byte-accurate upload progress is not available through the fetch-based credential-free implementation.
- The frontend validates selected file size/type for usability (default control limits vary; the media library currently rejects files above 30 MiB) but FastAPI must independently verify actual file content, size, malware policy, access, storage path and referenced-asset deletion rules.
- The media API returns absolute URLs. Configure `NEXT_PUBLIC_IMAGE_DOMAINS` and the API hostname in Next `remotePatterns` for remote images.

## 8. Cooperative map and data integrity

The map visual is the 2025-era 21-province map asset adapted from Petnog/Wikimedia Commons (CC0 1.0), via paises.net. It is for presentation only. Province records, localized names, IDs and cooperative counts are API data; the code does not insert synthetic province records. Clickable hotspots are manually placed UI targets and not authoritative vector boundaries or GIS coordinates. For accurate geospatial search, the backend must expose validated geometries/coordinates and the frontend must use a proper map provider/dataset under an approved license.

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
- OAuth2 form-encoded login, bearer request headers, omitted browser credentials, in-memory token expiry/clearing, and safe post-login `?next=` redirects;
- newsletter/contact Zod schema behavior;
- explicit and broad UI permission matching;
- hero slide active-state filtering, order, institutional-first behavior and zero/one-slide fallback.

These are frontend unit tests, not a substitute for FastAPI authorization, OAuth token integration, browser E2E, accessibility audits or live API contract tests. Add integration tests in the corresponding backend/staging environment when available.

## 11. Deployment checklist

1. Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` and allowed image domains before build. There are no cookie or Sanctum environment variables.
2. Confirm FastAPI OAuth2 token form response, expiry behavior, `/api/admin/me`, bearer revocation policy and exact-origin CORS preflight against the real website origin.
3. Confirm the API implements every route/type in `api-contract.md`, especially pagination envelopes, PT/EN fields, authorization errors, multipart uploads and public publication filtering.
4. Provision CNC admin accounts and roles in the backend; no demo credentials are shipped.
5. Run lint, typecheck, unit tests and optimized build in CI. Run `npm audit` and triage lockfile advisories before release.
6. Verify `/pt` and `/en` metadata/routes, robots, runtime sitemap, empty states, forms, uploads, image host allowlist, and authenticated CMS behavior against staging.
7. Monitor request IDs and server errors; do not log passwords, bearer tokens, contact messages or subscriber email lists.
