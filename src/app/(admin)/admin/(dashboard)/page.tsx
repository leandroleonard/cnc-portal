import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminApiState } from '@/components/admin/AdminUI';
import { getAdminDashboard } from '@/lib/api/admin';
import { loadApi } from '@/lib/api/loader';

export default async function AdminHomePage() {
  const result = await loadApi(getAdminDashboard);
  if (result.error || !result.data) return <><div className="admin-page-header"><div><p className="admin-eyebrow">CNC · GESTÃO DE CONTEÚDOS</p><h1>Dashboard</h1><p>Resumo fornecido pela API de administração.</p></div></div><AdminApiState error={result.error ?? new Error('A API não devolveu dados para o dashboard.')} /></>;
  return <AdminDashboard data={result.data} />;
}
