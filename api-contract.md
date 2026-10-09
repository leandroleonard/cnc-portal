# CNC — Public and Admin API Contract

**Status:** frontend integration contract / API v1  
**Audience:** Laravel API team and CNC frontend maintainers  
**API root:** `NEXT_PUBLIC_API_URL` (the host/root only; paths below include `/api`)  
**Locales:** `pt` (Português) and `en` (English)

This document describes the HTTP behavior consumed by the Next.js application. It is **not** a database schema, SQL specification, Laravel model/migration plan, or implementation prescription. The API is authoritative for content, publication state, authentication, permissions, and validation. The frontend contains no fictional cooperative, article, document, or statistics records. In particular, the client-provided “Agritech Show Luanda 2026” material, if approved, is backend/API seed content and is not a hardcoded public article here.

The routes, payloads and response shapes below are the contract the current frontend expects. Backend-only additions are allowed when they remain backwards compatible. Breaking changes require coordinated frontend and API versioning.

---

## 1. Conventions

### 1.1 HTTP and serialization

- Serve HTTPS in production; encode request and response bodies as UTF-8 JSON except file uploads.
- Requests send `Accept: application/json`; JSON mutations send `Content-Type: application/json`.
- The frontend sends `credentials: include` for API calls. Do not require a bearer token in browser storage.
- Dates/timestamps use ISO 8601/RFC 3339 UTC strings (for example `2026-10-09T12:30:00Z`). Date-only values use `YYYY-MM-DD`.
- IDs are opaque strings. Slugs are URL-safe identifiers and must be unique within the relevant content type and locale policy.
- Unknown response fields may be added. Do not rename or change the meaning of fields in this contract without a coordinated version change.

### 1.2 Success envelopes

A single resource uses:

```json
{ "data": { "id": "opaque-id" } }
```

A collection uses:

```json
{
  "data": [],
  "meta": {
    "currentPage": 1,
    "perPage": 12,
    "total": 0,
    "lastPage": 1,
    "from": null,
    "to": null
  }
}
```

Pagination fields are required for paginated endpoints. `from` and `to` are one-based item positions or `null` for an empty page. `lastPage` is at least `1`. Single-resource endpoints may include non-pagination `meta`, but the frontend does not depend on it.

### 1.3 Error envelope

