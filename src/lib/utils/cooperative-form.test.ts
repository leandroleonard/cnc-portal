import { describe, expect, it } from 'vitest';
import type { AdminCooperativeRecord } from '@/types/domain';
import { normalizeCooperativeInitial } from '@/lib/utils/cooperative-form';

describe('normalizeCooperativeInitial', () => {
  it('survives a ficha record with null translations/contacts/location', () => {
    const record = { id: 'c1', slug: 'coop-x', name: 'Cooperativa X', translations: null, contacts: null, location: null, activityIds: null, provinceId: 'p1', status: 'pending_review' } as unknown as AdminCooperativeRecord;
    const form = normalizeCooperativeInitial(record);
    expect(form.translations.pt.name).toBe('Cooperativa X');
    expect(form.translations.en.name).toBe('');
    expect(form.contacts).toEqual({ email: '', phone: '', website: '' });
    expect(form.activityIds).toEqual([]);
    expect(form.location).toBeNull();
  });

  it('keeps existing bilingual content and normalizes unknown statuses', () => {
    const record = { id: 'c2', slug: 'coop-y', translations: { pt: { name: 'PT' }, en: { name: 'EN' } }, status: 'rejected', provinceId: 'p1', activityIds: ['a1'] } as unknown as AdminCooperativeRecord;
    const form = normalizeCooperativeInitial(record);
    expect(form.translations.pt.name).toBe('PT');
    expect(form.translations.en.name).toBe('EN');
    expect(form.status).toBe('pending_review');
    expect(form.activityIds).toEqual(['a1']);
  });
});
