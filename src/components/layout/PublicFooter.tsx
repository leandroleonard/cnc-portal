import Image from 'next/image';
import { Globe2, MessageCircle, ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale, SiteSettings } from '@/types/domain';
import { staticMedia } from '@/lib/media';
import { Container } from '@/components/ui/primitives';

const socialIcons = {
  facebook: Globe2,
  instagram: Globe2,
  youtube: Globe2,
  linkedin: Globe2,
  x: Globe2,
  whatsapp: MessageCircle,
};

export async function PublicFooter({ locale, settings }: { locale: Locale; settings: SiteSettings | null }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const nav = await getTranslations({ locale, namespace: 'nav' });
  const year = new Date().getFullYear();
  const visibleSocials = settings?.socialLinks.filter((item) => item.active && item.url) ?? [];
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div className="footer-about">
            <Link href="/" className="brand brand--inverse" aria-label={`CNC — ${settings?.organizationName ?? 'Conselho Nacional de Cooperativas'}`}>
              <span className="brand__mark"><Image src={settings?.logo?.url ?? staticMedia.cncLogo} alt="" width={56} height={56} sizes="56px" /></span>
              <span className="brand__words"><strong>CNC</strong><small>{settings?.organizationName ?? 'Conselho Nacional de Cooperativas'}</small></span>
            </Link>
            <p>{settings?.footerText || t('about')}</p>
            {visibleSocials.length > 0 && (
              <div className="socials" aria-label={t('social')}>
                {visibleSocials.map((item) => {
                  const Icon = socialIcons[item.platform];
                  return <a key={item.id} href={item.url} aria-label={item.platform} target="_blank" rel="noreferrer"><Icon size={18} aria-hidden="true" /></a>;
                })}
              </div>
            )}
          </div>
          <div>
            <h3>{t('navigation')}</h3>
            <Link href="/">{nav('home')}</Link>
            <Link href="/cooperativas">{nav('cooperatives')}</Link>
            <Link href="/actualidade">{nav('news')}</Link>
            <Link href="/institucional">{nav('institutional')}</Link>
            <Link href="/documentos">{nav('documents')}</Link>
            <Link href="/contactos">{nav('contacts')}</Link>
          </div>
          <div>
            <h3>{t('usefulLinks')}</h3>
            <Link href="/documentos">{nav('documents')}</Link>
            <Link href="/estatisticas">{nav('statistics')}</Link>
            <Link href={{ pathname: '/cooperativas', query: { view: 'mapa' } }}>{locale === 'pt' ? 'Mapa de cooperativas' : 'Cooperative map'}</Link>
          </div>
          <div>
            <h3>{t('contacts')}</h3>
            {settings?.phone && <p className="footer-contact-line"><Phone size={14} /> <a href={`tel:${settings.phone}`}>{settings.phone}</a></p>}
            {settings?.email && <p className="footer-contact-line"><Mail size={14} /> <a href={`mailto:${settings.email}`}>{settings.email}</a></p>}
            {settings?.address && <p className="footer-contact-line"><MapPin size={14} /> <span>{settings.address}</span></p>}
            <Link className="footer-contact" href="/contactos">{t('contactCnc')} <ArrowRight size={15} /></Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t('copyright', { year })}</span>
          <div>
            <Link href="/contactos">{t('privacy')}</Link>
            <Link href="/contactos">{t('terms')}</Link>
            <Link href="/" locale={locale === 'pt' ? 'en' : 'pt'}>{locale.toUpperCase()} / {locale === 'pt' ? 'EN' : 'PT'}</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
