import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router"
import {
  ArrowRight,
  BarChart3,
  Camera,
  Globe2,
  Menu,
  Search,
  Share2,
  X,
} from "lucide-react"
import logo from "../imports/cnc-logo.jpeg"
import { articles, cooperatives, documents } from "../app/data"
import { Button, Container, Input } from "./ui"

const navigation = [
  ["Início", "/"],
  ["Cooperativas", "/cooperativas"],
  ["Actualidade", "/actualidade"],
  ["Institucional", "/institucional"],
  ["Documentos", "/documentos"],
  ["Contactos", "/contactos"],
]

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      to="/"
      className={`brand ${inverse ? "brand--inverse" : ""}`}
      aria-label="CNC — Início"
    >
      <span className="brand__mark">
        <img src={logo} alt="" />
      </span>
      <span className="brand__words">
        <strong>CNC</strong>
        <small>Conselho Nacional de Cooperativas</small>
      </span>
    </Link>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [language, setLanguage] = useState("PT")
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [location.pathname])

  return (
    <>
      <div className="utility-bar">
        <Container className="utility-bar__inner">
          <span>Portal nacional do movimento cooperativo de Angola</span>
          <Link to="/estatisticas">
            <BarChart3 size={14} /> Estatísticas
          </Link>
        </Container>
      </div>
      <header className="site-header">
        <Container className="site-header__inner">
          <Brand />
          <nav
            className={`main-nav ${open ? "main-nav--open" : ""}`}
            aria-label="Navegação principal"
          >
            {navigation.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {label}
              </NavLink>
            ))}
            <Link to="/cooperativas" className="nav-feature">
              Encontrar cooperativa
            </Link>
          </nav>
          <div className="header-actions">
            <Button
              variant="ghost"
              className="icon-button"
              aria-label="Abrir pesquisa global"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={21} />
            </Button>
            <button
              className="language-toggle"
              aria-label="Alterar idioma"
              onClick={() => setLanguage(language === "PT" ? "EN" : "PT")}
            >
              {language}
            </button>
            <Button
              variant="ghost"
              className="icon-button menu-toggle"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={23} /> : <Menu size={23} />}
            </Button>
          </div>
        </Container>
      </header>
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

type SearchPanelProps = {
  open: boolean
  onClose: () => void
}

function SearchPanel({ open, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const q = query.toLowerCase()
  const matchingCoops = cooperatives
    .filter((item) => item.name.toLowerCase().includes(q))
    .slice(0, 3)
  const matchingArticles = articles
    .filter((item) => item.title.toLowerCase().includes(q))
    .slice(0, 2)

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  if (!open) return null
  return (
    <div
      className="search-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Pesquisa global"
    >
      <Container>
        <div className="search-panel__top">
          <p className="eyebrow">Pesquisa global</p>
          <Button
            variant="ghost"
            className="icon-button"
            aria-label="Fechar pesquisa"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
        <div className="global-search">
          <Search size={28} />
          <Input
            autoFocus
            placeholder="Pesquisar cooperativas, notícias e documentos..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onClose()
                navigate(`/pesquisa?q=${encodeURIComponent(query)}`)
              }
            }}
          />
        </div>
        <div className="search-groups">
          <div>
            <span>COOPERATIVAS · {matchingCoops.length}</span>
            {(query ? matchingCoops : cooperatives.slice(0, 2)).map((item) => (
              <Link
                key={item.slug}
                to={`/cooperativas/${item.province.toLowerCase()}/${item.slug}`}
                onClick={onClose}
              >
                <strong>{item.name}</strong>
                <small>
                  {item.province} · {item.activity}
                </small>
              </Link>
            ))}
          </div>
          <div>
            <span>ACTUALIDADE · {matchingArticles.length}</span>
            {(query ? matchingArticles : articles.slice(0, 2)).map((item) => (
              <Link
                key={item.slug}
                to={`/actualidade/noticias/${item.slug}`}
                onClick={onClose}
              >
                <strong>{item.title}</strong>
                <small>
                  {item.category} · {item.date}
                </small>
              </Link>
            ))}
          </div>
          <div>
            <span>DOCUMENTOS · {documents.length}</span>
            {documents.slice(0, 2).map((item) => (
              <Link key={item.title} to="/documentos" onClick={onClose}>
                <strong>{item.title}</strong>
                <small>
                  {item.category} · {item.type}
                </small>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div className="footer-about">
            <Brand inverse />
            <p>
              Uma plataforma pública de referência para conhecer, acompanhar e
              valorizar o movimento cooperativo em Angola.
            </p>
            <div className="socials">
              <button aria-label="Facebook">
                <Globe2 size={18} />
              </button>
              <button aria-label="Instagram">
                <Camera size={18} />
              </button>
              <button aria-label="LinkedIn">
                <Share2 size={18} />
              </button>
            </div>
          </div>
          <div>
            <h3>Navegação</h3>
            {navigation.map(([label, path]) => (
              <Link key={path} to={path}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Links úteis</h3>
            <Link to="/documentos">Legislação</Link>
            <Link to="/documentos">Publicações</Link>
            <Link to="/estatisticas">Estatísticas</Link>
            <Link to="/cooperativas?view=mapa">Mapa de cooperativas</Link>
          </div>
          <div>
            <h3>Contactos</h3>
            <p>Telefone: a disponibilizar</p>
            <p>Email: a disponibilizar</p>
            <p>Endereço institucional: a disponibilizar</p>
            <Link className="footer-contact" to="/contactos">
              Contactar o CNC <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CNC — Conselho Nacional de Cooperativas</span>
          <div>
            <Link to="/privacidade">Privacidade</Link>
            <Link to="/termos">Termos de utilização</Link>
            <button>PT / EN</button>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export function Layout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#content">
        Saltar para o conteúdo
      </a>
      <Header />
      <main id="content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
