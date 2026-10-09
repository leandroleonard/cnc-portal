import { describe, expect, it } from 'vitest';
import { contactSchema, newsletterSchema } from './forms';

describe('public form validation', () => {
  it('accepts and normalizes a valid newsletter email', () => {
    expect(newsletterSchema.safeParse({ email: '  cnc@example.ao  ' }).success).toBe(true);
  });

  it('rejects invalid email before any API request is made', () => {
    expect(newsletterSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });

  it('requires complete contact details and a useful message', () => {
    expect(contactSchema.safeParse({ name: 'Ana Silva', email: 'ana@example.ao', subject: 'Informação', message: 'Gostaria de obter informações sobre o portal.' }).success).toBe(true);
    expect(contactSchema.safeParse({ name: 'A', email: 'invalid', subject: '', message: 'Olá' }).success).toBe(false);
  });
});
