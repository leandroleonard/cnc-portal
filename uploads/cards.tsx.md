import { CalendarDays, Download, MapPin } from "lucide-react"
import { Link } from "react-router"
import type { articles, cooperatives, documents } from "../app/data"
import { TextLink } from "./ui"

type Cooperative = typeof cooperatives[number]
type Article = typeof articles[number]
type Document = typeof documents[number]

export function CooperativeCard({ item }: { item: Cooperative }) {
  return (
    <article className="coop-card">
      <Link
        to={`/cooperativas/${item.province.toLowerCase()}/${item.slug}`}
        className="card-image"
      >
        <img src={item.image} alt="" />
        <span
          className={
            item.status === "Activa" ? "status status--active" : "status"
          }
        >
          {item.status}
        </span>
      </Link>
      <div className="coop-card__body">
        <span className="card-kicker">{item.activity}</span>
        <h3>{item.name}</h3>
        <p className="meta">
          <MapPin size={15} /> {item.municipality}, {item.province}
        </p>
        <p>{item.description}</p>
        <TextLink
          to={`/cooperativas/${item.province.toLowerCase()}/${item.slug}`}
        >
          Ver perfil
        </TextLink>
      </div>
    </article>
  )
}

export function NewsCard({
  item,
  featured = false,
}: {
  item: Article
  featured?: boolean
}) {
  return (
    <article className={`news-card ${featured ? "news-card--featured" : ""}`}>
      <Link to={`/actualidade/noticias/${item.slug}`} className="card-image">
        <img src={item.image} alt="" />
      </Link>
      <div className="news-card__body">
        <div className="news-meta">
          <span>{item.category}</span>
          <span>
            <CalendarDays size={14} /> {item.date}
          </span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <TextLink to={`/actualidade/noticias/${item.slug}`}>
          Ler notícia
        </TextLink>
      </div>
    </article>
  )
}

export function DocumentCard({ item }: { item: Document }) {
  return (
    <article className="document-card">
      <div className="document-icon">{item.type}</div>
      <div>
        <span className="card-kicker">{item.category}</span>
        <h3>{item.title}</h3>
        <p>
          {item.date} · {item.type} · {item.size}
        </p>
      </div>
      <button aria-label={`Descarregar ${item.title}`}>
        <Download size={20} />
        <span>Descarregar</span>
      </button>
    </article>
  )
}
