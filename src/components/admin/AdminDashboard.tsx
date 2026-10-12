import Link from 'next/link';
import { Activity, ArrowRight, Building2, FileText, Mail, Newspaper, PanelsTopLeft, Users } from 'lucide-react';
import type { DashboardSummary } from '@/types/domain';
import { AdminPageHeader, AdminPanel } from './AdminUI';

export function AdminDashboard({ data }: { data: DashboardSummary }) {
  const cards = [
    { label: 'Cooperativas', value: data.totals.cooperatives, href: '/admin/cooperativas', Icon: Building2 },
    { label: 'Notícias publicadas', value: data.totals.publishedNews, href: '/admin/noticias', Icon: Newspaper },
    { label: 'Documentos', value: data.totals.documents, href: '/admin/documentos', Icon: FileText },
    { label: 'Slides activos', value: data.totals.activeHeroSlides, href: '/admin/hero', Icon: PanelsTopLeft },
    { label: 'Subscritores', value: data.totals.newsletterSubscribers, href: '/admin/newsletter', Icon: Users },
    { label: 'Contactos pendentes', value: data.totals.pendingContactMessages, href: '/admin/contactos', Icon: Mail },
  ];
  return <>
    <AdminPageHeader title="Dashboard" description="Visão geral dos conteúdos publicados e pendentes no portal CNC." />
    <div className="admin-metric-grid">{cards.map(({ label, value, href, Icon }) => <Link href={href} className="admin-metric-card" key={label}><span className="admin-metric-icon"><Icon size={19} /></span><span className="admin-metric-label">{label}</span><strong>{new Intl.NumberFormat('pt-AO').format(value)}</strong><span className="admin-metric-link">Abrir secção <ArrowRight size={14} /></span></Link>)}</div>
    <div className="admin-dashboard-grid">
      <AdminPanel title="Últimas notícias" action={<Link href="/admin/noticias">Ver todas <ArrowRight size={14} /></Link>}>
        {data.recentNews.length ? <div className="admin-recent-list">{data.recentNews.map((item) => <Link href={`/admin/noticias/${item.id}`} key={item.id}><span className="admin-recent-icon"><Newspaper size={17} /></span><span><strong>{item.title}</strong><small>{item.category.name} · {new Intl.DateTimeFormat('pt-AO', { dateStyle: 'medium' }).format(new Date(item.publishedAt))}</small></span><ArrowRight size={15} /></Link>)}</div> : <div className="admin-inline-state">Sem notícias recentes fornecidas pela sistema.</div>}
      </AdminPanel>
      <AdminPanel title="Cooperativas adicionadas recentemente" action={<Link href="/admin/cooperativas">Ver todas <ArrowRight size={14} /></Link>}>
        {data.recentCooperatives.length ? <div className="admin-recent-list">{data.recentCooperatives.map((item) => <Link href={`/admin/cooperativas/${item.id}`} key={item.id}><span className="admin-recent-icon"><Building2 size={17} /></span><span><strong>{item.name}</strong><small>{item.municipality?.name ? `${item.municipality.name}, ` : ''}{item.province.name}</small></span><ArrowRight size={15} /></Link>)}</div> : <div className="admin-inline-state">Sem cooperativas recentes fornecidas pelo sistema.</div>}
      </AdminPanel>
      {/* <AdminPanel title="Actividade recente"><div className="admin-activity-list">{data.recentActivity.length ? data.recentActivity.map((item) => <div key={item.id}><span className="admin-activity-dot"><Activity size={13} /></span><p><strong>{item.actorName}</strong> {item.action} <Link href={`/admin/${item.entityType}/${item.entityId}`}>{item.entityLabel}</Link><small>{new Intl.DateTimeFormat('pt-AO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</small></p></div>) : <div className="admin-inline-state">Sem actividade recente fornecida pelo sistema.</div>}</div></AdminPanel> */}
    </div>
  </>;
}
