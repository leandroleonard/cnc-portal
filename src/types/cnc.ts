/** Tipos do módulo de cadastro (Ficha Nacional CNC) e moderação. Espelham a API Laravel. */

export type Role = 'admin' | 'cadastrador';
export type CooperativeStatus = 'active' | 'pending_review' | 'rejected' | 'inactive';

export type Province = {
  id: string;
  code: string;
  slug: string;
  name: string;
  municipalityCount?: number | null;
  cooperativeCount?: number | null;
  municipalities?: Municipality[];
};
export type Municipality = { id: string; provinceId: string; slug: string; name: string };

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
  avatar?: string | null;
  provinceId: string | null;
  province: Pick<Province, 'id' | 'code' | 'slug' | 'name'> | null;
  validUntil: string | null;
  isActive: boolean;
  isExpired: boolean;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string | null;
};

export type UserInput = {
  name: string;
  email: string;
  password?: string;
  role: Role;
  province_id?: string | null;
  valid_until?: string | null;
  is_active?: boolean;
};

export type EditingWindow = { endsAt: string | null; isOpen: boolean; secondsRemaining: number; serverTime: string };

/** Chaves snake_case idênticas às colunas de cooperative_survey_data. */
export type CooperativeSurveyData = {
  collection_date: string | null;
  sectors: string[];
  main_sector: string | null;
  subsector_specialty: string | null;
  operator_full_name: string | null;
  operator_known_name: string | null;
  operator_gender: 'M' | 'F' | 'nao_declarar' | null;
  operator_birth_date: string | null;
  operator_age: number | null;
  bi_status: 'sim' | 'nao' | 'em_processo' | null;
  bi_number: string | null;
  phone: string | null;
  marital_status: 'solteiro' | 'casado' | 'uniao_facto' | 'divorciado' | 'viuvo' | null;
  residence_province_id: string | null;
  residence_municipality_id: string | null;
  residence_commune: string | null;
  residence_neighborhood: string | null;
  household_members_count: number | null;
  dependents_count: number | null;
  is_main_provider: 'sim' | 'nao' | 'partilhado' | null;
  activity_experience_years: '<1' | '1-3' | '4-6' | '7-10' | '>10' | null;
  activity_frequency: 'diaria' | '5-6_dias' | '3-4_dias' | '1-2_dias' | 'esporadica' | null;
  daily_hours: number | null;
  location_types: string[];
  main_activity_point: string | null;
  latitude: number | null;
  longitude: number | null;
  products_services_description: string | null;
  main_product_service: string | null;
  recycling_materials: string[];
  production_quantity: string | null;
  production_period: 'dia' | 'semana' | 'mes' | null;
  measurement_unit: string | null;
  sales_channels: string[];
  transport_means: string[];
  monthly_income_range: '<25000' | '25000-50000' | '50000-100000' | '100000-200000' | '>200000' | 'nao_declara' | null;
  is_primary_income_source: boolean | null;
  organization_type: 'individual' | 'grupo' | 'associacao' | 'cooperativa' | 'empresa' | null;
  organization_name: string | null;
  members_count: number | null;
  safety_equipment: string[];
  work_risks: string[];
  priority_needs: string[];
  other_specifications: Record<string, string> | null;
  data_treatment_consent: boolean;
  operator_signature_type: 'nome_escrito' | 'impressao_digital' | 'assinatura_digital' | null;
  supervisor_name: string | null;
  validation_status: 'pendente' | 'validado' | 'actualizado';
  record_flags: string[] | null;
  qr_code_identifier: string | null;
  authorized_photo_media_id: string | null;
};

/** Imagem da galeria da ficha (devolvida por /api/registrations). */
export type RegistrationMedia = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

export type Cooperative = {
  id: string;
  slug: string;
  name: string;
  registrationCode: string | null;
  status: CooperativeStatus;
  isDraft: boolean;
  province: Pick<Province, 'id' | 'code' | 'slug' | 'name'> | null;
  provinceId: string;
  municipality: Municipality | null;
  municipalityId: string | null;
  commune: string | null;
  neighborhood: string | null;
  createdBy: { id: string; name: string; email: string } | null;
  reviewedBy: { id: string; name: string } | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  correctionRequest: string | null;
  editingReopenedAt: string | null;
  editingWindow: EditingWindow;
  createdAt: string | null;
  updatedAt: string | null;
  survey?: CooperativeSurveyData | null;
  // Campos públicos preenchidos pela Ficha Nacional (Fase 9)
  translations?: { pt?: Record<string, string | null>; en?: Record<string, string | null> } | null;
  description?: string | null;
  foundedYear?: number | null;
  memberCount?: number | null;
  address?: string | null;
  contacts?: { email?: string | null; phone?: string | null; website?: string | null } | null;
  gallery?: RegistrationMedia[];
  galleryMediaIds?: string[];
  // Campos extra da listagem de moderação
  operatorName?: string | null;
  mainSector?: string | null;
  hasLocation?: boolean;
};

export type RegistrationPayload = {
  submit?: boolean;
  name?: string | null;
  registration_code?: string | null;
  province_id?: string;
  municipality_id?: string | null;
  commune?: string | null;
  neighborhood?: string | null;
  // Campos públicos (Fase 9): Introdução, Endereço, Contactos, Galeria.
  description?: string | null;
  founded_year?: number | null;
  member_count?: number | null;
  address?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_website?: string | null;
  gallery_media_ids?: string[];
  survey?: Partial<CooperativeSurveyData>;
};

export type ReviewPayload = { status: 'active' | 'rejected' | 'inactive'; rejection_reason?: string };

export type PaginationMeta = {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number | null;
  to: number | null;
  pendingTotal?: number;
};
export type Paginated<T> = { data: T[]; meta: PaginationMeta };
export type Envelope<T> = { data: T };

export type ApiErrorCode =
  | 'profile_expired' | 'account_inactive' | 'editing_window_expired' | 'editing_locked'
  | 'province_scope_violation' | 'province_not_assigned' | 'validation_failed' | 'invalid_credentials'
  | 'unauthenticated' | 'forbidden' | 'not_found' | 'conflict' | 'invalid_transition' | 'rate_limited'
  | 'network_error' | 'internal_error' | (string & {});

export type ApiError = {
  status: number;
  code: ApiErrorCode;
  message: string;
  errors?: Record<string, string[]>;
  requestId?: string;
  editingWindowEndsAt?: string | null;
  validUntil?: string | null;
};