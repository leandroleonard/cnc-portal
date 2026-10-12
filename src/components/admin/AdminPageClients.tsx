'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Pencil } from 'lucide-react';
import type { AdminListQuery } from '@/types/api';
import type {
  AdminCooperativeRecord,
  AdminDocumentCategory,
  AdminDocumentListItem,
  AdminDocumentRecord,
  AdminHeroSlideRecord,
  AdminNewsListItem,
  AdminNewsRecord,
  AdminStatisticIndicator,
  ContactMessage,
  CooperativeSummary,
  DashboardSummary,
  MediaAsset,
  NewsletterSubscription,
  PaginationMeta,
  SocialNetwork,
} from '@/types/domain';
import {
  getAdminDashboard,
  getAdminCooperative,
  getAdminDocument,
  getAdminDocumentCategories,
  getAdminInstitutional,
  getAdminNews,
  getAdminNewsCategories,
  getAdminSettings,
  getHeroSlide,
  listActivities,
  listAdminCooperatives,
  listAdminDocuments,
  listAdminNews,
  listHeroSlides,
  listContactMessages,
  listProvinces,
  listStatisticIndicators,
  listSubscribers,
  listSocialLinks,
} from '@/lib/api/admin';
import { clampPage, firstParam } from '@/lib/api/query';
import { formatDate, formatFileSize } from '@/lib/utils/format';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { HeroSlidesTable } from '@/components/admin/HeroSlidesTable';
import { AdminApiState, AdminBackLink, AdminCreateLink, AdminEmptyState, AdminPageHeader, AdminPanel, AdminPagination, AdminSearch, AdminTable } from '@/components/admin/AdminUI';
import { CooperativeEditor, DocumentEditor, HeroSlideEditor, InstitutionalEditor, NewsEditor } from '@/components/admin/ContentForms';
import { ContactMessages } from '@/components/admin/ContactMessages';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { SettingsEditor, SocialLinksManager } from '@/components/admin/AdminExtraForms';
import { StatisticsManager } from '@/components/admin/StatisticsManager';
import { SubscriberStatus } from '@/components/admin/SubscriberStatus';
import { AdminDeleteButton } from '@/components/admin/AdminDeleteButton';
import { useAdminResource } from '@/components/admin/useAdminResource';

const emptyMeta: PaginationMeta = { currentPage: 1, perPage: 20, total: 0, lastPage: 1, from: null, to: null };

function InlineLoading({ label = 'A carregar dados…' }: { label?: string }) {
  return <div className="admin-inline-state" role="status">{label}</div>;
}

function useListQuery(perPage: number, sort: string): { search?: string; status?: string; page: number; perPage: number; sort: string; direction: 'desc' } {
  const params = useSearchParams();
  return {
    search: firstParam(params.get('search') ?? undefined),
    status: firstParam(params.get('status') ?? undefined),
    page: clampPage(params.get('page') ?? undefined),
    perPage,
    sort,
    direction: 'desc',
  };
}

function queryKey(query: AdminListQuery): string {
  return JSON.stringify(query);
}

export function AdminDashboardPageClient() {
  const load = useCallback(() => getAdminDashboard(), []);
  const { loading, data, error } = useAdminResource<DashboardSummary>('dashboard', load);
  if (loading) return <InlineLoading label="A carregar o dashboard…" />;
  if (error) return <><div className="admin-page-header"><div><p className="admin-eyebrow">CNC · GESTÃO DE CONTEÚDOS</p><h1>Dashboard</h1><p>Resumo.</p></div></div><AdminApiState error={error} /></>;
  return data ? <AdminDashboard data={data} /> : <AdminApiState error={new Error('O sistema não devolveu dados para o dashboard.')} />;
}

