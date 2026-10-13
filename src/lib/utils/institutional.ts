import type { InstitutionalSection } from '@/types/domain';

export const INSTITUTIONAL_STATIC_SECTION_KEYS = {
  about: ['quem-somos', 'about', 'who-we-are'],
  leader: ['mensagem-institucional', 'leader-message', 'message', 'mensagem'],
  structure: ['estrutura-institucional', 'institutional-structure', 'structure'],
} as const;

export function institutionSectionExists(sections: InstitutionalSection[] | null | undefined, key: string | readonly string[]): boolean {
  const candidateKeys = Array.isArray(key) ? key : [key];
  return (sections ?? []).some((section) => section.active && candidateKeys.includes(section.key));
}

export function filterManagedInstitutionalSections(sections: InstitutionalSection[] | null | undefined): InstitutionalSection[] {
  const excluded = new Set<string>(Object.values(INSTITUTIONAL_STATIC_SECTION_KEYS).flat());

  return (sections ?? [])
    .filter((section) => section.active)
    .filter((section) => !excluded.has(section.key))
    .sort((a, b) => a.order - b.order);
}
