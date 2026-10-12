'use client';

import { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity, Bell, Building2, ChartNoAxesCombined, ChevronDown, FileText, Globe2,
  LayoutDashboard, LogOut, Mail, Menu, Newspaper, PanelsTopLeft, Settings,
  Share2, Users, X, Image as ImageIcon,
} from 'lucide-react';
import type { AdminUser } from '@/types/domain';
import { logoutAdmin } from '@/lib/api/auth';
import { hasPermission } from '@/lib/utils/permissions';
import { staticMedia } from '@/lib/media';

const AdminUserContext = createContext<AdminUser | null>(null);

export function useAdminUser() {
  return useContext(AdminUserContext);
}

const navItems = [
  { href: '/admin', label: 'Dashboard', permission: 'dashboard.view', Icon: LayoutDashboard, exact: true },
  { href: '/admin/hero', label: 'Hero / Banners', permission: 'hero-slides.view', Icon: PanelsTopLeft },
  { href: '/admin/cooperativas', label: 'Cooperativas', permission: 'cooperatives.view', Icon: Building2 },
  { href: '/admin/noticias', label: 'Actualidade', permission: 'news.view', Icon: Newspaper },
  { href: '/admin/documentos', label: 'Documentos', permission: 'documents.view', Icon: FileText },
  { href: '/admin/institucional', label: 'Institucional', permission: 'institutional.view', Icon: Activity },
  { href: '/admin/estatisticas', label: 'Estatísticas', permission: 'statistics.view', Icon: ChartNoAxesCombined },
  { href: '/admin/media', label: 'Media', permission: 'media.view', Icon: ImageIcon },
  { href: '/admin/redes-sociais', label: 'Redes sociais', permission: 'social-links.view', Icon: Share2 },
  { href: '/admin/newsletter', label: 'Newsletter', permission: 'newsletter.view', Icon: Mail },
  { href: '/admin/contactos', label: 'Contactos', permission: 'contact-messages.view', Icon: Users },
  { href: '/admin/configuracoes', label: 'Configurações', permission: 'settings.view', Icon: Settings },
];

export function AdminShell({ children, user }: { children: React.ReactNode; user: AdminUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const visible = navItems.filter((item) => hasPermission(user, item.permission.slice(0, item.permission.lastIndexOf('.')), 'view'));

  async function signOut() {
    setLoggingOut(true);
    try { await logoutAdmin(); } catch { /* Local token invalidation still ends the client session. */ } finally { router.replace('/admin/login'); router.refresh(); setLoggingOut(false); }
  }

  return <AdminUserContext.Provider value={user}><div className="admin-shell">
    {drawerOpen && <button className="admin-sidebar-scrim" aria-label="Fechar navegação" onClick={() => setDrawerOpen(false)} />}
    <aside className={`admin-sidebar ${drawerOpen ? 'admin-sidebar--open' : ''}`}>
      <div className="admin-brand"><Link href="/admin"><Image src={staticMedia.cncLogo} alt="" width={44} height={44} sizes="44px" /><span><strong>CNC</strong><small>Gestão de conteúdos</small></span></Link><button className="admin-sidebar-close" aria-label="Fechar navegação" onClick={() => setDrawerOpen(false)}><X size={20} /></button></div>
      <div className="admin-sidebar-label">GESTÃO DO PORTAL</div>
      <nav aria-label="Navegação administrativa" className="admin-nav">
        {visible.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} onClick={() => setDrawerOpen(false)}><Icon size={18} aria-hidden="true" /><span>{label}</span></Link>;
        })}
      </nav>
      <div className="admin-sidebar-foot"><div className="admin-sidebar-foot__icon"><Globe2 size={18} /></div><div><strong>Website público</strong><span>Conteúdos PT / EN</span></div><a href="/pt" target="_blank" rel="noreferrer" aria-label="Abrir website público">↗</a></div>
    </aside>
    <div className="admin-main">
      <header className="admin-header">
        <button className="admin-menu-button" aria-label="Abrir navegação" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}><Menu size={21} /></button>
        <div className="admin-breadcrumb"><span>Administração</span><ChevronDown size={14} /><strong>{navItems.find((item) => item.exact ? pathname === item.href : pathname.startsWith(item.href))?.label ?? 'Conteúdo'}</strong></div>
        <div className="admin-header-actions"><span className="admin-language"><Globe2 size={15} /> Português · English</span><button className="admin-icon-button" aria-label="Notificações"><Bell size={18} /></button><div className="admin-user"><span className="admin-avatar">{user.name.trim().charAt(0).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.role}</small></span></div><button className="admin-logout" onClick={signOut} disabled={loggingOut}><LogOut size={17} /><span>{loggingOut ? 'A sair…' : 'Terminar sessão'}</span></button></div>
      </header>
      <main className="admin-content">{children}</main>
    </div>
  </div></AdminUserContext.Provider>;
}
