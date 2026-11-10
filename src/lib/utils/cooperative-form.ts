import type { AdminCooperativeRecord, CooperativeInput } from '@/types/domain';

export function blankCooperativeInput(): CooperativeInput {
  return { slug: '', translations: { pt: { name: '', summary: '', description: '' }, en: { name: '', summary: '', description: '' } }, provinceId: '', municipalityId: null, commune: '', neighborhood: '', address: '', activityIds: [], type: 'production', status: 'active', registrationNumber: '', foundedYear: null, memberCount: null, logoId: null, coverImageId: null, galleryIds: [], contacts: { email: '', phone: '', website: '' }, location: null };
}

/** Normalização defensiva: registos da Ficha Nacional podem chegar com translations/contacts/location null. */
export function normalizeCooperativeInitial(initial: AdminCooperativeRecord | null): CooperativeInput {
  if (!initial) return blankCooperativeInput();
  const pt = initial.translations?.pt ?? { name: '', summary: '', description: '' };
  const en = initial.translations?.en ?? { name: '', summary: '', description: '' };
  const status = (['active', 'pending_review', 'inactive'] as const).includes(initial.status as 'active') ? initial.status : 'pending_review';
  return {
    slug: initial.slug ?? '',
    translations: { pt: { name: pt.name || initial.name || '', summary: pt.summary ?? '', description: pt.description ?? '' }, en: { name: en.name ?? '', summary: en.summary ?? '', description: en.description ?? '' } },
    provinceId: initial.provinceId ?? '', municipalityId: initial.municipalityId ?? null,
    commune: initial.commune ?? '', neighborhood: initial.neighborhood ?? '', address: initial.address ?? '',
    activityIds: initial.activityIds ?? [], type: initial.type ?? 'production', status,
    registrationNumber: initial.registrationNumber ?? '', foundedYear: initial.foundedYear ?? null, memberCount: initial.memberCount ?? null,
    logoId: initial.logo?.id ?? initial.logoId ?? null, coverImageId: initial.coverImage?.id ?? initial.coverImageId ?? null,
    galleryIds: initial.gallery?.map((item) => item.id) ?? initial.galleryIds ?? [],
    contacts: { email: initial.contacts?.email ?? '', phone: initial.contacts?.phone ?? '', website: initial.contacts?.website ?? '' },
    location: initial.location ?? null,
  };
}

