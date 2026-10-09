'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, Send } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/types/domain';
import { subscribeNewsletter } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import { newsletterSchema } from '@/lib/validation/forms';

export function NewsletterSignup({ variant = 'default' }: { variant?: 'default' | 'footer' }) {
  const t = useTranslations('newsletter');
  const locale = useLocale() as Locale;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'invalid' | 'error'>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) { setStatus('invalid'); return; }
    setStatus('loading');
    try {
      const response = await subscribeNewsletter(parsed.data.email, locale);
      setStatus(response.status === 'already_subscribed' ? 'already' : 'success');
      if (response.status === 'subscribed') setEmail('');
    } catch (error) {
      setStatus(error instanceof ApiError && error.code === 'already_subscribed' ? 'already' : 'error');
    }
  }

  const messages = {
    success: <p className="newsletter-feedback newsletter-feedback--success" role="status"><CheckCircle2 size={18} /> {t('success')}</p>,
    already: <p className="newsletter-feedback" role="status">{t('already')}</p>,
    invalid: <p className="newsletter-feedback newsletter-feedback--error" role="alert">{t('invalid')}</p>,
    error: <p className="newsletter-feedback newsletter-feedback--error" role="alert">{t('error')}</p>,
  };

  return (
    <section className={`newsletter newsletter--${variant}`} aria-labelledby={`newsletter-title-${variant}`}>
      <div className="newsletter__copy"><p className="eyebrow eyebrow--gold">{t('eyebrow')}</p><h2 id={`newsletter-title-${variant}`}>{t('title')}</h2><p>{t('description')}</p></div>
      <div className="newsletter__form-wrap">
        <form className="newsletter-form" onSubmit={submit} noValidate>
          <label className="sr-only" htmlFor={`newsletter-email-${variant}`}>{t('email')}</label>
          <Mail size={18} aria-hidden="true" />
          <input id={`newsletter-email-${variant}`} type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => { setEmail(event.target.value); if (status !== 'loading') setStatus('idle'); }} placeholder={t('email')} aria-invalid={status === 'invalid'} disabled={status === 'loading'} />
          <button type="submit" disabled={status === 'loading'}>{status === 'loading' ? t('loading') : <>{t('submit')} <Send size={16} aria-hidden="true" /></>}</button>
        </form>
        {status !== 'idle' && status !== 'loading' && messages[status]}
      </div>
    </section>
  );
}
