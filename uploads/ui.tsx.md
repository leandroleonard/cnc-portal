import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react"
import { Link, type LinkProps } from "react-router"
import { ArrowRight } from "lucide-react"

export function Container({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`container ${className}`}>{children}</div>
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "light"
}) {
  return (
    <button className={`button button--${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function AppLink({
  children,
  variant = "primary",
  className = "",
  ...props
}: LinkProps & { variant?: "primary" | "secondary" | "ghost" | "light" }) {
  return (
    <Link className={`button button--${variant} ${className}`} {...props}>
      {children}
    </Link>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />
}

export function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <label className="select-label">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      >
        <option value="">Todas</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  light = false,
  action,
}: {
  eyebrow?: string
  title: string
  body?: string
  light?: boolean
  action?: ReactNode
}) {
  return (
    <div className={`section-heading ${light ? "section-heading--light" : ""}`}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {body && <p className="section-intro">{body}</p>}
      </div>
      {action}
    </div>
  )
}

type TextLinkProps = {
  to: string
  children: ReactNode
}

export function TextLink({ to, children }: TextLinkProps) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  )
}

export function DemoBadge() {
  return <span className="demo-badge">Dados demonstrativos</span>
}
