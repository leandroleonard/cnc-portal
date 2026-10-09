export const heroImage =
  "https://images.unsplash.com/photo-1746014929708-fcb859fd3185?auto=format&fit=crop&w=2000&q=88"

export const images = {
  field:
    "https://images.unsplash.com/photo-1741874299706-2b8e16839aaa?auto=format&fit=crop&w=1200&q=82",
  planting:
    "https://images.unsplash.com/photo-1509099381441-ea3c0cf98b94?auto=format&fit=crop&w=1200&q=82",
  market:
    "https://images.unsplash.com/photo-1734255026082-82fdc81991f0?auto=format&fit=crop&w=1200&q=82",
  work: "https://images.unsplash.com/photo-1607240204413-e51a4afa6f12?auto=format&fit=crop&w=1200&q=82",
  harvest:
    "https://images.unsplash.com/photo-1746014929708-fcb859fd3185?auto=format&fit=crop&w=1200&q=82",
}

export const provinces = [
  "Bengo",
  "Benguela",
  "Bié",
  "Cabinda",
  "Cubango",
  "Cuando",
  "Cuanza Norte",
  "Cuanza Sul",
  "Cunene",
  "Huambo",
  "Huíla",
  "Icolo e Bengo",
  "Luanda",
  "Lunda Norte",
  "Lunda Sul",
  "Malanje",
  "Moxico",
  "Moxico Leste",
  "Namibe",
  "Uíge",
  "Zaire",
]

export const cooperatives = [
  {
    slug: "cooperativa-agropecuaria-esperanca",
    name: "Cooperativa Agropecuária Esperança",
    province: "Huambo",
    municipality: "Caála",
    activity: "Agricultura",
    status: "Activa",
    image: images.harvest,
    description:
      "Organização demonstrativa dedicada à produção agrícola e ao desenvolvimento das comunidades locais.",
  },
  {
    slug: "uniao-produtiva-do-kikuxi",
    name: "União Produtiva do Kikuxi",
    province: "Icolo e Bengo",
    municipality: "Catete",
    activity: "Agropecuária",
    status: "Activa",
    image: images.field,
    description:
      "Exemplo de cooperativa orientada para cadeias de valor agrícolas e acesso sustentável aos mercados.",
  },
  {
    slug: "cooperativa-maos-da-terra",
    name: "Cooperativa Mãos da Terra",
    province: "Benguela",
    municipality: "Catumbela",
    activity: "Artesanato",
    status: "Activa",
    image: images.market,
    description:
      "Projecto demonstrativo que reúne produtores e artesãos numa rede de colaboração comunitária.",
  },
  {
    slug: "pescadores-do-atlantico",
    name: "Pescadores do Atlântico",
    province: "Namibe",
    municipality: "Moçâmedes",
    activity: "Pesca",
    status: "Em actualização",
    image: images.work,
    description:
      "Perfil de exemplo para uma organização cooperativa ligada à pesca e transformação local.",
  },
  {
    slug: "cooperativa-planalto-verde",
    name: "Cooperativa Planalto Verde",
    province: "Huíla",
    municipality: "Lubango",
    activity: "Pecuária",
    status: "Activa",
    image: images.planting,
    description:
      "Cooperativa demonstrativa com foco na produção, formação e criação de oportunidades no planalto.",
  },
  {
    slug: "rede-produtiva-do-uige",
    name: "Rede Produtiva do Uíge",
    province: "Uíge",
    municipality: "Uíge",
    activity: "Comércio",
    status: "Activa",
    image: images.market,
    description:
      "Exemplo de rede cooperativa que aproxima produtores, mercados e serviços de apoio.",
  },
]

export const articles = [
  {
    slug: "cnc-participa-na-agritech-show-luanda-2026",
    category: "Notícias",
    date: "06 Out 2026",
    title: "CNC participa na Agritech Show Luanda 2026",
    summary:
      "O CNC participou na primeira edição da Agritech Show Luanda 2026, realizada na Fazenda da Quiminha, sob o lema “Solos Vivos, Agricultura Produtiva”.",
    image: images.harvest,
  },
  {
    slug: "encontro-sobre-cadeias-de-valor",
    category: "Actividades",
    date: "28 Set 2026",
    title: "Diálogo nacional sobre cadeias de valor cooperativas",
    summary:
      "Conteúdo demonstrativo sobre um encontro de partilha entre organizações, produtores e parceiros.",
    image: images.market,
  },
  {
    slug: "forum-cooperativo-regional",
    category: "Eventos",
    date: "15 Nov 2026",
    title: "Fórum Cooperativo Regional",
    summary:
      "Evento demonstrativo dedicado à inovação, produção e desenvolvimento económico local.",
    image: images.field,
  },
  {
    slug: "actualizacao-do-directorio",
    category: "Comunicados",
    date: "19 Set 2026",
    title: "Actualização de dados do directório nacional",
    summary:
      "Informação demonstrativa sobre o processo de recolha e validação de dados das cooperativas.",
    image: images.work,
  },
]

export const documents = [
  {
    title: "Guia de organização cooperativa",
    category: "Manuais",
    date: "Setembro 2026",
    type: "PDF",
    size: "2,4 MB",
  },
  {
    title: "Boletim do movimento cooperativo",
    category: "Publicações",
    date: "Agosto 2026",
    type: "PDF",
    size: "4,8 MB",
  },
  {
    title: "Modelo de ficha de actualização",
    category: "Formulários",
    date: "Julho 2026",
    type: "DOCX",
    size: "680 KB",
  },
  {
    title: "Relatório síntese — dados demonstrativos",
    category: "Relatórios",
    date: "Junho 2026",
    type: "PDF",
    size: "3,1 MB",
  },
]
