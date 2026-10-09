'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { Locale, Province } from '@/types/domain';
import { staticMedia } from '@/lib/media';

const mapHotspots: Array<{ code: string; x: number; y: number }> = [
  { code: 'CAB', x: 10.5, y: 8.8 }, { code: 'ZAI', x: 20.5, y: 17.5 }, { code: 'UIG', x: 34.5, y: 23.5 },
  { code: 'BGO', x: 21.3, y: 30.5 }, { code: 'LUA', x: 17.8, y: 33.7 }, { code: 'IEB', x: 22.5, y: 38.5 },
  { code: 'CNO', x: 30.8, y: 33.3 }, { code: 'MAL', x: 48.3, y: 44.2 }, { code: 'LNO', x: 57.6, y: 32.6 },
  { code: 'CUS', x: 31.2, y: 47.3 }, { code: 'LSU', x: 69.6, y: 44.1 }, { code: 'BGU', x: 21.5, y: 63.2 },
  { code: 'HUA', x: 36.2, y: 60.4 }, { code: 'BIE', x: 45.9, y: 54.1 }, { code: 'MOX', x: 67.6, y: 63.7 },
  { code: 'MXL', x: 87.3, y: 56.5 }, { code: 'HUI', x: 31.3, y: 72.3 }, { code: 'NAM', x: 13.5, y: 82.5 },
  { code: 'CNN', x: 36.2, y: 86.3 }, { code: 'CUB', x: 54.1, y: 86.3 }, { code: 'CUA', x: 75.2, y: 86.6 },
];

export function AngolaProvinceMap({ provinces, selectedCode, showList = true }: { provinces: Province[]; selectedCode?: string; showList?: boolean }) {
  const t = useTranslations('home');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const provinceByCode = new Map(provinces.map((province) => [province.code.toUpperCase(), province]));

  function selectProvince(province: Province) {
    const query = locale === 'pt'
      ? { provincia: province.slug, view: 'map' }
      : { province: province.slug, view: 'map' };
    router.push({ pathname: '/cooperativas', query });
  }

  return (
    <div className={`angola-map-panel ${showList ? '' : 'angola-map-panel--wide'}`}>
      <div className="angola-map-visual">
        <div className="angola-map-image">
          <Image src={staticMedia.angolaProvinces} alt={locale === 'pt' ? 'Mapa administrativo de Angola com 21 províncias' : 'Administrative map of Angola with 21 provinces'} fill sizes="(max-width: 768px) 100vw, 50vw" />
          {mapHotspots.map((spot) => {
            const province = provinceByCode.get(spot.code);
            if (!province) return null;
            const active = selectedCode?.toUpperCase() === spot.code;
            return <button key={spot.code} className={`map-hotspot ${active ? 'active' : ''}`} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} aria-label={`${locale === 'pt' ? 'Ver cooperativas em' : 'View cooperatives in'} ${province.name}`} aria-pressed={active} title={province.name} onClick={() => selectProvince(province)}><span className="sr-only">{province.name}</span></button>;
          })}
        </div>
        <p className="map-caption"><MapPin size={16} aria-hidden="true" />{t('mapAttribution')}</p>
      </div>
      {showList && <aside className="province-panel province-panel--light">
        <div className="province-panel__top"><div><p className="eyebrow">{t('territoryEyebrow')}</p><h3>{selectedCode ? provinceByCode.get(selectedCode.toUpperCase())?.name : t('provinces')}</h3></div><span>{provinces.length}</span></div>
        <div className="province-list province-list--light">
          {provinces.map((province) => <button key={province.id} className={province.code.toUpperCase() === selectedCode?.toUpperCase() ? 'selected' : ''} onClick={() => selectProvince(province)}>{province.name}{province.cooperativeCount !== null && province.cooperativeCount !== undefined && <span>{province.cooperativeCount}</span>}</button>)}
        </div>
        {provinces.length === 0 && <p>{locale === 'pt' ? 'As opções de província serão fornecidas pela API.' : 'Province options will be provided by the API.'}</p>}
      </aside>}
    </div>
  );
}
