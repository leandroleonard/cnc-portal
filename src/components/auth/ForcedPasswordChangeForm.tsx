'use client';

import { useEffect, useState, useSyncExternalStore, type FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { changeAdminPassword, getCurrentAdmin } from '@/lib/api/auth';
import { adminLandingPath } from '@/lib/auth/admin-nav';
import { ApiError, getAccessToken, setAccessToken, subscribeToAccessToken } from '@/lib/api/client';
import { persistAdminSession, restoreAdminSession } from '@/lib/api/session';

/**
 * Redefinição obrigatória de senha no 1º acesso do cadastrador (a senha foi definida pelo admin).
 * O servidor bloqueia todos os outros endpoints até a senha ser trocada (middleware password.changed).
 */
export function ForcedPasswordChangeForm() {
  const router = useRouter();
  const token = useSyncExternalStore(subscribeToAccessToken, getAccessToken, () => null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sem token em memória, tenta reidratar a partir do cookie httpOnly (após refresh).
  // restoreAdminSession publica o token na loja externa; em caso de falha, volta ao login.
  useEffect(() => {
    if (token) return;
    let active = true;
    void restoreAdminSession()
      .then((user) => { if (active && !user) router.replace('/admin/login'); })
      .catch(() => { if (active) router.replace('/admin/login'); });
    return () => { active = false; };
  }, [token, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    const errors: Record<string, string> = {};
    if (!currentPassword) errors.current_password = 'Introduza a palavra-passe actual (definida pelo administrador).';
    if (password.length < 10 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      errors.password = 'A nova palavra-passe deve ter pelo menos 10 caracteres, com letras e números.';
    }
    if (password !== confirmation) errors.password_confirmation = 'A confirmação não coincide com a nova palavra-passe.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const token = await changeAdminPassword(currentPassword, password);
      setAccessToken(token.accessToken, token.expiresInSeconds);
      await persistAdminSession(token.accessToken, token.expiresInSeconds).catch(() => null);
      let destination = '/admin';
      try {
        const user = await getCurrentAdmin();
        destination = adminLandingPath(user);
      } catch {
        destination = '/admin';
      }
      router.replace(destination);
      router.refresh();
    } catch (cause) {
      if (cause instanceof ApiError && cause.fieldErrors) {
        const mapped: Record<string, string> = {};
        for (const [key, messages] of Object.entries(cause.fieldErrors)) mapped[key] = messages[0] ?? 'Valor inválido.';
        setFieldErrors(mapped);
        setError('Não foi possível redefinir a palavra-passe. Verifique os campos.');
      } else {
        setError(cause instanceof Error ? cause.message : 'Não foi possível redefinir a palavra-passe.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <p className="admin-login-secure" role="status">A validar a sessão…</p>;
  }

  return <form className="admin-login-form" onSubmit={submit} noValidate>
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    <p className="admin-login-secure" style={{ textAlign: 'left' }}>
      Por segurança, defina uma nova palavra-passe antes de continuar. A palavra-passe actual foi definida pelo administrador do CNC.
    </p>
    <label><span>Palavra-passe actual</span><div className="admin-login-input"><LockKeyhole size={17} /><input type={show ? 'text' : 'password'} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} aria-invalid={Boolean(fieldErrors.current_password)} /></div>{fieldErrors.current_password && <small className="field-error">{fieldErrors.current_password}</small>}</label>
    <label><span>Nova palavra-passe</span><div className="admin-login-input"><KeyRound size={17} /><input type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(fieldErrors.password)} /></div>{fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}</label>
    <label><span>Confirmar nova palavra-passe</span><div className="admin-login-input"><KeyRound size={17} /><input type={show ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} aria-invalid={Boolean(fieldErrors.password_confirmation)} /><button type="button" aria-label={show ? 'Ocultar palavras-passe' : 'Mostrar palavras-passe'} onClick={() => setShow((value) => !value)}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{fieldErrors.password_confirmation && <small className="field-error">{fieldErrors.password_confirmation}</small>}</label>
    <button className="button button--primary admin-login-submit" type="submit" disabled={loading}>{loading ? 'A guardar…' : 'Redefinir palavra-passe e continuar'} <KeyRound size={17} /></button>
    <p className="admin-login-secure">Mínimo de 10 caracteres, com letras e números. Não pode ser igual à palavra-passe actual.</p>
  </form>;
}
