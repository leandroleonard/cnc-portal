import Link from 'next/link';

export default function AdminNotFound() {
  return <main className="admin-login-wrap"><section className="admin-auth-card"><span className="error-code">404</span><h1>Página não encontrada</h1><p>O endereço administrativo não existe ou já foi alterado.</p><Link className="button button--primary" href="/admin">Voltar ao painel</Link></section></main>;
}
