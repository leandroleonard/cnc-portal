import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';
import { staticMedia } from '@/lib/media';

export default function AdminLoginPage() {
  return <main className="admin-login-wrap"><div className="admin-login-brand"><Link href="/pt" className="brand"><span className="brand__mark"><Image src={staticMedia.cncLogo} alt="" width={56} height={56} /></span><span className="brand__words"><strong>CNC</strong><small>Conselho Nacional de Cooperativas</small></span></Link><p>Gestão do portal institucional</p></div><section className="admin-auth-card"><div className="admin-auth-heading"><div><p className="admin-eyebrow">ÁREA RESERVADA</p><h1>Iniciar sessão</h1><p>Acesso exclusivo aos utilizadores autorizados do CNC.</p></div></div><AdminLoginForm /></section><footer className="admin-login-footer"><span>© {new Date().getFullYear()} CNC</span><span>Acesso protegido · Sessão segura</span></footer></main>;
}
