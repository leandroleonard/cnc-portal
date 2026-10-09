import { FormEvent, useMemo, useState } from "react"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Construction,
  Download,
  Factory,
  Fish,
  Handshake,
  HeartHandshake,
  Landmark,
  Leaf,
  Map,
  MapPin,
  MessageSquareText,
  PackageOpen,
  Search,
  Share2,
  ShieldCheck,
  Sprout,
  Tractor,
  TrendingUp,
  Users,
  Wheat,
  Wrench,
} from "lucide-react"
import {
  Link,
  createBrowserRouter,
  useParams,
  useSearchParams,
} from "react-router"
import { CooperativeCard, DocumentCard, NewsCard } from "../components/cards"
import { Layout } from "../components/layout"
import {
  AppLink,
  Button,
  Container,
  DemoBadge,
  Input,
  SectionHeading,
  Select,
  TextLink,
} from "../components/ui"
import {
  articles,
  cooperatives,
  documents,
  heroImage,
  images,
  provinces,
} from "./data"

const activities = [
  { name: "Agricultura", icon: Wheat },
  { name: "Agropecuária", icon: Tractor },
  { name: "Pecuária", icon: Sprout },
  { name: "Pesca", icon: Fish },
  { name: "Comércio", icon: CircleDollarSign },
  { name: "Indústria", icon: Factory },
  { name: "Serviços", icon: Wrench },
  { name: "Construção", icon: Construction },
]

