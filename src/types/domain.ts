export type Locale = 'pt' | 'en';
export type Localized<T> = Record<Locale, T>;

export type Media = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
  altText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
};

export type ProvinceReference = { id: string; code: string; slug: string; name: string };
export type Province = ProvinceReference & {
  municipalityCount?: number | null;
  cooperativeCount?: number | null;
  centroid?: { latitude: number; longitude: number } | null;
};
export type Municipality = { id: string; provinceId: string; slug: string; name: string; cooperativeCount?: number | null };
export type Activity = { id: string; slug: string; name: string; cooperativeCount?: number | null };

export type CooperativeStatus = 'active' | 'pending_review' | 'inactive';
export type CooperativeType = 'production' | 'services' | 'consumption' | 'credit' | 'mixed' | 'other';
export type CooperativeFacets = {
  statuses: Array<{ value: CooperativeStatus; label: string }>;
  types: Array<{ value: CooperativeType | string; label: string }>;
};
export type DocumentFacets = {
  categories: Array<{ id: string; slug: string; name: string }>;
  years: number[];
  fileTypes: string[];
};

export type CooperativeSummary = {
  id: string;
  slug: string;
  name: string;
  summary?: string | null;
  logo?: Media | null;
  coverImage?: Media | null;
  province: ProvinceReference;
  municipality?: Municipality | null;
  activityNames: string[];
  status: CooperativeStatus;
  updatedAt?: string | null;
};

export type SocialNetwork = {
  id: string;
  platform: 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'x' | 'whatsapp';
  url: string;
  active: boolean;
  order: number;
};

export type DocumentItem = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category: { id: string; slug: string; name: string };
  year?: number | null;
  language: Locale;
  fileUrl: string;
  fileType: string;
  fileSizeBytes?: number | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
};

export type Cooperative = CooperativeSummary & {
  commune?: string | null;
  address?: string | null;
  description?: string | null;
  type?: CooperativeType | string | null;
  registrationNumber?: string | null;
  foundedYear?: number | null;
  memberCount?: number | null;
  products?: Array<{ name: string; description?: string | null }>;
  services?: Array<{ name: string; description?: string | null }>;
  contacts?: { email?: string | null; phone?: string | null; website?: string | null } | null;
  socialLinks?: SocialNetwork[];
  location?: { latitude: number; longitude: number; address?: string | null } | null;
  gallery?: Media[];
  documents?: Array<Pick<DocumentItem, 'id' | 'title' | 'fileUrl' | 'fileType' | 'fileSizeBytes'>>;
  related?: CooperativeSummary[];
};

export type HeroAction = { label: string; href: string };
export type HeroSlide = {
  id: string;
  kind: 'institutional' | 'cooperative' | 'campaign';
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image?: Media | null;
  logo?: Media | null;
  primaryAction?: HeroAction | null;
  secondaryAction?: HeroAction | null;
  order: number;
  active: boolean;
  locale: Locale;
};

export type RichTextBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'quote'; text: string; attribution?: string | null }
  | { type: 'image'; media: Media; caption?: string | null }
  | { type: 'list'; ordered: boolean; items: string[] };

export type NewsCategory = { id: string; slug: string; name: string };
export type AdminNewsCategory = { id: string; slug: string; translations: Localized<{ name: string; description?: string }> };
export type AdminDocumentCategory = { id: string; slug: string; translations: Localized<{ name: string; description?: string }> };
export type NewsArticleSummary = {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  category: NewsCategory;
  publishedAt: string;
  featured: boolean;
  image?: Media | null;
  author?: string | null;
};
export type NewsArticle = NewsArticleSummary & {
  content: RichTextBlock[];
  gallery?: Media[];
  videos?: Array<{ title?: string | null; url: string; provider?: string | null }>;
  documents?: Array<Pick<DocumentItem, 'id' | 'title' | 'fileUrl' | 'fileType' | 'fileSizeBytes'>>;
  links?: Array<{ label: string; url: string }>;
  related?: NewsArticleSummary[];
  updatedAt?: string | null;
};

export type StatisticBreakdownItem = { id: string; label: string; value: number; code?: string | null };
export type StatisticsDataset = {
  generatedAt: string;
  totals: { cooperatives: number | null; members: number | null; provinces: number | null; activities: number | null };
  byProvince: StatisticBreakdownItem[];
  byActivity: StatisticBreakdownItem[];
  byStatus: StatisticBreakdownItem[];
  evolution: Array<{ period: string; value: number }>;
  territorialIndicators?: Array<{ province: ProvinceReference; value: number; label: string }>;
};

export type InstitutionalSection = {
  id: string;
  key: string;
  title: string;
  body?: string | null;
  content?: RichTextBlock[];
  image?: Media | null;
  order: number;
  active: boolean;
};
export type InstitutionalPage = { locale: Locale; title: string; summary?: string | null; sections: InstitutionalSection[]; updatedAt?: string | null };

export type SiteSettings = {
  locale: Locale;
  logo?: Media | null;
  faviconUrl?: string | null;
  organizationName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  footerText?: string | null;
  socialLinks: SocialNetwork[];
  updatedAt?: string | null;
};

export type PublicHome = {
  locale: Locale;
  heroSlides: HeroSlide[];
  statistics?: StatisticsDataset['totals'] | null;
  featuredCooperatives: CooperativeSummary[];
  latestNews: NewsArticleSummary[];
  featuredDocuments: DocumentItem[];
  activities: Activity[];
};