export function AdminCooperativesPageClient() {
  const query = useListQuery(20, 'updatedAt');
  const key = queryKey(query);
  const load = useCallback(() => listAdminCooperatives({ search: query.search, status: query.status, page: query.page, perPage: query.perPage, sort: query.sort, direction: query.direction }), [query.search, query.status, query.page, query.perPage, query.sort, query.direction]);
  const { loading, data, error } = useAdminResource(key, load);
  return <>
    <AdminPageHeader title="Cooperativas" description="Cadastro central das cooperativas nacionais. O CNC gere e valida todos os perfis." action={<AdminCreateLink href="/admin/cooperativas/novo">Adicionar cooperativa</AdminCreateLink>} />
    {loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : <AdminPanel title="Directório de cooperativas" description="Pesquisa e gestão.">
      <div className="admin-list-toolbar"><AdminSearch initialValue={query.search} placeholder="Pesquisar nome, província ou registo…" /><form method="get"><input type="hidden" name="search" value={query.search ?? ''} /><label className="sr-only" htmlFor="cooperative-status">Estado</label><select className="admin-filter-select" id="cooperative-status" name="status" defaultValue={query.status ?? ''} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="">Todos os estados</option><option value="active">Activa</option><option value="pending_review">Em validação</option><option value="inactive">Inactiva</option></select></form></div>
      {data ? <><AdminTable<CooperativeSummary> rows={data.data} getKey={(row) => row.id} emptyTitle="Sem cooperativas cadastradas" emptyDescription="Os registos de cooperativas serão listados aqui após criação através do CMS." columns={[
        { key: 'name', label: 'Cooperativa', render: (row) => <><strong>{row.name}</strong><small className="admin-table-subline">{row.slug}</small></> },
        { key: 'place', label: 'Localização', render: (row) => `${row.municipality?.name ? `${row.municipality.name}, ` : ''}${row.province.name}` },
        { key: 'activity', label: 'Actividade', render: (row) => row.activityNames.join(', ') || '—' },
        { key: 'status', label: 'Estado', render: (row) => <span className={`admin-tag ${row.status === 'active' ? 'admin-tag--green' : 'admin-tag--gold'}`}>{row.status === 'active' ? 'Activa' : row.status === 'inactive' ? 'Inactiva' : 'Em validação'}</span> },
        { key: 'actions', label: 'Acções', align: 'end', render: (row) => <div className="admin-table-actions"><Link href={`/admin/cooperativas/${row.id}`} aria-label={`Editar ${row.name}`}><Pencil size={15} /></Link><AdminDeleteButton resource="cooperatives" id={row.id} label={row.name} /></div> },
      ]} /><AdminPagination meta={data.meta} basePath="/admin/cooperativas" query={{ search: query.search, status: query.status }} /></> : <AdminEmptyState title="Sem cooperativas cadastradas" description="Os registos de cooperativas serão listados aqui após criação através do CMS." />}
    </AdminPanel>}
  </>;
}