Preferred error shape:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "The request could not be validated.",
    "errors": { "email": ["Enter a valid email address."] },
    "requestId": "req_01J..."
  }
}
```

`errors` maps field names to arrays of human-readable messages and is optional. `requestId` is useful for logs and support and is optional. For compatibility with Laravel validation middleware, the frontend also reads a top-level `{ "message": "...", "errors": { ... } }` body.

Common HTTP meanings:

| Status | Meaning | Typical codes |
|---|---|---|
| `400` | malformed query/body or unsupported operation | `invalid_request`, `invalid_filter` |
| `401` | no valid admin session / failed credentials | `unauthenticated`, `invalid_credentials` |
| `403` | authenticated but not permitted, or CSRF origin/session rejection | `forbidden`, `csrf_mismatch` |
| `404` | resource or public slug is not visible | `not_found` |
| `409` | duplicate slug, state conflict, or media asset still referenced | `conflict`, `duplicate_slug` |
| `413` | upload too large | `file_too_large` |
| `422` | field or domain validation failed | `validation_failed` |
| `429` | rate limit reached | `rate_limited` |
| `500` / `503` | unexpected or temporarily unavailable service | `internal_error`, `service_unavailable` |

Never return secrets, session values, password hashes, internal storage paths, or unpublished content in an error body.

### 1.4 Locale and separate PT/EN content

- Every public content read accepts `locale=pt|en`; it returns the requested translation, not both languages mixed together.
- Admin write inputs for translatable content use a `translations` object with separate `pt` and `en` values. Do not silently copy one language into the other. A missing translation may be saved as a draft only where the resource rules below allow it; publishing requires all required localized fields.
- Fixed interface labels are translated by the frontend. API-provided names, titles, summaries, category labels, alt text, and rich text must be returned in the requested locale.
- If a requested translation is unavailable, return an explicit `404`/`translation_not_found`, or return the same resource with a documented fallback marker. The current frontend assumes the API returns the selected translation; silent language mixing is not recommended.

### 1.5 Pagination, filtering and sorting

- All collection endpoints are server-side paginated. Default `page=1`; maximum `perPage=100`. Reject, clamp or safely normalize invalid values consistently; the frontend sends positive pages and usually 10–20 items.
- Search and filters are applied before pagination. `total` is the total matching records, not just the page size.
- Sort fields must be allow-listed by endpoint. Unknown sort keys must not become arbitrary database columns; return `400 invalid_filter` or use a documented default.
- Query names use camelCase in the API even where a Portuguese URL uses Portuguese names. The browser adapter maps them (for example, `provincia` → `province`).

---

## 2. Shared domain shapes

These concise JSON examples illustrate the fields the frontend uses. Optional values may be `null` or omitted, but the API must keep each field's meaning stable.

### 2.1 Media

```json
{
  "id": "media_01",
  "url": "https://media.cnc.ao/arquivo.jpg",
  "thumbnailUrl": "https://media.cnc.ao/arquivo-thumb.jpg",
  "filename": "arquivo.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 204800,
  "altText": "Cooperativas de Angola",
  "caption": null,
  "width": 1600,
  "height": 900
}
```

### 2.2 Pagination metadata

```json
{ "currentPage": 1, "perPage": 12, "total": 28, "lastPage": 3, "from": 1, "to": 12 }
```

### 2.3 Rich text blocks

Public article and institutional rich text uses a safe structured block array; do not return executable HTML. Supported blocks:

```json
[
  { "type": "paragraph", "text": "Texto aprovado…" },
  { "type": "heading", "level": 2, "text": "Subtítulo" },
  { "type": "quote", "text": "Citação…", "attribution": "Fonte" },
  { "type": "list", "ordered": false, "items": ["Item A", "Item B"] },
  { "type": "image", "media": { "id": "media_01", "url": "https://media.cnc.ao/arquivo.jpg", "altText": "Descrição" }, "caption": "Legenda" }
]
```

The frontend renders only these known block types and treats external links/media URLs as untrusted input. Any future block type needs a frontend release before it becomes required.

---

## 3. Public API

All public routes below are unauthenticated, return only active/published/publicly approved material, and use the standard success/error envelopes. Public endpoints must not reveal admin-only fields, private contact details, draft content or pending cooperative records.

### 3.1 Home, hero and site settings

| Method and path | Query/body | Response |
|---|---|---|
| `GET /api/public/home` | required `locale` | `{ data: PublicHome }` |
| `GET /api/public/site-settings` | required `locale` | `{ data: SiteSettings }` |
| `GET /api/public/hero-slides` | required `locale` | `{ data: HeroSlide[] }` |

`PublicHome` contains `locale`, `heroSlides`, nullable `statistics` totals, and API-selected `featuredCooperatives`, `latestNews`, `featuredDocuments`, and `activities`. Empty arrays are valid and mean no items are published. Statistics values not yet supplied must be `null`, never fabricated zeroes. Individual feed collections can be empty.

A hero slide has `id`, `kind` (`institutional|cooperative|campaign`), `title`, optional `subtitle` and `description`, optional `image`/`logo`, optional `primaryAction`/`secondaryAction` (`{label,href}`), numeric `order`, `active`, and returned `locale`. The public API should return active slides in order and include the approved CNC institutional slide first when configured. The client pins an institutional slide first and supplies a branded non-content fallback only when the API has no institutional slide; a backend-provided active slide is never fabricated by the client.

`SiteSettings` contains `locale`, `organizationName`, optional `logo`, `faviconUrl`, `phone`, `email`, `address`, `footerText`, `socialLinks`, and optional `updatedAt`. Only active, public social links should be exposed.

Example:

```json
{
  "data": {
    "locale": "pt",
    "heroSlides": [],
    "statistics": { "cooperatives": null, "members": null, "provinces": null, "activities": null },
    "featuredCooperatives": [],
    "latestNews": [],
    "featuredDocuments": [],
    "activities": []
  }
}
```

### 3.2 Cooperatives directory and map resources

| Method and path | Query | Response |
|---|---|---|
| `GET /api/public/cooperatives` | `locale`, `search`, `province`, `municipality`, `activity`, `status`, `type`, `page`, `perPage`, `sort`, `direction` | paginated `CooperativeSummary[]` |
| `GET /api/public/cooperatives/{slug}` | required `locale` | `{ data: Cooperative }` |
| `GET /api/public/cooperatives/filters` | required `locale` | `{ data: CooperativeFacets }` |
| `GET /api/public/provinces` | required `locale` | `{ data: Province[] }` |
| `GET /api/public/municipalities` | `locale`, optional `provinceId` | `{ data: Municipality[] }` |
| `GET /api/public/activities` | required `locale` | `{ data: Activity[] }` |

Filter behavior:

- `search` searches public names/summaries and approved searchable fields, server-side.
- `province`, `municipality`, `activity`, `status`, and `type` accept stable slugs/codes or IDs as agreed by the API team; prefer slugs for URL-facing values and document the accepted form. The frontend currently sends province/activity/municipality slugs.
- `sort` defaults to `name`; allowed values should include `name` and `updatedAt`. `direction` is `asc|desc`.
- Public lists/detail must include only approved active cooperatives. The optional status filter must never make unpublished/pending records visible.
- `GET /filters` returns localized labels and only filter values relevant to public records. Empty options are valid.
- `GET /municipalities?provinceId=...` restricts results to that province. Omit `provinceId` to return the public set if appropriate.

`CooperativeSummary` fields: `id`, `slug`, localized `name`, optional `summary`, optional `logo`/`coverImage`, localized `province` reference (`id`, `code`, `slug`, `name`), optional `municipality`, `activityNames`, public `status`, and optional `updatedAt`.

`Cooperative` adds optional `commune`, public `address`/`description`, `type`, `registrationNumber`, `foundedYear`, `memberCount`, `products`, `services`, explicitly public `contacts`, `socialLinks`, nullable `location` (`latitude`, `longitude`, optional address), `gallery`, `documents`, and related cooperative summaries. PII or unverified values must be omitted.

Example list query:

```http
GET /api/public/cooperatives?locale=pt&province=huambo&activity=agriculture&page=1&perPage=12&sort=name&direction=asc
```

### 3.3 News and announcements

| Method and path | Query | Response |
|---|---|---|
| `GET /api/public/news` | `locale`, optional `search`, `category`, `featured`, `page`, `perPage`, `sort`, `direction` | paginated `NewsArticleSummary[]` |
| `GET /api/public/news/categories` | required `locale` | `{ data: NewsCategory[] }` |
| `GET /api/public/news/{slug}` | required `locale` | `{ data: NewsArticle }` |

Only `published` articles whose publication time has arrived are public. Recommended sort fields: `publishedAt` and `title`; default `publishedAt desc`. `category` accepts a category slug or agreed stable identifier. `featured` is a boolean.

A summary contains `id`, `slug`, localized `title`, optional `summary`, localized `category` (`id`, `slug`, `name`), `publishedAt`, `featured`, optional `image`, and optional `author`. Detail adds localized `content` blocks, optional `gallery`, `videos`, `documents`, `links`, `related` summaries, and `updatedAt`. Return `404` for missing or non-public slugs.

### 3.4 Documents and publications

| Method and path | Query | Response |
|---|---|---|
| `GET /api/public/documents` | `locale`, optional `search`, `category`, `year`, `fileType`, `page`, `perPage`, `sort`, `direction` | paginated `DocumentItem[]` |
| `GET /api/public/documents/filters` | required `locale` | `{ data: DocumentFacets }` |

Only published documents are public. The `language` field identifies the document/file language and is distinct from the locale used for the document's title/description. A document contains `id`, `slug`, localized `title`, optional `description`, localized `category`, optional `year`, `language`, `fileUrl`, `fileType`, optional `fileSizeBytes`, `publishedAt`, and `updatedAt`. The filter resource returns categories, available years and file types; values are API-derived, not seeded by the client.

### 3.5 Statistics

| Method and path | Query | Response |
|---|---|---|
| `GET /api/public/statistics` | required `locale` | `{ data: StatisticsDataset }` |

`StatisticsDataset` contains `generatedAt`; `totals` (`cooperatives`, `members`, `provinces`, `activities`, each `number|null`); `byProvince`, `byActivity`, and `byStatus` arrays of `{id,label,value,code?}`; `evolution` items `{period,value}`; and optional `territorialIndicators`. Return only CNC-approved aggregates, document the source/period in labels or accompanying API metadata where available, and use `null`/empty arrays while unpublished. Do not return fictional zeros or inferred counts.

### 3.6 Institutional content

| Method and path | Query | Response |
|---|---|---|
| `GET /api/public/institutional` | required `locale` | `{ data: InstitutionalPage }` |

`InstitutionalPage` contains `locale`, localized `title`, optional `summary`, ordered `sections`, and optional `updatedAt`. A section includes `id`, stable `key`, localized `title`, optional `body` and/or structured `content`, optional `image`, `order`, and `active`. Return only active sections. Empty sections are valid and the frontend displays a clearly labelled no-content state.

### 3.7 Global search

| Method and path | Query | Response |
|---|---|---|
| `GET /api/public/search` | required `locale`, required `q`, optional comma-separated `types`, `page`, `perPage` | paginated `GlobalSearchResult[]` |

Supported `types`: `cooperative,news,document,institutional`. Search only the requested locale and public/active records. Each result contains `id`, `type`, localized `title`, optional `summary`, a same-site localized `url` or safe absolute URL, optional `image`, and optional `date`. Apply pagination server-side. Empty `q` may return `422` or an empty collection; the frontend does not call the API for an empty query.

Example:

```http
GET /api/public/search?locale=en&q=cooperative&types=cooperative,news&page=1&perPage=10
```

### 3.8 Contact messages submitted by the public

| Method and path | Auth | Body | Success |
|---|---|---|---|
| `POST /api/public/contact` | none | `ContactPayload` | `201` `{data:{reference,receivedAt}}` |

Body fields: `name` (2–120 characters), valid `email`, optional `phone` (maximum 40 characters), `subject` (2–160 characters), `message` (10–5000 characters), and `locale` (`pt|en`). Trim surrounding whitespace. Apply server-side validation, abuse controls/rate limits, and appropriate retention/access controls. Do not return or expose the message publicly.

Example:

```json
{
  "name": "Ana Silva",
  "email": "ana@example.ao",
  "phone": "+244 900 000 000",
  "subject": "Informação sobre o portal",
  "message": "Gostaria de obter mais informações sobre os serviços do CNC.",
  "locale": "pt"
}
```

Successful response:

```json
{ "data": { "reference": "CN-2026-00001", "receivedAt": "2026-10-09T12:30:00Z" } }
```

### 3.9 Newsletter subscription

| Method and path | Auth | Body | Success |
|---|---|---|---|
| `POST /api/public/newsletter/subscriptions` | none | `{email,locale}` | `200`/`201` `{data:{status,subscriptionId?}}` |

Validate and normalize email on the server. `locale` is `pt|en`. Repeated requests for an already-active address must be idempotent and return `status: "already_subscribed"` rather than creating duplicate active subscriptions. New records return `status: "subscribed"`; do not expose subscriber lists through public APIs. Use `429` and/or a challenge mechanism for abuse. If double opt-in is enabled, document the pending status and confirmation link flow; the current frontend response type is `subscribed|already_subscribed`.

---

## 4. Admin authentication and authorization

### 4.1 Session lifecycle

All `/api/admin/*` routes except `POST /api/admin/login` require a valid server-side CNC admin session. The frontend neither stores access tokens in `localStorage` nor treats a cookie's mere presence as proof of authorization. `GET /api/admin/me` validates the session and permissions with the backend.

The application is wired for Laravel Sanctum cookie-based SPA sessions:

1. Before login the browser requests `GET {NEXT_PUBLIC_SANCTUM_URL}/sanctum/csrf-cookie` with credentials.
2. The browser posts credentials to `/api/admin/login` with cookies and the `X-XSRF-TOKEN` value when supplied by the backend.
3. The API sets an `HttpOnly`, `Secure` (production), appropriately scoped session cookie and an XSRF cookie that is readable by the browser. The cookie name must match `ADMIN_SESSION_COOKIE` in the frontend environment (default `cnc_admin_session`; use the actual Sanctum session cookie name if different).
4. Subsequent requests include credentials. The dashboard server forwards the incoming cookie to `/api/admin/me`.
5. `POST /api/admin/logout` invalidates the server session and expires the cookies.

For cross-origin deployments, configure exact allowed frontend origins, credentialed CORS, allowed headers (`Accept`, `Content-Type`, `X-XSRF-TOKEN`), and the correct cookie domain/SameSite policy. A same-site reverse proxy/API subdomain under the CNC website domain is preferred. Do not use wildcard origins with credentials. If the API uses a different CSRF handshake, coordinate and update the frontend client rather than disabling CSRF protection.

### 4.2 Login and identity

| Method and path | Auth | Body / query | Response |
|---|---|---|---|
| `POST /api/admin/login` | guest; rate-limited | `{email,password,remember?}` | `{data:{user:AdminUser}}` and session cookie |
| `GET /api/admin/me` | session | none | `{data:AdminUser}` |
| `POST /api/admin/logout` | session + CSRF | none | `{data:{loggedOut:true}}` |

`AdminUser` contains `id`, `name`, `email`, `role`, `permissions: string[]`, and optional `avatar`. Login failure returns `401 invalid_credentials` without revealing whether the email exists. `remember` is optional and defaults to false. Enforce throttling, session rotation after login, expiry/invalidation, and server-side role/permission checks.

### 4.3 Permission model

Permissions are returned as explicit strings on `AdminUser`; the frontend uses them to hide/disable controls only. The API **must independently authorize every operation**, every record, and every mutation. Suggested action strings used by the frontend:

| Resource | Read | Create | Update/manage | Delete/publish |
|---|---|---|---|---|
| Dashboard | `dashboard.view` | — | — | — |
| Hero slides | `hero-slides.view` | `hero-slides.create` | `hero-slides.update` | `hero-slides.delete`; ordering requires update/manage |
| Cooperatives | `cooperatives.view` | `cooperatives.create` | `cooperatives.update` | if enabled, `cooperatives.delete`; status changes require update/publish |
| News | `news.view` | `news.create` | `news.update` | `news.delete`; publication requires `news.publish` or `news.update` as policy specifies |
| Documents | `documents.view` | `documents.create` | `documents.update` | `documents.delete`; publication requires update/publish |
| Institutional content | `institutional.view` | — | `institutional.update` | — |
| Statistics | `statistics.view` | `statistics.manage` | `statistics.manage` | `statistics.manage` |
| Media | `media.view` | `media.create` | `media.update` | `media.delete` |
| Social links | `social-links.view` | `social-links.manage` | `social-links.manage` | `social-links.manage` |
| Newsletter subscribers | `newsletter.view` | — | optional export/manage policy | — |
| Contact messages | `contact-messages.view` | — | `contact-messages.update` | — |
| Site settings | `settings.view` | — | `settings.manage` | — |

`*` and `admin.content.manage` may be used as broad UI grants if CNC policy intends that behavior. Never rely on a frontend permission helper as authorization.

---

## 5. Admin list query convention

Most admin collection endpoints accept:

- `search`: optional server-side text search.
- `status`: optional allowed resource status.
- `page`, `perPage`: server-side pagination, max `100`.
- `sort`, `direction`: allow-listed sort (`asc|desc`).

Media additionally accepts `mimeType` (`image` means any `image/*`; otherwise a documented MIME or prefix). Admin list views must not download the whole dataset to filter it in the browser.

---

## 6. Admin content API

The following routes require a valid session plus the resource permission in §4.3. Create/update responses return the canonical saved record, including server IDs, timestamps, localized fields, and any normalized status.

### 6.1 Dashboard

| Method and path | Permission | Response |
|---|---|---|
| `GET /api/admin/dashboard` | `dashboard.view` | `{data:DashboardSummary}` |

`DashboardSummary` contains totals (`cooperatives`, `publishedNews`, `documents`, `activeHeroSlides`, `newsletterSubscribers`, `pendingContactMessages`), recent news/cooperatives, and `recentActivity` items (`id`, `action`, `entityType`, `entityId`, `entityLabel`, `actorName`, `createdAt`). Counts are backend-calculated and should reflect the logged-in user's policy scope.

### 6.2 Hero carousel

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/hero-slides` | `hero-slides.view` | admin list query | paginated `AdminHeroSlideRecord[]` |
| `GET /api/admin/hero-slides/{id}` | `hero-slides.view` | — | one record |
| `POST /api/admin/hero-slides` | `hero-slides.create` | `HeroSlideInput` | `201` one record |
| `PATCH /api/admin/hero-slides/{id}` | `hero-slides.update` | partial `HeroSlideInput` | one record |
| `DELETE /api/admin/hero-slides/{id}` | `hero-slides.delete` | — | `{data:{deleted:true}}` or `204` |
| `PUT /api/admin/hero-slides/reorder` | `hero-slides.update` | `{items:[{id,order}]}` | `{data:{updated:number}}` |

`HeroSlideInput`: `kind`, optional `imageId`/`logoId`, complete `translations.pt` and `translations.en` entries (`title`, optional `subtitle`, `description`, localized optional primary/secondary actions), integer `order`, and `active`. Validate action destinations, media references, non-negative/order collision policy, required image/content, and at most one active institutional slide according to CNC policy. Publishing/activating must not expose an incomplete or unapproved slide.

### 6.3 Cooperatives

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/cooperatives` | `cooperatives.view` | admin list query | paginated cooperative summaries (admin list title in PT unless a later contract adds locale) |
| `GET /api/admin/cooperatives/{id}` | `cooperatives.view` | — | bilingual `AdminCooperativeRecord` |
| `POST /api/admin/cooperatives` | `cooperatives.create` | `CooperativeInput` | `201` record |
| `PATCH /api/admin/cooperatives/{id}` | `cooperatives.update` | partial `CooperativeInput` | record |
| `PATCH /api/admin/cooperatives/{id}/status` | `cooperatives.update` | `{status}` | record |

`CooperativeInput` requires `slug`, PT+EN `translations` (`name`, optional `summary`/`description`), `provinceId`, `activityIds`, and `status` (`active|pending_review|inactive`). Optional fields: `municipalityId`, `commune`, `address`, `type`, `registrationNumber`, `foundedYear`, non-negative `memberCount`, `logoId`, `coverImageId`, `galleryIds`, public `contacts`, and `location` coordinates/address. Validate province/municipality consistency, unique slug, references, coordinate ranges, and all publication requirements. Inactive/pending records remain private from public API results.

The current frontend has no cooperative `DELETE` function; do not require it for client operation. Prefer archival/status changes unless CNC policy separately adds a deletion flow.

### 6.4 News and categories

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/news` | `news.view` | admin list query | paginated `AdminNewsListItem[]` |
| `GET /api/admin/news/{id}` | `news.view` | — | bilingual `AdminNewsRecord` |
| `POST /api/admin/news` | `news.create` | `NewsInput` | `201` record |
| `PATCH /api/admin/news/{id}` | `news.update` | partial `NewsInput` | record |
| `DELETE /api/admin/news/{id}` | `news.delete` | — | `{data:{deleted:true}}` or `204` |
| `GET /api/admin/news/categories` | `news.view` | — | `{data:AdminNewsCategory[]}` |

`NewsInput`: `slug`, `categoryId`, PT+EN `translations` (`title`, optional `summary`, structured `content`), optional `imageId`, `galleryIds`, `documentIds`, `relatedArticleIds`, `author`, `status` (`draft|published|scheduled`), `featured`, and optional `publishedAt`/`scheduledAt`. Validate translated titles/content, category/media references, unique route slug policy, schedule consistency, safe block types/lengths, and permission to publish. Only published, due articles are visible publicly. Categories are currently read-only in the CMS; add category mutations only with a coordinated frontend requirement.

### 6.5 Documents

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/documents` | `documents.view` | admin list query | paginated `AdminDocumentListItem[]` |
| `GET /api/admin/documents/{id}` | `documents.view` | — | bilingual `AdminDocumentRecord` |
| `POST /api/admin/documents` | `documents.create` | `DocumentInput` | `201` record |
| `PATCH /api/admin/documents/{id}` | `documents.update` | partial `DocumentInput` | record |
| `DELETE /api/admin/documents/{id}` | `documents.delete` | — | `{data:{deleted:true}}` or `204` |
| `GET /api/admin/documents/categories` | `documents.view` | — | `{data:AdminDocumentCategory[]}` |

`DocumentInput`: `slug`, `categoryId`, PT+EN `translations` (`title`, optional `description`), `language` (`pt|en`), optional `year`, required `mediaId`, `status` (`draft|published`), and optional `publishedAt`. Validate publication completeness, safe file types, referenced media, and unique slug. Public queries return published files only. Category mutation is not currently exposed by the frontend.

### 6.6 Province/activity selectors and institutional CMS

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/activities` | `cooperatives.view` | — | `{data:Activity[]}` |
| `GET /api/admin/provinces` | `cooperatives.view` | `includeMunicipalities=true` | provinces with municipality arrays |
| `GET /api/admin/institutional` | `institutional.view` | — | `{data:InstitutionalSectionInput[]}` |
| `PUT /api/admin/institutional` | `institutional.update` | `{sections:InstitutionalSectionInput[]}` | saved sections |

`InstitutionalSectionInput`: `key`, PT+EN translations (`title`, optional `body`, optional `content`), optional `imageId`, integer `order`, `active`. The PUT replaces the ordered section set for these managed sections; validate every item and preserve server-owned IDs where relevant. Do not allow an invalid partial payload to erase all current content.

### 6.7 Statistics manager

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/statistics` | `statistics.view` | admin list query | paginated `AdminStatisticIndicator[]` |
| `POST /api/admin/statistics` | `statistics.manage` | `StatisticIndicatorInput` | `201` indicator |
| `PATCH /api/admin/statistics/{id}` | `statistics.manage` | `StatisticIndicatorInput` without `id` | indicator |
| `DELETE /api/admin/statistics/{id}` | `statistics.manage` | — | `{data:{deleted:true}}` or `204` |

Input fields: optional `id` in the client form only; `key`; PT+EN `translations` (`label`, optional `description`); numeric `value`; optional `unit`, `period`, `provinceId`, `activityId`; and `published`. Values and source periods must be CNC-validated. Public statistics should be computed from approved indicators and not expose draft/unpublished indicators. Client-supplied `id` is removed from the PATCH body and sent in the route.

### 6.8 Media library and uploads

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/media` | `media.view` | admin list query + optional `mimeType` | paginated `MediaAsset[]` |
| `POST /api/admin/media` | `media.create` | multipart fields below | `201` `{data:MediaAsset}` |
| `PATCH /api/admin/media/{id}` | `media.update` | `{altText?,caption?}` | `{data:MediaAsset}` |
| `DELETE /api/admin/media/{id}` | `media.delete` | — | `{data:{deleted:true}}` or `204` |

Upload uses `multipart/form-data` with `file` (required), optional `altText`, `caption`, and `locale`. The browser currently checks a 20 MiB default maximum and selects only the accepted file types configured on each control; backend limits remain authoritative and should return `413` or `422` with a useful message. Validate actual file signatures/MIME, size, extension, malware policy, image dimensions, and user permission. Generate opaque URLs; do not return internal filesystem paths. If an asset is still referenced, either reject deletion with `409 media_in_use` or define a safe detach/replacement policy.

The upload client sends credentials, uses XSRF when present, reports upload progress, and supports abort. The API must allow credentialed CORS for the upload origin.

### 6.9 Social links

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/social-links` | `social-links.view` | — | `{data:SocialNetwork[]}` |
| `POST /api/admin/social-links` | `social-links.manage` | `SocialLinkInput` | `201` link |
| `PATCH /api/admin/social-links/{id}` | `social-links.manage` | partial `SocialLinkInput` | link |
| `DELETE /api/admin/social-links/{id}` | `social-links.manage` | — | deleted result or `204` |
| `PUT /api/admin/social-links/reorder` | `social-links.manage` | `{items:[{id,order}]}` | `{data:{updated:number}}` |

`SocialLinkInput`: platform (`facebook|instagram|youtube|linkedin|x|whatsapp`), absolute `https` URL (WhatsApp may use the approved `https://wa.me/` format), `active`, and integer `order`. Validate allowed hosts/schemes to prevent unsafe `javascript:` links. Public settings return active links only.

### 6.10 Newsletter subscribers

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/newsletter/subscribers` | `newsletter.view` | admin list query | paginated `NewsletterSubscription[]` |

Each result contains `id`, normalized `email`, status (`active|unsubscribed|pending`), and `subscribedAt`. Subscriber email is personal data: restrict roles, audit exports/access, and follow CNC retention/consent policy. No subscriber update/delete action is currently wired in the frontend.

### 6.11 Contact messages

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/contact-messages` | `contact-messages.view` | admin list query | paginated `ContactMessage[]` |
| `PATCH /api/admin/contact-messages/{id}/status` | `contact-messages.update` | `{status}` | `{data:ContactMessage}` |

Status values are `new|read|responded|archived`. Returned records contain `id`, `name`, `email`, optional `phone`, `subject`, `message`, `locale`, `status`, `receivedAt`, and optional `updatedAt`. Access is sensitive and should be audited. Update requests must reject unsupported transitions/status values with `422`.

### 6.12 Site settings

| Method and path | Permission | Query/body | Success |
|---|---|---|---|
| `GET /api/admin/settings` | `settings.view` | — | `{data:SiteSettingsInput}` |
| `PUT /api/admin/settings` | `settings.manage` | `SiteSettingsInput` | saved settings |

Input: optional `logoId`, optional legacy-compatible `logo` media object, `faviconUrl`, required PT+EN `translations` (`organizationName`, optional `footerText`, optional `address`), optional `phone` and `email`. Validate links/contact values and referenced media. This is content/settings data, not a secret store; credentials and API keys must never be managed here.

---

## 7. Validation, security and operational guarantees

1. **Backend authority:** authenticate and authorize every admin call on the server; never trust client role/permission flags.
2. **CSRF/CORS:** use the session framework's CSRF controls for mutations; permit only explicitly configured frontend origins with credentials.
3. **Validation:** repeat all client Zod checks on the API, including type, length, format, references, translation completeness, and workflow transitions.
4. **Uploads:** validate file content, not just the browser `accept` attribute; configure size/type limits, scanning, storage and cache policy. Do not expose storage internals.
5. **Search:** apply bounded, parameterized, allow-listed search/sort/filter queries; return stable pagination metadata.
6. **Abuse protection:** rate-limit login, contact submission, newsletter sign-up, and expensive searches. Return `429` with a retry message/header where appropriate.
7. **Privacy:** keep subscriber/contact data admin-only, least-privilege, logged, and subject to CNC retention/consent rules.
8. **Content safety:** validate localized rich-text blocks, URLs, embeds and action links; sanitize any future HTML at the API boundary. Current frontend expects structured blocks rather than raw HTML.
9. **Consistency:** mutations return the canonical saved record. Reorder operations should be atomic and return the affected count. Delete operations should explain conflicts rather than silently orphan references.
10. **Empty data:** zero published records is a valid state. Return empty arrays and accurate pagination metadata; never manufacture example content or statistics to fill a page.

## 8. Frontend integration inventory

The typed endpoint functions are centralized in `src/lib/api/public.ts`, `src/lib/api/admin.ts`, `src/lib/api/auth.ts`, and `src/lib/api/media.ts`; query serialization is in `src/lib/api/query.ts`; shared request/error handling is in `src/lib/api/client.ts`; API-facing TypeScript shapes are in `src/types/api.ts` and `src/types/domain.ts`. Components should use these functions rather than making ad-hoc fetch calls.

Contract changes should update those types/functions, this document, API integration tests, and any public/admin UI affected by the change. The frontend does not create Laravel models, database tables, migrations, or SQL.