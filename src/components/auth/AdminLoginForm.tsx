'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCurrentAdmin, resendLoginCode, startLogin, verifyLoginCode, type AdminLoginToken, type TwoFactorChallenge } from '@/lib/api/auth';
import { adminLandingPath, adminPasswordChangePath, canAccessAdminPath } from '@/lib/auth/admin-nav';
import { ApiError, setAccessToken } from '@/lib/api/client';
import { persistAdminSession } from '@/lib/api/session';
import { loginSchema } from '@/lib/validation/forms';
import { safeAdminRedirect } from '@/lib/auth/admin-redirect';

function safeNextAdminPath(): string {
  return safeAdminRedirect(new URLSearchParams(window.location.search).get('next'), window.location.origin);
}

export function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Contagem decrescente do cooldown de reenvio (apenas actualiza um contador, não decide permissões).
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => (value > 0 ? value - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function finalizeLogin(token: AdminLoginToken) {
    setAccessToken(token.accessToken, token.expiresInSeconds);
    // Persistência em cookie httpOnly é best-effort: não bloqueia o login se falhar.
    await persistAdminSession(token.accessToken, token.expiresInSeconds).catch(() => null);
    if (token.mustChangePassword) {
      router.replace(adminPasswordChangePath);
      router.refresh();
      return;
    }
    const next = safeNextAdminPath();
    let destination = next;
    try {
      const user = await getCurrentAdmin();
      destination = canAccessAdminPath(user, next) ? next : adminLandingPath(user);
    } catch {
      destination = next;
    }
    router.replace(destination);
    router.refresh();
  }

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
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
      const result = await startLogin(parsed.data);
      if (result.twoFactorRequired) {
        setChallenge({
          challengeId: result.challengeId,
          emailMasked: result.emailMasked,
          expiresInSeconds: result.expiresInSeconds,
          resendCooldownSeconds: result.resendCooldownSeconds,
        });
        setCooldown(result.resendCooldownSeconds);
        setCode('');
        setStep('code');
      } else {
        await finalizeLogin(result);
      }
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 401 ? 'Email ou palavra-passe inválidos.' : cause instanceof Error ? cause.message : 'Não foi possível iniciar sessão.');
    } finally {
      setLoading(false);
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;
    setError('');
    if (!/^\d{6}$/.test(code)) {
      setError('Introduza o código de 6 dígitos enviado para o seu email.');
      return;
    }
    setLoading(true);
    try {
      const token = await verifyLoginCode(challenge.challengeId, code);
      await finalizeLogin(token);
    } catch (cause) {
      if (cause instanceof ApiError && (cause.status === 409 || cause.status === 410)) {
        setError('O código já não é válido. Volte a iniciar sessão para receber um novo.');
        setStep('credentials');
        setChallenge(null);
      } else {
        setError(cause instanceof Error ? cause.message : 'Não foi possível validar o código.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!challenge || cooldown > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      const refreshed = await resendLoginCode(challenge.challengeId);
      setChallenge(refreshed);
      setCooldown(refreshed.resendCooldownSeconds);
      setCode('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível reenviar o código.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'code' && challenge) {
    return <form className="admin-login-form" onSubmit={submitCode} noValidate>
      {error && <p className="admin-form-error" role="alert">{error}</p>}
      <p className="admin-login-secure" style={{ textAlign: 'left' }}>
        Enviámos um código de 6 dígitos para <strong>{challenge.emailMasked}</strong>. Introduza-o abaixo para aprovar o acesso.
      </p>
      <label><span>Código de verificação</span><div className="admin-login-input"><ShieldCheck size={17} /><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" aria-label="Código de verificação de 6 dígitos" /></div></label>
      <button className="button button--primary admin-login-submit" type="submit" disabled={loading || code.length !== 6}>{loading ? 'A validar…' : 'Aprovar acesso'} <ShieldCheck size={17} /></button>
      <button className="button admin-login-submit" type="button" onClick={resend} disabled={loading || cooldown > 0}>{cooldown > 0 ? `Reenviar código (${cooldown}s)` : 'Reenviar código'}</button>
      <button className="button admin-login-submit" type="button" onClick={() => { setStep('credentials'); setChallenge(null); setError(''); }} disabled={loading}><ArrowLeft size={15} /> Voltar</button>
      <p className="admin-login-secure">O código expira em poucos minutos e só pode ser usado uma vez.</p>
    </form>;
  }

  return <form className="admin-login-form" onSubmit={submitCredentials} noValidate>
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    <label><span>Email institucional</span><div className="admin-login-input"><Mail size={17} /><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@cnc.ao" aria-invalid={Boolean(fieldErrors.email)} /></div>{fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}</label>
    <label><span>Palavra-passe</span><div className="admin-login-input"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(fieldErrors.password)} /><button type="button" aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}</label>
    <button className="button button--primary admin-login-submit" type="submit" disabled={loading}>{loading ? 'A verificar…' : 'Entrar na administração'} <LogIn size={17} /></button>
    <p className="admin-login-secure">É enviado um código de verificação para o seu email. A autenticação e as permissões são validadas pelo servidor CNC.</p>
  </form>;
}