export function AdminNewsPageClient() {
  const query = useListQuery(20, 'updatedAt');
  const key = queryKey(query);
  const load = useCallback(() => listAdminNews({ search: query.search, status: query.status, page: query.page, perPage: query.perPage, sort: query.sort, direction: query.direction }), [query.search, query.status, query.page, query.perPage, query.sort, query.direction]);
  const { loading, data, error } = useAdminResource(key, load);
  return <>
    <AdminPageHeader title="Actualidade" description="Gere notícias, actividades, eventos e comunicados, com traduções separadas em PT e EN." action={<AdminCreateLink href="/admin/noticias/novo">Nova publicação</AdminCreateLink>} />
    {loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : <AdminPanel title="Publicações" description="Rascunhos, agendamentos e conteúdos publicados.">
      <div className="admin-list-toolbar"><AdminSearch initialValue={query.search} placeholder="Pesquisar título ou slug…" /><form method="get"><input type="hidden" name="search" value={query.search ?? ''} /><label className="sr-only" htmlFor="news-status">Estado da publicação</label><select className="admin-filter-select" id="news-status" name="status" defaultValue={query.status ?? ''} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="">Todos os estados</option><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="scheduled">Agendado</option></select></form></div>
      {data ? <><AdminTable<AdminNewsListItem> rows={data.data} getKey={(row) => row.id} emptyTitle="Sem publicações" emptyDescription="Crie uma publicação para a disponibilizar no website público." columns={[
        { key: 'title', label: 'Publicação', render: (row) => <><strong>{row.title}</strong><small className="admin-table-subline">{row.category.name} · {row.slug}</small></> },
        { key: 'date', label: 'Data', render: (row) => row.publishedAt ? new Intl.DateTimeFormat('pt-AO', { dateStyle: 'medium' }).format(new Date(row.publishedAt)) : '—' },
        { key: 'status', label: 'Estado', render: (row) => <span className={`admin-tag ${row.status === 'published' ? 'admin-tag--green' : 'admin-tag--gold'}`}>{row.status === 'published' ? 'Publicado' : row.status === 'scheduled' ? 'Agendado' : 'Rascunho'}</span> },
        { key: 'featured', label: 'Destaque', render: (row) => row.featured ? 'Sim' : '—' },
        { key: 'actions', label: 'Acções', align: 'end', render: (row) => <div className="admin-table-actions"><Link href={`/admin/noticias/${row.id}`} aria-label={`Editar ${row.title}`}><Pencil size={15} /></Link><AdminDeleteButton resource="news" id={row.id} label={row.title} /></div> },
      ]} /><AdminPagination meta={data.meta} basePath="/admin/noticias" query={{ search: query.search, status: query.status }} /></> : <AdminEmptyState title="Sem publicações" description="Crie uma publicação para a disponibilizar no website público." />}
    </AdminPanel>}
  </>;
}

export function AdminDocumentsPageClient() {
  const query = useListQuery(20, 'updatedAt');
  const key = queryKey(query);
  const load = useCallback(() => listAdminDocuments({ search: query.search, status: query.status, page: query.page, perPage: query.perPage, sort: query.sort, direction: query.direction }), [query.search, query.status, query.page, query.perPage, query.sort, query.direction]);
  const { loading, data, error } = useAdminResource(key, load);
  return <>
    <AdminPageHeader title="Documentos" description="Publica legislação, regulamentos, relatórios, manuais, publicações e formulários." action={<AdminCreateLink href="/admin/documentos/novo">Adicionar documento</AdminCreateLink>} />
    {loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : <AdminPanel title="Biblioteca documental">
      <div className="admin-list-toolbar"><AdminSearch initialValue={query.search} placeholder="Pesquisar documento…" /><form method="get"><input type="hidden" name="search" value={query.search ?? ''} /><label className="sr-only" htmlFor="document-status">Estado do documento</label><select className="admin-filter-select" id="document-status" name="status" defaultValue={query.status ?? ''} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="">Todos os estados</option><option value="draft">Rascunho</option><option value="published">Publicado</option></select></form></div>
      {data ? <><AdminTable<AdminDocumentListItem> rows={data.data} getKey={(row) => row.id} emptyTitle="Sem documentos" emptyDescription="Os documentos carregados e publicados aparecerão nesta lista." columns={[
        { key: 'title', label: 'Documento', render: (row) => <><strong>{row.title}</strong><small className="admin-table-subline">{row.category.name} · {row.year ?? '—'}</small></> },
        { key: 'type', label: 'Formato / tamanho', render: (row) => `${row.fileType.toUpperCase()} · ${formatFileSize(row.fileSizeBytes, 'pt')}` },
        { key: 'language', label: 'Idioma', render: (row) => row.language.toUpperCase() },
        { key: 'status', label: 'Estado', render: (row) => <span className={`admin-tag ${row.status === 'published' ? 'admin-tag--green' : 'admin-tag--gold'}`}>{row.status === 'published' ? 'Publicado' : 'Rascunho'}</span> },
        { key: 'actions', label: 'Acções', align: 'end', render: (row) => <div className="admin-table-actions"><Link href={`/admin/documentos/${row.id}`} aria-label={`Editar ${row.title}`}><Pencil size={15} /></Link><AdminDeleteButton resource="documents" id={row.id} label={row.title} /></div> },
      ]} /><AdminPagination meta={data.meta} basePath="/admin/documentos" query={{ search: query.search, status: query.status }} /></> : <AdminEmptyState title="Sem documentos" description="Os documentos carregados e publicados aparecerão nesta lista." />}
    </AdminPanel>}
  </>;
}

