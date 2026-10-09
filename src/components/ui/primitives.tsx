import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`container ${className}`}>{children}</div>;
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'light' }) {
  return <button className={`button button--${variant} ${className}`} type={type} {...props}>{children}</button>;
}

export function AppLink({
  children,
  href,
  variant = 'primary',
  className = '',
}: {
  children: ReactNode;
  href: Parameters<typeof Link>[0]['href'];
  variant?: 'primary' | 'secondary' | 'ghost' | 'light';
  className?: string;
}) {
  return <Link className={`button button--${variant} ${className}`} href={href}>{children}</Link>;
}

export function TextLink({
  href,
  children,
}: {
  href: Parameters<typeof Link>[0]['href'];
  children: ReactNode;
}) {
  return <Link className="text-link" href={href}>{children}<ArrowRight size={17} aria-hidden="true" /></Link>;
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  light = false,
  action,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  light?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className={`section-heading ${light ? 'section-heading--light' : ''}`}>
      <div>
        {eyebrow && <p className={`eyebrow ${light ? 'eyebrow--gold' : ''}`}>{eyebrow}</p>}
        <h2>{title}</h2>
        {body && <p className="section-intro">{body}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <Container>
        <p className="eyebrow eyebrow--gold">{eyebrow}</p>
        {/* <h1>{title}</h1> */}
        <p>{body}</p>
        {children}
      </Container>
    </section>
  );
}

export function DemoBadge({ children = 'Dados demonstrativos' }: { children?: string }) {
  return <span className="demo-badge">{children}</span>;
}

export function StatusPill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'success' | 'warning' | 'neutral' | 'danger' }) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}
