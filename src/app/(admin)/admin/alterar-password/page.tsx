import Link from 'next/link';
import Image from 'next/image';
import { ForcedPasswordChangeForm } from '@/components/auth/ForcedPasswordChangeForm';
import { staticMedia } from '@/lib/media';

export const metadata = { title: 'Redefinir palavra-passe' };

export default function AlterarPasswordPage() {
  return <main className="admin-login-wrap"><div className="admin-login-brand"><Link href="/pt" className="brand"><span className="brand__mark"><Image src={staticMedia.cncLogo} alt="" width={56} height={56} /></span><span className="brand__words"><strong>CNC</strong><small>Conselho Nacional de Cooperativas</small></span></Link><p>Gestão do portal institucional</p></div><section className="admin-auth-card"><div className="admin-auth-heading"><div><p className="admin-eyebrow">PRIMEIRO ACESSO</p><h1>Redefinir palavra-passe</h1><p>Defina uma palavra-passe pessoal para activar o seu acesso.</p></div></div><ForcedPasswordChangeForm /></section><footer className="admin-login-footer"><span>© {new Date().getFullYear()} CNC</span><span>Acesso protegido · Sessão segura</span></footer></main>;
}