export function AdminHeroPageClient() {
  const params = useSearchParams();
  const search = params.get('search') ?? undefined;
  const page = clampPage(params.get('page') ?? undefined);
  const query: AdminListQuery = { search, page, perPage: 20, sort: 'order', direction: 'asc' };
  const key = queryKey(query);
  const load = useCallback(() => listHeroSlides({ search, page, perPage: 20, sort: 'order', direction: 'asc' }), [search, page]);
  const { loading, data, error } = useAdminResource<Awaited<ReturnType<typeof listHeroSlides>>>(key, load);
  return <><AdminPageHeader title="Hero / Banners" description="Gira os slides apresentados na página inicial, com conteúdo em Português e English." action={<AdminCreateLink href="/admin/hero/novo">Novo slide</AdminCreateLink>} />{loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : <AdminPanel title="Slides da página inicial" description="O slide CNC institucional é sempre apresentado primeiro."><div className="admin-list-toolbar"><AdminSearch initialValue={search} placeholder="Pesquisar título…" /><span className="admin-tag">{data?.meta.total ?? 0} registos</span></div>{data && <HeroSlidesTable initialItems={data.data} />}{data && <AdminPagination meta={data.meta} basePath="/admin/hero" query={{ search }} />}</AdminPanel>}</>;
}

export function AdminCooperativeEditorPageClient({ id }: { id?: string }) {
  const load = useCallback(async () => {
    const [record, provinces, activities] = await Promise.all([
      id ? getAdminCooperative(id) : Promise.resolve(null),
      listProvinces(),
      listActivities(),
    ]);
    return { record, provinces, activities };
  }, [id]);
  const { loading, data, error } = useAdminResource(`cooperative-editor:${id ?? 'new'}`, load);
  return <><AdminBackLink href="/admin/cooperativas" /><AdminPageHeader title={id ? 'Editar cooperativa' : 'Adicionar cooperativa'} description={id ? 'Actualize os campos administrativos e o conteúdo publicado em Português e English.' : 'O CNC é responsável pelo cadastro e validação dos perfis. Não existe login para cooperativas.'} />{loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : data ? <CooperativeEditor initial={data.record as AdminCooperativeRecord | null} provinces={data.provinces} activities={data.activities} /> : null}</>;
}

export function AdminNewsEditorPageClient({ id }: { id?: string }) {
  const load = useCallback(async () => {
    const [record, categories] = await Promise.all([
      id ? getAdminNews(id) : Promise.resolve(null),
      getAdminNewsCategories(),
    ]);
    return { record, categories };
  }, [id]);
  const { loading, data, error } = useAdminResource(`news-editor:${id ?? 'new'}`, load);
  return <><AdminBackLink href="/admin/noticias" /><AdminPageHeader title={id ? 'Editar publicação' : 'Nova publicação'} description={id ? 'Edite conteúdo estruturado, imagens e estado de publicação.' : 'Crie notícia, actividade, evento ou comunicado. O conteúdo precisa de tradução PT e EN.'} />{loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : data ? <NewsEditor initial={data.record as AdminNewsRecord | null} categories={data.categories} /> : null}</>;
}

export function AdminDocumentEditorPageClient({ id }: { id?: string }) {
  const load = useCallback(async () => {
    const [record, categories] = await Promise.all([
      id ? getAdminDocument(id) : Promise.resolve(null),
      getAdminDocumentCategories(),
    ]);
    return { record, categories };
  }, [id]);
  const { loading, data, error } = useAdminResource(`document-editor:${id ?? 'new'}`, load);
  return <><AdminBackLink href="/admin/documentos" /><AdminPageHeader title={id ? 'Editar documento' : 'Adicionar documento'} description={id ? 'Actualize as traduções, arquivo, categoria e estado.' : 'Carregue o ficheiro e preencha a informação em Português e English.'} />{loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : data ? <DocumentEditor initial={data.record as AdminDocumentRecord | null} categories={data.categories as AdminDocumentCategory[]} /> : null}</>;
}

