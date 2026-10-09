'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/types/domain';
import { submitContact } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import { contactSchema } from '@/lib/validation/forms';
import { Button } from '@/components/ui/primitives';

export function ContactForm() {
  const t = useTranslations('pages.contacts');
  const locale = useLocale() as Locale;
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSent(false);
    setError('');
    setFieldErrors({});
    const form = new FormData(formElement);
    const input = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      subject: String(form.get('subject') ?? ''),
      message: String(form.get('message') ?? ''),
    };
    const parsed = contactSchema.safeParse(input);
    if (!parsed.success) {
      const issues: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? 'form');
        issues[field] = t('required');
      }
      setFieldErrors(issues);
      return;
    }
    setLoading(true);
    try {
      await submitContact({ ...parsed.data, locale });
      setSent(true);
      formElement.reset();
    } catch (cause) {
      if (cause instanceof ApiError && cause.fieldErrors) {
        setFieldErrors(Object.fromEntries(Object.keys(cause.fieldErrors).map((key) => [key, cause.fieldErrors?.[key]?.[0] ?? t('required')])));
      } else setError(t('error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="contact-form" noValidate>
      {sent && <div className="success-message" role="status"><CheckCircle2 size={21} /><div><strong>{t('successTitle')}</strong><span>{t('success')}</span></div></div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-row">
        <label><span>{t('name')}</span><input className="input" name="name" autoComplete="name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined} />{fieldErrors.name && <small className="field-error" id="contact-name-error">{fieldErrors.name}</small>}</label>
        <label><span>{t('email')}</span><input className="input" name="email" type="email" autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined} />{fieldErrors.email && <small className="field-error" id="contact-email-error">{fieldErrors.email}</small>}</label>
      </div>
      <div className="form-row">
        <label><span>{t('phone')}</span><input className="input" name="phone" type="tel" autoComplete="tel" /></label>
        <label><span>{t('subject')}</span><input className="input" name="subject" aria-invalid={Boolean(fieldErrors.subject)} />{fieldErrors.subject && <small className="field-error">{fieldErrors.subject}</small>}</label>
      </div>
      <label><span>{t('message')}</span><textarea name="message" rows={7} aria-invalid={Boolean(fieldErrors.message)} />{fieldErrors.message && <small className="field-error">{fieldErrors.message}</small>}</label>
      <Button type="submit" disabled={loading}>{loading ? t('sending') : <>{t('send')} <ArrowRight size={17} /></>}</Button>
    </form>
  );
}
