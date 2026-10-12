import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import { Container, PageHero } from '@/components/ui/primitives';
import { getPublicSettings } from '@/lib/api/public';
import { apiErrorDescription, loadApi } from '@/lib/api/loader';
import { localizedUrl } from '@/lib/utils/site';
import type { Locale } from '@/types/domain';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.contacts' });
  const canonical = localizedUrl(locale, 'contact');
  return { title: t('title'), description: t('description'), alternates: { canonical, languages: { pt: localizedUrl('pt', 'contact'), en: localizedUrl('en', 'contact') } }, openGraph: { title: t('title'), description: t('description'), url: canonical, type: 'website' } };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'pt') as Locale;
  const settingsResult = await loadApi(() => getPublicSettings(locale));
  const t = await getTranslations({ locale, namespace: 'pages.contacts' });
  const settings = settingsResult.data;
  return <>
    <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('description')} />
    <section className="section contact-page"><Container><div className="contact-layout"><ContactForm /><aside className="contact-info"><p className="eyebrow eyebrow--gold">{t('contactInfo')}</p><h2>{settings?.organizationName ?? (locale === 'pt' ? 'Conselho Nacional de Cooperativas' : 'National Council of Cooperatives')}</h2><p>{t('contactInfoBody')}</p>{settings?.phone && <div className="contact-line"><Phone size={20} aria-hidden="true" /><div><span>{locale === 'pt' ? 'Telefone' : 'Phone'}</span><a href={`tel:${settings.phone}`}>{settings.phone}</a></div></div>}{settings?.email && <div className="contact-line"><Mail size={20} aria-hidden="true" /><div><span>Email</span><a href={`mailto:${settings.email}`}>{settings.email}</a></div></div>}{settings?.address && <div className="contact-line"><MapPin size={20} aria-hidden="true" /><div><span>{locale === 'pt' ? 'Endereço' : 'Address'}</span><strong>{settings.address}</strong></div></div>}{settingsResult.error && <p className="contact-settings-note">{apiErrorDescription(settingsResult.error, locale === 'pt' ? 'Contactos institucionais serão carregados pelo sistema.' : 'Institutional contact details will be loaded from the systyem.', locale === 'pt' ? 'Os contactos oficiais serão apresentados quando o serviço estiver disponível.' : 'Official contact details will appear when the service is available.')}</p>}</aside></div></Container></section>
  </>;
}