export function AdminHeroEditorPageClient({ id }: { id?: string }) {
  const load = useCallback(() => id ? getHeroSlide(id) : Promise.resolve(null), [id]);
  const { loading, data, error } = useAdminResource(`hero-editor:${id ?? 'new'}`, load);
  return <><AdminBackLink href="/admin/hero" /><AdminPageHeader title={id ? 'Editar slide' : 'Criar slide'} description={id ? 'Atualize imagem, traduções, ordem e estado do banner.' : 'O primeiro slide institucional deve representar o CNC; os restantes podem promover cooperativas e campanhas.'} />{id && loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : <HeroSlideEditor initial={data as AdminHeroSlideRecord | null} />}</>;
}

export function AdminInstitutionalPageClient() {
  const load = useCallback(() => getAdminInstitutional(), []);
  const { loading, data, error } = useAdminResource('institutional', load);
  return <><AdminPageHeader title="Institucional" description="Edite as secções públicas do CNC em Português e English numa única área." />{loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : <InstitutionalEditor initial={data ?? []} />}</>;
}

export function AdminStatisticsPageClient() {
  const params = useSearchParams();
  const query: AdminListQuery = { search: params.get('search') ?? undefined, page: clampPage(params.get('page') ?? undefined), perPage: 30, sort: 'key', direction: 'asc' };
  const key = queryKey(query);
  const load = useCallback(async () => {
    const [indicators, provinces, activities] = await Promise.all([listStatisticIndicators({ search: query.search, page: query.page, perPage: query.perPage, sort: query.sort, direction: query.direction }), listProvinces(), listActivities()]);
    return { indicators, provinces, activities };
  }, [query.search, query.page, query.perPage, query.sort, query.direction]);
  const { loading, data, error } = useAdminResource(key, load);
  const queryProvince = (province: { id: string; code: string; name: string; municipalities: Array<{ id: string; name: string }> }) => ({ id: province.id, code: province.code, name: province.name, slug: province.code.toLowerCase() });
  return <><AdminPageHeader title="Estatísticas" description="Gira valores e indicadores públicos." />{loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : data ? <AdminPanel title="Indicadores públicos" description="Não calcule totais; publique somente valores aprovados e respectivos períodos."><StatisticsManager initial={data.indicators.data as AdminStatisticIndicator[]} provinces={data.provinces.map(queryProvince)} activities={data.activities} /><AdminPagination meta={data.indicators.meta} basePath="/admin/estatisticas" query={{ search: query.search }} /></AdminPanel> : null}</>;
}

export function AdminMediaPageClient() {
  const params = useSearchParams();
  const search = params.get('search') ?? '';
  const type = params.get('type') ?? '';
  const page = clampPage(params.get('page') ?? undefined);
  const meta: PaginationMeta = { ...emptyMeta, currentPage: page, perPage: 24 };
  return <><AdminPageHeader title="Media Library" description="Biblioteca centralizada de imagens, logótipos e documentos utilizados pelo portal." /><AdminPanel><MediaLibrary key={`${search}:${type}:${page}`} initial={[] as MediaAsset[]} initialMeta={meta} initialSearch={search} initialType={type} initialPage={page} /></AdminPanel></>;
}

export function AdminSocialLinksPageClient() {
  const load = useCallback(() => listSocialLinks(), []);
  const { loading, data, error } = useAdminResource<SocialNetwork[]>('social-links', load);
  return <><AdminPageHeader title="Redes sociais" description="Configure plataformas e endereços oficiais. Links não definidos ou inactivos não aparecem no rodapé." />{loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : <AdminPanel><SocialLinksManager initial={data ?? []} /></AdminPanel>}</>;
}

