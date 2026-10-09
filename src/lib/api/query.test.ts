import { describe, expect, it } from 'vitest';
import {
  clampPage,
  cooperativeQueryString,
  toPublicCooperativeQuery,
  toQueryString,
  newsQueryString,
  documentQueryString,
  searchQueryString,
} from './query';

describe('API query helpers', () => {
  it('omits empty values and safely encodes parameters', () => {
    expect(toQueryString({ search: 'Huambo & Bié', page: 2, empty: '' })).toBe('?search=Huambo+%26+Bi%C3%A9&page=2');
  });

  it('maps Portuguese URL filters to the stable API contract', () => {
    const query = toPublicCooperativeQuery(
      { provincia: 'huambo', actividade: 'agricultura', page: '2', view: 'map' },
      'pt',
    );
    expect(query).toMatchObject({ province: 'huambo', activity: 'agricultura', page: 2, locale: 'pt' });
    expect(cooperativeQueryString(query)).toContain('province=huambo');
    expect(cooperativeQueryString(query)).toContain('activity=agricultura');
    expect(cooperativeQueryString(query)).not.toContain('view=');
  });

  it('accepts English URL filter names and rejects invalid pages', () => {
    expect(toPublicCooperativeQuery({ province: 'bie', activity: 'fishing', page: 'nope' }, 'en'))
      .toMatchObject({ province: 'bie', activity: 'fishing', page: 1, locale: 'en' });
    expect(clampPage('-3')).toBe(1);
  });

  it('serializes supported news, document and global search filters', () => {
    expect(newsQueryString({ locale: 'en', category: 'events', page: 3, perPage: 9 })).toContain('category=events');
    expect(documentQueryString({ locale: 'pt', year: 2026, fileType: 'pdf' })).toContain('fileType=pdf');
    expect(searchQueryString({ locale: 'en', q: 'coop', types: ['cooperative', 'news'] })).toContain('types=cooperative%2Cnews');
  });
});
