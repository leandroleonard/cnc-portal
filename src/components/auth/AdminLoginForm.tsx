'use client';

import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/api/auth';
import { ApiError, setAccessToken } from '@/lib/api/client';
import { loginSchema } from '@/lib/validation/forms';
import { safeAdminRedirect } from '@/lib/auth/admin-redirect';

function safeNextAdminPath(): string {
  return safeAdminRedirect(new URLSearchParams(window.location.search).get('next'), window.location.origin);
}

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) errors[String(issue.path[0] ?? 'form')] = issue.message;
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const token = await loginAdmin(parsed.data);
      setAccessToken(token.accessToken, token.expiresInSeconds);
      router.replace(safeNextAdminPath());
      router.refresh();
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 401 ? 'Email ou palavra-passe inválidos.' : cause instanceof Error ? cause.message : 'Não foi possível iniciar sessão.');
    } finally {
      setLoading(false);
    }
  }

  return <form className="admin-login-form" onSubmit={submit} noValidate>
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    <label><span>Email institucional</span><div className="admin-login-input"><Mail size={17} /><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@cnc.ao" aria-invalid={Boolean(fieldErrors.email)} /></div>{fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}</label>
    <label><span>Palavra-passe</span><div className="admin-login-input"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(fieldErrors.password)} /><button type="button" aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}</label>
    <button className="button button--primary admin-login-submit" type="submit" disabled={loading}>{loading ? 'A verificar…' : 'Entrar na administração'} <LogIn size={17} /></button>
    <p className="admin-login-secure">A autenticação e as permissões são validadas pelo servidor CNC.</p>
  </form>;
}