export function AdminSettingsPageClient() {
  const load = useCallback(() => getAdminSettings(), []);
  const { loading, data, error } = useAdminResource('site-settings', load);
  const emptySettings = { logoId: null, faviconUrl: '', translations: { pt: { organizationName: '', footerText: '', address: '' }, en: { organizationName: '', footerText: '', address: '' } }, phone: '', email: '' };
  return <><AdminPageHeader title="Configurações" description="Identidade institucional, dados de contacto e textos globais do website em PT e EN." />{loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : <SettingsEditor initial={data ?? emptySettings} />}</>;
}

export function AdminNewsletterPageClient() {
  const query = useListQuery(30, 'subscribedAt');
  const key = queryKey(query);
  const load = useCallback(() => listSubscribers({ search: query.search, status: query.status, page: query.page, perPage: query.perPage, sort: query.sort, direction: query.direction }), [query.search, query.status, query.page, query.perPage, query.sort, query.direction]);
  const { loading, data, error } = useAdminResource(key, load);
  return <><AdminPageHeader title="Newsletter" description="Gerencie contactos que aceitaram receber novidades." />{loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : <AdminPanel title="Subscritores" description={`${data?.meta.total ?? 0} subscrições.`}><div className="admin-list-toolbar"><AdminSearch initialValue={query.search} placeholder="Pesquisar por email…" /><form method="get"><input type="hidden" name="search" value={query.search ?? ''} /><label className="sr-only" htmlFor="subscriber-status">Estado da subscrição</label><select className="admin-filter-select" id="subscriber-status" name="status" defaultValue={query.status ?? ''} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="">Todos os estados</option><option value="active">Activa</option><option value="pending">Pendente</option><option value="unsubscribed">Removida</option></select></form></div>{data && <><AdminTable<NewsletterSubscription> rows={data.data} getKey={(row) => row.id} emptyTitle="Sem subscritores" emptyDescription="As novas subscrições públicas aparecerão aqui." columns={[{ key: 'email', label: 'Email', render: (row) => <strong>{row.email}</strong> }, { key: 'status', label: 'Estado', render: (row) => <SubscriberStatus status={row.status} /> }, { key: 'date', label: 'Data de subscrição', render: (row) => formatDate(row.subscribedAt, 'pt') }]} /><AdminPagination meta={data.meta} basePath="/admin/newsletter" query={{ search: query.search, status: query.status }} /></>}</AdminPanel>}</>;
}

export function AdminContactsPageClient() {
  const query = useListQuery(20, 'receivedAt');
  const key = queryKey(query);
  const load = useCallback(() => listContactMessages({ search: query.search, status: query.status, page: query.page, perPage: query.perPage, sort: query.sort, direction: query.direction }), [query.search, query.status, query.page, query.perPage, query.sort, query.direction]);
  const { loading, data, error } = useAdminResource(key, load);
  return <><AdminPageHeader title="Mensagens de contacto" description="Leia e acompanhe mensagens enviadas pelo formulário público." />{loading ? <InlineLoading /> : error ? <AdminApiState error={error} /> : <AdminPanel title="Caixa de entrada" description={`${data?.meta.total ?? 0} mensagens nesta consulta.`}><div className="admin-list-toolbar"><AdminSearch initialValue={query.search} placeholder="Pesquisar nome, email ou assunto…" /><form method="get"><input type="hidden" name="search" value={query.search ?? ''} /><label className="sr-only" htmlFor="contact-status">Estado da mensagem</label><select className="admin-filter-select" id="contact-status" name="status" defaultValue={query.status ?? ''} onChange={(event) => event.currentTarget.form?.requestSubmit()}><option value="">Todos os estados</option><option value="new">Nova</option><option value="read">Lida</option><option value="responded">Respondida</option><option value="archived">Arquivada</option></select></form></div>{data && <ContactMessages initial={data.data as ContactMessage[]} meta={data.meta} query={{ search: query.search, status: query.status }} />}</AdminPanel>}</>;
}