function HomePage() {
  const [province, setProvince] = useState("")
  return (
    <>
      <section
        className="hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero__overlay" />
        <Container className="hero__content">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--gold">
              Portal nacional do movimento cooperativo
            </p>
            <h1>Cooperativas que fortalecem Angola</h1>
            <p className="hero__lead">
              Informação, cooperação e desenvolvimento para um movimento
              cooperativo mais forte, visível e conectado.
            </p>
            <div className="button-row">
              <AppLink to="/cooperativas" variant="light">
                Explorar cooperativas <ArrowRight size={18} />
              </AppLink>
              <AppLink to="/institucional" variant="secondary">
                Conhecer o CNC
              </AppLink>
            </div>
          </div>
          <div className="hero__territory">
            <Map size={28} />
            <div>
              <strong>Abrangência nacional</strong>
              <span>Representação de todo o território angolano</span>
            </div>
          </div>
        </Container>
        <div className="photo-credit">Fotografia: Richard Nyoni / Unsplash</div>
      </section>

      <section className="finder">
        <Container>
          <div className="finder__header">
            <div>
              <p className="eyebrow">Directório nacional</p>
              <h2>Encontre uma cooperativa</h2>
            </div>
            <p>Pesquise por localização, actividade ou nome.</p>
          </div>
          <div className="finder__controls">
            <label className="search-field">
              <span className="sr-only">Pesquisar por nome</span>
              <Search size={20} />
              <Input placeholder="Pesquisar por nome da cooperativa..." />
            </label>
            <Select
              label="Província"
              options={provinces}
              value={province}
              onChange={setProvince}
            />
            <Select
              label="Área de actividade"
              options={activities.map((item) => item.name)}
            />
            <AppLink
              to={`/cooperativas${province ? `?provincia=${province}` : ""}`}
            >
              Pesquisar <ArrowRight size={17} />
            </AppLink>
          </div>
          <p className="finder__hint">
            Pode filtrar também por município, estado e tipo de cooperativa.
          </p>
        </Container>
      </section>

      <section className="section stats-band">
        <Container>
          <SectionHeading
            eyebrow="Retrato do movimento"
            title="Cooperativas em números"
            body="Uma visão nacional preparada para apresentar indicadores actualizados e validados."
            action={<DemoBadge />}
          />
          <div className="stat-grid">
            {[
              ["—", "Cooperativas registadas", Building2],
              ["—", "Cooperados", Users],
              ["21", "Províncias abrangidas", MapPin],
              ["10", "Áreas de actividade", Activity],
            ].map(([value, label, Icon]) => (
              <article className="stat-card" key={String(label)}>
                <Icon size={22} />
                <strong>{String(value)}</strong>
                <span>{String(label)}</span>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <ProvinceSection />

      <section className="section activity-section">
        <Container>
          <SectionHeading
            eyebrow="Diversidade produtiva"
            title="Cooperativas por área de actividade"
            body="Descubra organizações que impulsionam diferentes sectores da economia e das comunidades."
          />
          <div className="activity-grid">
            {activities.map(({ name, icon: Icon }) => (
              <Link
                to={`/cooperativas?actividade=${name}`}
                className="activity-card"
                key={name}
              >
                <Icon size={25} />
                <strong>{name}</strong>
                <span>Explorar área</span>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="section section--soft">
        <Container>
          <SectionHeading
            eyebrow="Directório nacional"
            title="Cooperativas em destaque"
            body="Perfis demonstrativos que exemplificam a riqueza e diversidade do movimento cooperativo."
            action={<TextLink to="/cooperativas">Ver todas</TextLink>}
          />
          <div className="card-grid card-grid--three">
            {cooperatives.slice(0, 6).map((item) => (
              <CooperativeCard item={item} key={item.slug} />
            ))}
          </div>
        </Container>
      </section>

      <section className="section news-section">
        <Container>
          <SectionHeading
            eyebrow="Informação e transparência"
            title="Actualidade"
            body="Acompanhe notícias, actividades, eventos e comunicados do movimento cooperativo."
            action={<TextLink to="/actualidade">Toda a actualidade</TextLink>}
          />
          <div className="news-layout">
            <NewsCard item={articles[0]} featured />
            <div className="news-stack">
              {articles.slice(1).map((item) => (
                <NewsCard item={item} key={item.slug} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <WorkSection />

      <section className="section section--soft">
        <Container>
          <SectionHeading
            eyebrow="Centro de conteúdos"
            title="Documentos e publicações"
            body="Acesso organizado a recursos de apoio, publicações e documentos de referência."
            action={<TextLink to="/documentos">Abrir biblioteca</TextLink>}
          />
          <div className="document-list">
            {documents.slice(0, 3).map((item) => (
              <DocumentCard item={item} key={item.title} />
            ))}
          </div>
        </Container>
      </section>
      <MainCta />
    </>
  )
}

function ProvinceSection() {
  const [selected, setSelected] = useState("Huambo")
  return (
    <section className="section territory-section">
      <Container>
        <SectionHeading
          eyebrow="Presença territorial"
          title="Cooperativas em todo o território nacional"
          body="Explore o directório através da divisão administrativa actual de Angola."
          light
          action={<DemoBadge />}
        />
        <div className="territory-grid">
          <div
            className="angola-map"
            aria-label="Representação estilizada do mapa de Angola"
          >
            <svg
              viewBox="0 0 430 500"
              role="img"
              aria-label="Mapa estilizado de Angola com marcadores"
            >
              <path
                d="M104 42 L160 60 L194 44 L257 76 L314 70 L336 118 L315 166 L349 204 L332 267 L354 316 L322 372 L333 431 L259 454 L206 438 L153 460 L92 425 L67 367 L81 306 L54 247 L80 191 L64 130 Z"
                fill="currentColor"
              />
              <path
                d="M74 16 L117 18 L125 54 L87 59 L61 42 Z"
                fill="currentColor"
              />
              {[
                [143, 138],
                [235, 115],
                [114, 256],
                [220, 242],
                [278, 326],
                [172, 375],
              ].map(([x, y], index) => (
                <g key={index}>
                  <circle cx={x} cy={y} r="12" className="map-pulse" />
                  <circle cx={x} cy={y} r="5" className="map-dot" />
                </g>
              ))}
            </svg>
            <div className="map-caption">
              <MapPin size={17} />
              <span>Seleccione uma província na lista</span>
            </div>
          </div>
          <div className="province-panel">
            <div className="province-panel__top">
              <div>
                <p className="eyebrow eyebrow--gold">21 províncias</p>
                <h3>{selected}</h3>
              </div>
              <span>Dados em actualização</span>
            </div>
            <div className="province-list">
              {provinces.map((province) => (
                <button
                  key={province}
                  onClick={() => setSelected(province)}
                  className={selected === province ? "selected" : ""}
                >
                  {province}
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
            <AppLink
              to={`/cooperativas/${selected.toLowerCase().replace(/ /g, "-")}`}
              variant="light"
            >
              Ver cooperativas desta província <ArrowRight size={17} />
            </AppLink>
          </div>
        </div>
      </Container>
    </section>
  )
}

function WorkSection() {
  const work = [
    [
      "Acompanhamento",
      "Proximidade com as cooperativas e os territórios.",
      HeartHandshake,
    ],
    [
      "Promoção",
      "Valorização do papel económico e social das cooperativas.",
      TrendingUp,
    ],
    [
      "Capacitação",
      "Partilha de conhecimento e fortalecimento organizacional.",
      Users,
    ],
    [
      "Articulação",
      "Pontes entre cooperativas, parceiros e instituições.",
      Handshake,
    ],
    [
      "Informação",
      "Dados acessíveis para decisões mais transparentes.",
      MessageSquareText,
    ],
    ["Desenvolvimento", "Impulso a iniciativas com impacto sustentável.", Leaf],
  ]
  return (
    <section className="section work-section">
      <Container>
        <div className="work-layout">
          <div>
            <p className="eyebrow eyebrow--gold">
              Áreas de actuação demonstrativas
            </p>
            <h2>O trabalho do CNC</h2>
            <p>
              Uma plataforma para aproximar, informar e dar visibilidade às
              cooperativas, contribuindo para um ecossistema mais conectado e
              preparado para crescer.
            </p>
            <AppLink to="/institucional" variant="light">
              Conhecer a instituição <ArrowRight size={17} />
            </AppLink>
          </div>
          <div className="work-grid">
            {work.map(([title, body, Icon]) => (
              <article key={String(title)}>
                <Icon size={22} />
                <h3>{String(title)}</h3>
                <p>{String(body)}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

function MainCta() {
  return (
    <section className="main-cta">
      <Container>
        <div>
          <p className="eyebrow eyebrow--gold">Cooperação que gera futuro</p>
          <h2>Faça parte de um movimento que transforma comunidades</h2>
          <p>
            Conheça organizações cooperativas de todo o país e acompanhe o
            desenvolvimento do sector.
          </p>
        </div>
        <div className="button-row">
          <AppLink to="/cooperativas" variant="light">
            Conhecer as cooperativas
          </AppLink>
          <AppLink to="/contactos" variant="secondary">
            Contactar o CNC
          </AppLink>
        </div>
      </Container>
    </section>
  )
}

function PageHero({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <section className="page-hero">
      <Container>
        <p className="eyebrow eyebrow--gold">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{body}</p>
        {children}
      </Container>
    </section>
  )
}

function CooperativesPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState("")
  const [province, setProvince] = useState(params.get("provincia") || "")
  const [activity, setActivity] = useState(params.get("actividade") || "")
  const [view, setView] = useState(
    params.get("view") === "mapa" ? "map" : "grid",
  )
  const filtered = useMemo(
    () =>
      cooperatives.filter(
        (item) =>
          (!query ||
            `${item.name} ${item.activity} ${item.province}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (!province || item.province === province) &&
          (!activity || item.activity === activity),
      ),
    [query, province, activity],
  )
  const clear = () => {
    setQuery("")
    setProvince("")
    setActivity("")
    setParams({})
  }

  return (
    <>
      <PageHero
        eyebrow="Directório nacional"
        title="Cooperativas de Angola"
        body="Explore cooperativas por província, município e área de actividade."
      >
        <DemoBadge />
      </PageHero>
      <section className="directory section">
        <Container>
          <div className="directory-search">
            <Search size={22} />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar por nome, actividade ou localização..."
            />
            <Button>Pesquisar</Button>
          </div>
          <div className="directory-layout">
            <aside className="filter-panel">
              <div className="filter-panel__title">
                <h2>Filtrar resultados</h2>
                <button onClick={clear}>Limpar</button>
              </div>
              <Select
                label="Província"
                options={provinces}
                value={province}
                onChange={setProvince}
              />
              <Select
                label="Município"
                options={[
                  "Caála",
                  "Catete",
                  "Catumbela",
                  "Lubango",
                  "Moçâmedes",
                ]}
              />
              <Select
                label="Área de actividade"
                options={activities.map((item) => item.name)}
                value={activity}
                onChange={setActivity}
              />
              <Select label="Estado" options={["Activa", "Em actualização"]} />
              <Select
                label="Tipo de cooperativa"
                options={["Produção", "Serviços", "Mista"]}
              />
              <Button className="full-width">Aplicar filtros</Button>
            </aside>
            <div className="results-panel">
              <div className="results-toolbar">
                <div>
                  <strong>{filtered.length} cooperativas encontradas</strong>
                  <small>Conteúdo demonstrativo</small>
                </div>
                <div className="view-switch">
                  <button
                    className={view === "grid" ? "active" : ""}
                    onClick={() => setView("grid")}
                  >
                    <Building2 size={17} /> Lista
                  </button>
                  <button
                    className={view === "map" ? "active" : ""}
                    onClick={() => setView("map")}
                  >
                    <Map size={17} /> Mapa
                  </button>
                  <select aria-label="Ordenar resultados">
                    <option>Mais recentes</option>
                    <option>Nome A–Z</option>
                    <option>Província</option>
                    <option>Actividade</option>
                  </select>
                </div>
              </div>
              {filtered.length === 0 ? (
                <EmptyState onClear={clear} />
              ) : view === "map" ? (
                <DirectoryMap />
              ) : (
                <div className="card-grid card-grid--two">
                  {filtered.map((item) => (
                    <CooperativeCard item={item} key={item.slug} />
                  ))}
                </div>
              )}
              {filtered.length > 0 && view === "grid" && (
                <nav className="pagination" aria-label="Paginação">
                  <button disabled>Anterior</button>
                  <button className="active">1</button>
                  <button>2</button>
                  <button>3</button>
                  <button>Seguinte</button>
                </nav>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

function DirectoryMap() {
  return (
    <div className="directory-map">
      <div className="map-sidebar">
        <span>Resultados visíveis</span>
        {cooperatives.slice(0, 4).map((item) => (
          <Link
            key={item.slug}
            to={`/cooperativas/${item.province.toLowerCase()}/${item.slug}`}
          >
            <strong>{item.name}</strong>
            <small>
              {item.province} · {item.activity}
            </small>
          </Link>
        ))}
      </div>
      <div className="map-canvas">
        <svg
          viewBox="0 0 430 500"
          aria-label="Mapa demonstrativo das cooperativas"
        >
          <path
            d="M104 42 L160 60 L194 44 L257 76 L314 70 L336 118 L315 166 L349 204 L332 267 L354 316 L322 372 L333 431 L259 454 L206 438 L153 460 L92 425 L67 367 L81 306 L54 247 L80 191 L64 130 Z"
            fill="currentColor"
          />
          {[...Array(10)].map((_, index) => (
            <circle
              key={index}
              cx={90 + ((index * 53) % 220)}
              cy={90 + ((index * 71) % 310)}
              r={index % 3 === 0 ? 13 : 8}
              className="cluster-dot"
            />
          ))}
        </svg>
        <span className="map-label">Representação visual demonstrativa</span>
      </div>
    </div>
  )
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="empty-state">
      <PackageOpen size={40} />
      <h2>Nenhuma cooperativa encontrada</h2>
      <p>
        Não encontrámos resultados para os filtros seleccionados. Experimente
        ajustar a pesquisa.
      </p>
      <Button onClick={onClear}>Limpar filtros</Button>
    </div>
  )
}

function CooperativeDetailPage() {
  const { slug } = useParams()
  const item =
    cooperatives.find((cooperative) => cooperative.slug === slug) ||
    cooperatives[0]
  return (
    <>
      <section
        className="detail-cover"
        style={{ backgroundImage: `url(${item.image})` }}
      >
        <div className="detail-cover__overlay" />
        <Container>
          <Link to="/cooperativas" className="back-link">
            <ArrowLeft size={17} /> Voltar ao directório
          </Link>
          <div className="detail-title">
            <div className="coop-monogram">{item.name.charAt(0)}</div>
            <div>
              <span className="status status--active">{item.status}</span>
              <h1>{item.name}</h1>
              <p>
                <MapPin size={18} /> {item.municipality}, {item.province}
              </p>
            </div>
          </div>
        </Container>
      </section>
      <section className="section detail-page">
        <Container>
          <DemoBadge />
          <div className="summary-strip">
            {[
              ["Província", item.province],
              ["Município", item.municipality],
              ["Actividade", item.activity],
              ["Ano de constituição", "A disponibilizar"],
              ["Estado", item.status],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="detail-layout">
            <article className="detail-content">
              <section>
                <p className="eyebrow">Perfil da organização</p>
                <h2>Sobre a cooperativa</h2>
                <p>
                  Este é um perfil demonstrativo criado para ilustrar a futura
                  apresentação pública de cada cooperativa. O conteúdo
                  definitivo será validado e actualizado pelo CNC através da
                  futura área de administração.
                </p>
                <p>
                  A página foi preparada para acolher informação institucional,
                  percurso, impacto nas comunidades e principais objectivos da
                  organização.
                </p>
              </section>
              <section>
                <h2>Áreas de actividade</h2>
                <div className="tag-list">
                  <span>{item.activity}</span>
                  <span>Produção local</span>
                  <span>Desenvolvimento comunitário</span>
                </div>
              </section>
              <section>
                <h2>Produtos e serviços</h2>
                <div className="product-grid">
                  {[
                    "Produção e comercialização",
                    "Apoio aos membros",
                    "Ligação aos mercados",
                  ].map((name) => (
                    <article key={name}>
                      <Leaf size={21} />
                      <h3>{name}</h3>
                      <p>Descrição demonstrativa substituível.</p>
                    </article>
                  ))}
                </div>
              </section>
              <section>
                <h2>Galeria</h2>
                <div className="gallery">
                  {[item.image, images.market, images.planting].map(
                    (src, index) => (
                      <button
                        key={src}
                        aria-label={`Abrir imagem ${index + 1}`}
                      >
                        <img src={src} alt="" />
                      </button>
                    ),
                  )}
                </div>
              </section>
            </article>
            <aside className="detail-aside">
              <div className="info-card">
                <h2>Informação institucional</h2>
                {[
                  ["Número de registo", "A disponibilizar"],
                  ["Ano de constituição", "A disponibilizar"],
                  ["Número de membros", "A disponibilizar"],
                  ["Tipo", "Cooperativa de produção"],
                ].map(([label, value]) => (
                  <p key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </p>
                ))}
              </div>
              <div className="info-card">
                <h2>Localização</h2>
                <div className="mini-map">
                  <MapPin size={28} />
                  <span>Mapa da localização</span>
                </div>
                <p>
                  <span>Província</span>
                  <strong>{item.province}</strong>
                </p>
                <p>
                  <span>Município</span>
                  <strong>{item.municipality}</strong>
                </p>
              </div>
              <div className="info-card">
                <h2>Contactos</h2>
                <p>
                  Os contactos serão apresentados quando forem validados pela
                  organização.
                </p>
                <Button variant="secondary" disabled>
                  Contacto indisponível
                </Button>
              </div>
            </aside>
          </div>
        </Container>
      </section>
      <section className="section section--soft">
        <Container>
          <SectionHeading
            title="Cooperativas relacionadas"
            body={`Outras organizações de ${item.province} ou da mesma área.`}
          />
          <div className="card-grid card-grid--three">
            {cooperatives
              .filter((cooperative) => cooperative.slug !== item.slug)
              .slice(0, 3)
              .map((cooperative) => (
                <CooperativeCard key={cooperative.slug} item={cooperative} />
              ))}
          </div>
        </Container>
      </section>
    </>
  )
}

function NewsPage() {
  const [category, setCategory] = useState("Todas")
  const visible =
    category === "Todas"
      ? articles
      : articles.filter((item) => item.category === category)
  return (
    <>
      <PageHero
        eyebrow="Centro de informação"
        title="Actualidade"
        body="Notícias, actividades, eventos e comunicados sobre o movimento cooperativo nacional."
      />
      <section className="section">
        <Container>
          <div className="content-toolbar">
            <div className="tabs">
              {[
                "Todas",
                "Notícias",
                "Actividades",
                "Eventos",
                "Comunicados",
              ].map((tab) => (
                <button
                  className={category === tab ? "active" : ""}
                  key={tab}
                  onClick={() => setCategory(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <label className="small-search">
              <Search size={18} />
              <Input placeholder="Pesquisar actualidade..." />
            </label>
          </div>
          {category === "Todas" && <NewsCard item={articles[0]} featured />}
          <div className="card-grid card-grid--three news-page-grid">
            {visible.slice(category === "Todas" ? 1 : 0).map((item) => (
              <NewsCard item={item} key={item.slug} />
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}

function ArticlePage() {
  const { slug } = useParams()
  const article = articles.find((item) => item.slug === slug) || articles[0]
  return (
    <article className="article-page">
      <Container>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span>/</span>
          <Link to="/actualidade">Actualidade</Link>
          <span>/</span>
          <span>{article.category}</span>
        </nav>
        <header className="article-header">
          <span className="card-kicker">{article.category}</span>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
          <div className="article-meta">
            <span>
              <CalendarDays size={16} /> {article.date}
            </span>
            <span>
              <Landmark size={16} /> Conselho Nacional de Cooperativas
            </span>
          </div>
        </header>
        <figure className="article-image">
          <img
            src={article.image}
            alt="Participantes e produtores num campo agrícola"
          />
          <figcaption>
            Imagem de enquadramento editorial. Fotografia demonstrativa: Richard
            Nyoni / Unsplash.
          </figcaption>
        </figure>
        <div className="article-layout">
          <aside className="share-bar">
            <span>Partilhar</span>
            <button aria-label="Partilhar no Facebook">f</button>
            <button aria-label="Partilhar no WhatsApp">w</button>
            <button aria-label="Partilhar no LinkedIn">in</button>
          </aside>
          <div className="article-body">
            <p className="lead">
              O Conselho Nacional de Cooperativas (CNC) participou na primeira
              edição da Agritech Show Luanda 2026, realizada de 1 a 4 de
              Outubro, na Fazenda da Quiminha, província do Icolo e Bengo, sob o
              lema “Solos Vivos, Agricultura Produtiva”.
            </p>
            <p>
              O CNC esteve representado por uma delegação da instituição, que
              acompanhou o programa da conferência e participou nos diferentes
              momentos de reflexão, intercâmbio e partilha de conhecimentos
              sobre o sector agrícola e o agronegócio.
            </p>
            <h2>Quatro dias de reflexão e intercâmbio</h2>
            <p>
              Ao longo dos quatro dias, foram abordados temas ligados à produção
              agrícola, gestão dos solos, pecuária, tecnologia, financiamento,
              investimento e acesso aos mercados, reunindo empresas, produtores,
              especialistas e representantes de instituições ligadas ao sector.
            </p>
            <blockquote>
              “Solos Vivos, Agricultura Produtiva” — lema da primeira edição da
              Agritech Show Luanda 2026.
            </blockquote>
            <p>
              Esta página editorial está preparada para receber conteúdos
              adicionais, galerias, vídeos, links e documentos relacionados
              quando disponibilizados pela equipa do CNC.
            </p>
            <div className="related-document">
              <Download size={24} />
              <div>
                <strong>Documentos relacionados</strong>
                <span>Nenhum documento disponível neste momento.</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <section className="section section--soft">
        <Container>
          <SectionHeading
            title="Notícias relacionadas"
            body="Continue a acompanhar o movimento cooperativo."
          />
          <div className="card-grid card-grid--three">
            {articles.slice(1).map((item) => (
              <NewsCard item={item} key={item.slug} />
            ))}
          </div>
        </Container>
      </section>
    </article>
  )
}

function InstitutionalPage() {
  return (
    <>
      <PageHero
        eyebrow="Institucional"
        title="Sobre o CNC"
        body="Uma instituição ao serviço da organização, visibilidade e desenvolvimento do movimento cooperativo em Angola."
      />
      <section className="section">
        <Container>
          <div className="institution-intro">
            <div>
              <p className="eyebrow">Quem somos</p>
              <h2>Uma referência para o movimento cooperativo nacional</h2>
            </div>
            <div>
              <p>
                Este espaço foi estruturado para apresentar a identidade,
                história e enquadramento institucional do CNC. Os conteúdos
                oficiais poderão ser inseridos e actualizados posteriormente
                pela equipa responsável.
              </p>
              <p>
                O portal aproxima informação, organizações e cidadãos, criando
                uma visão mais clara sobre a presença e o contributo das
                cooperativas em todo o território.
              </p>
            </div>
          </div>
          <div className="value-grid">
            {[
              [
                "Missão",
                "Texto institucional a validar e disponibilizar pelo CNC.",
                TrendingUp,
              ],
              [
                "Visão",
                "Texto institucional a validar e disponibilizar pelo CNC.",
                Sprout,
              ],
              [
                "Valores",
                "Cooperação, transparência, proximidade e desenvolvimento.",
                ShieldCheck,
              ],
            ].map(([title, body, Icon]) => (
              <article key={String(title)}>
                <Icon size={28} />
                <h3>{String(title)}</h3>
                <p>{String(body)}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section className="leader-message">
        <Container>
          <div className="leader-photo">
            <Users size={48} />
            <span>Fotografia institucional</span>
          </div>
          <div>
            <p className="eyebrow eyebrow--gold">Mensagem institucional</p>
            <h2>
              Cooperar para construir oportunidades e fortalecer comunidades
            </h2>
            <p>
              Espaço reservado para uma mensagem do Presidente ou responsável
              institucional. O nome, cargo, fotografia e assinatura serão
              adicionados após validação.
            </p>
            <div className="signature-line" />
            <strong>Nome e cargo a disponibilizar</strong>
          </div>
        </Container>
      </section>
      <WorkSection />
      <section className="section">
        <Container>
          <SectionHeading
            eyebrow="Organização"
            title="Estrutura institucional"
            body="Área preparada para representar a estrutura do CNC de forma clara e adaptável."
          />
          <div className="structure-tree">
            <div>Órgão principal</div>
            <span />
            <div className="structure-row">
              <div>Área institucional</div>
              <div>Área técnica</div>
              <div>Área de comunicação</div>
            </div>
            <DemoBadge />
          </div>
        </Container>
      </section>
    </>
  )
}

function DocumentsPage() {
  const [search, setSearch] = useState("")
  const visible = documents.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <>
      <PageHero
        eyebrow="Biblioteca documental"
        title="Documentos e publicações"
        body="Encontre legislação, regulamentos, relatórios, manuais, publicações e formulários."
      />
      <section className="section">
        <Container>
          <div className="library-toolbar">
            <label className="search-field">
              <Search size={19} />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar documentos..."
              />
            </label>
            <Select
              label="Categoria"
              options={[
                "Legislação",
                "Regulamentos",
                "Relatórios",
                "Manuais",
                "Publicações",
              ]}
            />
            <Select label="Ano" options={["2026", "2025", "2024"]} />
            <Select label="Tipo" options={["PDF", "DOCX", "XLSX"]} />
          </div>
          <div className="library-count">
            <strong>{visible.length} documentos</strong>
            <DemoBadge />
          </div>
          {visible.length ? (
            <div className="document-list">
              {visible.map((item) => (
                <DocumentCard item={item} key={item.title} />
              ))}
            </div>
          ) : (
            <EmptyState onClear={() => setSearch("")} />
          )}
        </Container>
      </section>
    </>
  )
}

function StatisticsPage() {
  const bars = [58, 78, 46, 86, 64, 72, 54, 82]
  return (
    <>
      <PageHero
        eyebrow="Indicadores públicos"
        title="Cooperativas em números"
        body="Uma leitura visual do movimento cooperativo preparada para dados validados e actualizados."
      >
        <DemoBadge />
      </PageHero>
      <section className="section statistics-page">
        <Container>
          <div className="stat-grid">
            {[
              ["—", "Total de cooperativas", Building2],
              ["21", "Províncias", MapPin],
              ["10", "Sectores representados", Activity],
              ["—", "Membros cooperados", Users],
            ].map(([value, label, Icon]) => (
              <article className="stat-card" key={String(label)}>
                <Icon size={22} />
                <strong>{String(value)}</strong>
                <span>{String(label)}</span>
              </article>
            ))}
          </div>
          <div className="chart-grid">
            <article className="chart-card chart-card--wide">
              <div className="chart-heading">
                <div>
                  <span>Distribuição territorial</span>
                  <h2>Cooperativas por província</h2>
                </div>
                <DemoBadge />
              </div>
              <div className="bar-chart">
                {bars.map((height, index) => (
                  <div key={index}>
                    <span style={{ height: `${height}%` }} />
                    <small>
                      {
                        [
                          "LDA",
                          "BGU",
                          "HBO",
                          "HLA",
                          "UÍG",
                          "MAL",
                          "BGO",
                          "NAM",
                        ][index]
                      }
                    </small>
                  </div>
                ))}
              </div>
            </article>
            <article className="chart-card">
              <div className="chart-heading">
                <div>
                  <span>Distribuição</span>
                  <h2>Por actividade</h2>
                </div>
              </div>
              <div className="donut">
                <div>
                  <strong>10</strong>
                  <span>áreas</span>
                </div>
              </div>
              <div className="legend">
                <span>Agricultura</span>
                <span>Serviços</span>
                <span>Comércio</span>
              </div>
            </article>
            <article className="chart-card chart-card--wide">
              <div className="chart-heading">
                <div>
                  <span>Evolução anual</span>
                  <h2>Crescimento do directório</h2>
                </div>
              </div>
              <div className="line-chart">
                <svg viewBox="0 0 700 220" preserveAspectRatio="none">
                  <path d="M20 190 C110 160, 130 170, 210 125 S330 135, 400 84 S540 110, 680 30" />
                  <path
                    className="line-fill"
                    d="M20 190 C110 160, 130 170, 210 125 S330 135, 400 84 S540 110, 680 30 L680 215 L20 215 Z"
                  />
                </svg>
              </div>
            </article>
            <article className="chart-card map-stat">
              <div className="chart-heading">
                <div>
                  <span>Mapa nacional</span>
                  <h2>Cobertura geográfica</h2>
                </div>
              </div>
              <Map size={110} strokeWidth={0.7} />
              <p>Mapa coroplético preparado para dados oficiais.</p>
            </article>
          </div>
          <div className="data-note">
            <AlertCircle size={21} />
            <div>
              <strong>Sobre estes dados</strong>
              <p>
                Todos os indicadores desta proposta são demonstrativos. O portal
                será preparado para receber dados validados através do futuro
                sistema administrativo.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

function ContactPage() {
  const [sent, setSent] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSent(true)
  }
  return (
    <>
      <PageHero
        eyebrow="Fale connosco"
        title="Entre em contacto com o CNC"
        body="Envie a sua mensagem. A equipa responsável responderá assim que possível."
      />
      <section className="section contact-page">
        <Container>
          <div className="contact-layout">
            <form onSubmit={submit} className="contact-form">
              {sent && (
                <div className="success-message" role="status">
                  <Check size={21} />
                  <div>
                    <strong>Mensagem enviada com sucesso.</strong>
                    <span>Obrigado pelo seu contacto.</span>
                  </div>
                </div>
              )}
              <div className="form-row">
                <label>
                  <span>Nome</span>
                  <Input required placeholder="O seu nome" />
                </label>
                <label>
                  <span>Email</span>
                  <Input required type="email" placeholder="nome@exemplo.ao" />
                </label>
              </div>
              <div className="form-row">
                <label>
                  <span>Telefone</span>
                  <Input type="tel" placeholder="+244" />
                </label>
                <label>
                  <span>Assunto</span>
                  <select required>
                    <option>Informação geral</option>
                    <option>Cooperativas</option>
                    <option>Documentos</option>
                    <option>Imprensa</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Mensagem</span>
                <textarea
                  required
                  rows={7}
                  placeholder="Como podemos ajudar?"
                />
              </label>
              <Button type="submit">
                Enviar mensagem <ArrowRight size={17} />
              </Button>
            </form>
            <aside className="contact-info">
              <p className="eyebrow eyebrow--gold">Informação institucional</p>
              <h2>Estamos disponíveis para ajudar</h2>
              <p>
                Os dados de contacto definitivos serão publicados após validação
                institucional.
              </p>
              {[
                ["Telefone", "A disponibilizar", MessageSquareText],
                ["Email", "A disponibilizar", Share2],
                ["Endereço", "A disponibilizar", MapPin],
                ["Horário", "A disponibilizar", CalendarDays],
              ].map(([label, value, Icon]) => (
                <div className="contact-line" key={String(label)}>
                  <Icon size={20} />
                  <div>
                    <span>{String(label)}</span>
                    <strong>{String(value)}</strong>
                  </div>
                </div>
              ))}
              <div className="contact-map">
                <MapPin size={28} />
                <span>Localização a disponibilizar</span>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  )
}

function SearchResultsPage() {
  const [params] = useSearchParams()
  const query = params.get("q") || ""
  return (
    <>
      <PageHero
        eyebrow="Pesquisa global"
        title={`Resultados para “${query || "todos os conteúdos"}”`}
        body="Resultados agrupados por cooperativas, actualidade e documentos."
      />
      <section className="section">
        <Container className="search-results">
          <div className="directory-search">
            <Search size={22} />
            <Input defaultValue={query} placeholder="Pesquisar..." />
            <Button>Pesquisar</Button>
          </div>
          <section>
            <div className="search-category">
              <h2>Cooperativas</h2>
              <span>{cooperatives.length} resultados</span>
            </div>
            {cooperatives.slice(0, 3).map((item) => (
              <Link
                key={item.slug}
                to={`/cooperativas/${item.province.toLowerCase()}/${item.slug}`}
              >
                <Building2 size={20} />
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.province} · {item.activity}
                  </span>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </section>
          <section>
            <div className="search-category">
              <h2>Actualidade</h2>
              <span>{articles.length} resultados</span>
            </div>
            {articles.slice(0, 3).map((item) => (
              <Link key={item.slug} to={`/actualidade/noticias/${item.slug}`}>
                <CalendarDays size={20} />
                <div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.category} · {item.date}
                  </span>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </section>
        </Container>
      </section>
    </>
  )
}

function StatePage({
  type,
}: {
  type: "loading" | "error" | "success" | "empty"
}) {
  const config = {
    loading: [
      "A carregar conteúdo",
      "Estamos a preparar a informação solicitada.",
      Activity,
    ],
    error: [
      "Não foi possível carregar",
      "Ocorreu um erro. Por favor, tente novamente.",
      AlertCircle,
    ],
    success: [
      "Operação concluída",
      "A sua acção foi concluída com sucesso.",
      Check,
    ],
    empty: [
      "Ainda não há conteúdo",
      "Esta área está preparada para receber informação.",
      PackageOpen,
    ],
  } as const
  const [title, body, Icon] = config[type]
  return (
    <section className="state-page">
      <div
        className={
          type === "loading" ? "state-icon state-icon--loading" : "state-icon"
        }
      >
        <Icon size={38} />
      </div>
      <h1>{title}</h1>
      <p>{body}</p>
      {type !== "loading" && <AppLink to="/">Voltar ao início</AppLink>}
    </section>
  )
}

function NotFound() {
  return (
    <section className="state-page">
      <strong className="error-code">404</strong>
      <h1>Página não encontrada</h1>
      <p>
        O endereço que procura pode ter sido movido ou já não estar disponível.
      </p>
      <AppLink to="/">Voltar ao início</AppLink>
    </section>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "cooperativas", Component: CooperativesPage },
      { path: "cooperativas/:provincia", Component: CooperativesPage },
      {
        path: "cooperativas/:provincia/:slug",
        Component: CooperativeDetailPage,
      },
      { path: "actualidade", Component: NewsPage },
      { path: "actualidade/noticias/:slug", Component: ArticlePage },
      { path: "institucional", Component: InstitutionalPage },
      { path: "documentos", Component: DocumentsPage },
      { path: "estatisticas", Component: StatisticsPage },
      { path: "contactos", Component: ContactPage },
      { path: "pesquisa", Component: SearchResultsPage },
      { path: "estado/carregamento", element: <StatePage type="loading" /> },
      { path: "estado/erro", element: <StatePage type="error" /> },
      { path: "estado/sucesso", element: <StatePage type="success" /> },
      { path: "estado/vazio", element: <StatePage type="empty" /> },
      { path: "*", Component: NotFound },
    ],
  },
])
