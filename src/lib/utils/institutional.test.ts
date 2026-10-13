import { describe, expect, it } from 'vitest';
import type { InstitutionalSection } from '@/types/domain';
import { filterManagedInstitutionalSections, institutionSectionExists, INSTITUTIONAL_STATIC_SECTION_KEYS } from '@/lib/utils/institutional';

const sections: InstitutionalSection[] = [
  { id: 'a', key: INSTITUTIONAL_STATIC_SECTION_KEYS.about[0], title: 'Quem somos', order: 1, active: true },
  { id: 'b', key: 'programas', title: 'Programas', order: 2, active: true },
  { id: 'c', key: INSTITUTIONAL_STATIC_SECTION_KEYS.leader[0], title: 'Mensagem institucional', order: 3, active: true },
  { id: 'd', key: 'documentos', title: 'Documentos', order: 4, active: false },
  { id: 'e', key: INSTITUTIONAL_STATIC_SECTION_KEYS.structure[0], title: 'Estrutura', order: 5, active: true },
];

describe('institutional page section filtering', () => {
  it('keeps only dynamic sections and excludes the managed code sections', () => {
    expect(filterManagedInstitutionalSections(sections).map((section) => section.key)).toEqual(['programas']);
  });

  it('detects whether a managed section is enabled in the API payload', () => {
    expect(institutionSectionExists(sections, INSTITUTIONAL_STATIC_SECTION_KEYS.about)).toBe(true);
    expect(institutionSectionExists(sections, 'programas')).toBe(true);
    expect(institutionSectionExists(sections, 'inexistente')).toBe(false);
  });
});