export type GlobalSearchResult = {
  id: string;
  type: 'cooperative' | 'news' | 'document' | 'institutional';
  title: string;
  summary?: string | null;
  url: string;
  image?: Media | null;
  date?: string | null;
};
export type ContactPayload = { name: string; email: string; phone?: string; subject: string; message: string; locale: Locale };
export type NewsletterSubscription = { id: string; email: string; status: 'active' | 'unsubscribed' | 'pending'; subscribedAt: string };
export type ContactMessage = ContactPayload & { id: string; status: 'new' | 'read' | 'responded' | 'archived'; receivedAt: string; updatedAt?: string | null };

export type AdminUser = { id: string; name: string; email: string; role: string; permissions: string[]; avatar?: Media | null };
export type DashboardSummary = {
  totals: { cooperatives: number; publishedNews: number; documents: number; activeHeroSlides: number; newsletterSubscribers: number; pendingContactMessages: number };
  recentNews: NewsArticleSummary[];
  recentCooperatives: CooperativeSummary[];
  recentActivity: Array<{ id: string; action: string; entityType: string; entityId: string; entityLabel: string; actorName: string; createdAt: string }>;
};
export type MediaAsset = Media & { createdAt: string; createdBy?: string | null };
export type StatisticIndicator = {
  id: string;
  key: string;
  label: string;
  translations?: Localized<{ label: string; description?: string }>;
  description?: string | null;
  value: number;
  unit?: string | null;
  period?: string | null;
  province?: ProvinceReference | null;
  activity?: Activity | null;
  provinceId?: string | null;
  activityId?: string | null;
  published: boolean;
  updatedAt?: string | null;
};

export type HeroSlideTranslationInput = {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: HeroAction | null;
  secondaryAction?: HeroAction | null;
};
export type HeroSlideInput = { kind: HeroSlide['kind']; imageId?: string | null; logoId?: string | null; translations: Localized<HeroSlideTranslationInput>; order: number; active: boolean };
export type CooperativeTranslationInput = { name: string; summary?: string; description?: string };
export type CooperativeInput = {
  slug: string;
  translations: Localized<CooperativeTranslationInput>;
  provinceId: string;
  municipalityId?: string | null;
  commune?: string | null;
  address?: string | null;
  activityIds: string[];
  type?: CooperativeType | null;
  status: CooperativeStatus;
  registrationNumber?: string | null;
  foundedYear?: number | null;
  memberCount?: number | null;
  logoId?: string | null;
  coverImageId?: string | null;
  galleryIds?: string[];
  contacts?: { email?: string | null; phone?: string | null; website?: string | null };
  location?: { latitude: number; longitude: number; address?: string | null } | null;
};
export type NewsTranslationInput = { title: string; summary?: string; content: RichTextBlock[] };
export type NewsInput = {
  slug: string;
  categoryId: string;
  translations: Localized<NewsTranslationInput>;
  imageId?: string | null;
  galleryIds?: string[];
  documentIds?: string[];
  relatedArticleIds?: string[];
  author?: string;
  status: 'draft' | 'published' | 'scheduled';
  featured: boolean;
  publishedAt?: string | null;
  scheduledAt?: string | null;
};
export type DocumentTranslationInput = { title: string; description?: string };
export type DocumentInput = { slug: string; categoryId: string; translations: Localized<DocumentTranslationInput>; language: Locale; year?: number | null; mediaId: string; status: 'draft' | 'published'; publishedAt?: string | null };
export type InstitutionalSectionInput = { key: string; translations: Localized<{ title: string; body?: string; content?: RichTextBlock[] }>; imageId?: string | null; order: number; active: boolean };
export type SocialLinkInput = { platform: SocialNetwork['platform']; url: string; active: boolean; order: number };
export type SiteSettingsInput = { logoId?: string | null; logo?: Media | null; faviconUrl?: string | null; translations: Localized<{ organizationName: string; footerText?: string; address?: string }>; phone?: string | null; email?: string | null };

export type PaginationMeta = { currentPage: number; perPage: number; total: number; lastPage: number; from: number | null; to: number | null };
export type Paginated<T> = { data: T[]; meta: PaginationMeta };
export type ApiErrorBody = { code?: string; message: string; errors?: Record<string, string[]>; requestId?: string };

export type AdminHeroSlideRecord = HeroSlideInput & { id: string; image?: Media | null; logo?: Media | null; createdAt?: string; updatedAt?: string };
export type AdminCooperativeRecord = CooperativeInput & { id: string; name: string; province: ProvinceReference; municipality?: Municipality | null; logo?: Media | null; coverImage?: Media | null; gallery?: Media[]; createdAt?: string; updatedAt?: string };
export type AdminNewsRecord = NewsInput & { id: string; category: NewsCategory; image?: Media | null; createdAt?: string; updatedAt?: string };
export type AdminNewsListItem = NewsArticleSummary & { status: 'draft' | 'published' | 'scheduled' };
export type AdminDocumentRecord = DocumentInput & { id: string; category: DocumentItem['category']; media: Media; status: 'draft' | 'published'; createdAt?: string; updatedAt?: string };
export type AdminDocumentListItem = DocumentItem & { status: 'draft' | 'published' };
export type StatisticIndicatorInput = {
  id?: string;
  key: string;
  translations: Localized<{ label: string; description?: string }>;
  value: number;
  unit?: string | null;
  period?: string | null;
  provinceId?: string | null;
  activityId?: string | null;
  published: boolean;
};
export type AdminStatisticIndicator = Omit<StatisticIndicator, 'translations'> & { translations: Localized<{ label: string; description?: string }> };
