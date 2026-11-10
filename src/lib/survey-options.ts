/** Opções da Ficha Nacional CNC (espelham backend/app/Support/SurveyOptions.php). */
export type Option = { value: string; pt: string; en: string };
const o = (value: string, pt: string, en: string): Option => ({ value, pt, en });

export const MULTI = {
  sectors: [
    o('agricultura', 'Agricultura', 'Agriculture'), o('pecuaria', 'Pecuária', 'Livestock'),
    o('pescas_aquicultura', 'Pescas e aquicultura', 'Fisheries & aquaculture'), o('turismo_rural', 'Turismo rural', 'Rural tourism'),
    o('comercio', 'Comércio', 'Trade'), o('industria', 'Indústria', 'Industry'), o('servicos', 'Serviços', 'Services'),
    o('reciclagem_economia_circular', 'Reciclagem / economia circular', 'Recycling / circular economy'),
    o('artesanato', 'Artesanato', 'Handicraft'), o('outro', 'Outro', 'Other'),
  ],
  location_types: [
    o('campo_fazenda', 'Campo / fazenda', 'Field / farm'), o('mar_rio_lago', 'Mar / rio / lago', 'Sea / river / lake'),
    o('mercado', 'Mercado', 'Market'), o('empresa', 'Empresa', 'Company'), o('residencia', 'Residência', 'Residence'),
    o('rua', 'Rua', 'Street'), o('oficina_unidade_produtiva', 'Oficina / unidade produtiva', 'Workshop / production unit'),
    o('ecoponto', 'Ecoponto', 'Recycling point'), o('aterro_lixeira', 'Aterro / lixeira', 'Landfill / dump'),
    o('escola', 'Escola', 'School'), o('outro', 'Outro', 'Other'),
  ],
  recycling_materials: [
    o('papel', 'Papel', 'Paper'), o('cartao', 'Cartão', 'Cardboard'), o('plastico_pet', 'Plástico / PET', 'Plastic / PET'),
    o('vidro', 'Vidro', 'Glass'), o('aluminio', 'Alumínio', 'Aluminium'), o('metais_cobre', 'Metais / cobre', 'Metals / copper'),
    o('cabos', 'Cabos', 'Cables'), o('sucata', 'Sucata', 'Scrap'), o('electronicos', 'Electrónicos', 'Electronics'),
    o('electrodomesticos', 'Electrodomésticos', 'Appliances'), o('oleo', 'Óleo', 'Oil'), o('pneus', 'Pneus', 'Tyres'),
    o('madeira', 'Madeira', 'Wood'), o('texteis', 'Têxteis', 'Textiles'), o('outro', 'Outro', 'Other'),
  ],
  sales_channels: [
    o('intermediario', 'Intermediário', 'Middleman'), o('sucateiro', 'Sucateiro', 'Scrap dealer'),
    o('cooperativa', 'Cooperativa', 'Cooperative'), o('reciclador', 'Reciclador', 'Recycler'), o('empresa', 'Empresa', 'Company'),
    o('consumidor_final', 'Consumidor final', 'End consumer'), o('outro', 'Outro', 'Other'),
  ],
  transport_means: [
    o('cabeca', 'À cabeça', 'On the head'), o('carrinho', 'Carrinho', 'Cart'), o('carroca', 'Carroça', 'Wagon'),
    o('triciclo', 'Triciclo', 'Tricycle'), o('viatura', 'Viatura', 'Vehicle'), o('embarcacao', 'Embarcação', 'Boat'),
    o('outro', 'Outro', 'Other'),
  ],
  safety_equipment: [
    o('luvas', 'Luvas', 'Gloves'), o('botas', 'Botas', 'Boots'), o('mascara', 'Máscara', 'Mask'), o('colete', 'Colete', 'Vest'),
    o('oculos', 'Óculos', 'Goggles'), o('capacete', 'Capacete', 'Helmet'), o('fardamento', 'Fardamento', 'Uniform'),
    o('nenhum', 'Nenhum', 'None'),
  ],
  work_risks: [
    o('cortes', 'Cortes', 'Cuts'), o('vidros', 'Vidros', 'Glass'), o('contaminados', 'Materiais contaminados', 'Contaminated materials'),
    o('quimicos', 'Químicos', 'Chemicals'), o('transito', 'Trânsito', 'Traffic'), o('animais', 'Animais', 'Animals'),
    o('agressoes', 'Agressões', 'Assaults'), o('doencas', 'Doenças', 'Diseases'), o('outro', 'Outro', 'Other'),
  ],
  priority_needs: [
    o('documentacao', 'Documentação', 'Documents'), o('epi', 'EPI', 'PPE'), o('carrinho_triciclo', 'Carrinho / triciclo', 'Cart / tricycle'),
    o('armazenamento', 'Armazenamento', 'Storage'), o('formacao', 'Formação', 'Training'), o('financiamento', 'Financiamento', 'Funding'),
    o('mercado', 'Mercado', 'Market'), o('transporte', 'Transporte', 'Transport'), o('agua', 'Água', 'Water'),
    o('sanitarios', 'Sanitários', 'Sanitation'), o('assistencia_social', 'Assistência social', 'Social assistance'),
    o('habitacao', 'Habitação', 'Housing'), o('educacao', 'Educação', 'Education'), o('saude', 'Saúde', 'Health'),
    o('cooperativa', 'Cooperativa', 'Cooperative'), o('apoio_juridico', 'Apoio jurídico', 'Legal support'), o('outra', 'Outra', 'Other'),
  ],
} satisfies Record<string, Option[]>;

export type MultiField = keyof typeof MULTI;

export const ENUMS = {
  operator_gender: [o('M', 'Masculino', 'Male'), o('F', 'Feminino', 'Female'), o('nao_declarar', 'Prefere não declarar', 'Prefer not to say')],
  bi_status: [o('sim', 'Sim', 'Yes'), o('nao', 'Não', 'No'), o('em_processo', 'Em processo', 'In progress')],
  marital_status: [
    o('solteiro', 'Solteiro(a)', 'Single'), o('casado', 'Casado(a)', 'Married'), o('uniao_facto', 'União de facto', 'Civil union'),
    o('divorciado', 'Divorciado(a)', 'Divorced'), o('viuvo', 'Viúvo(a)', 'Widowed'),
  ],
  is_main_provider: [o('sim', 'Sim', 'Yes'), o('nao', 'Não', 'No'), o('partilhado', 'Partilhado', 'Shared')],
  activity_experience_years: [
    o('<1', 'Menos de 1 ano', '< 1 year'), o('1-3', '1 a 3 anos', '1–3 years'), o('4-6', '4 a 6 anos', '4–6 years'),
    o('7-10', '7 a 10 anos', '7–10 years'), o('>10', 'Mais de 10 anos', '> 10 years'),
  ],
  activity_frequency: [
    o('diaria', 'Diária', 'Daily'), o('5-6_dias', '5–6 dias/semana', '5–6 days/week'), o('3-4_dias', '3–4 dias/semana', '3–4 days/week'),
    o('1-2_dias', '1–2 dias/semana', '1–2 days/week'), o('esporadica', 'Esporádica', 'Occasional'),
  ],
  production_period: [o('dia', 'Por dia', 'Per day'), o('semana', 'Por semana', 'Per week'), o('mes', 'Por mês', 'Per month')],
  monthly_income_range: [
    o('<25000', 'Menos de 25 000 Kz', '< 25,000 Kz'), o('25000-50000', '25 000 – 50 000 Kz', '25,000–50,000 Kz'),
    o('50000-100000', '50 000 – 100 000 Kz', '50,000–100,000 Kz'), o('100000-200000', '100 000 – 200 000 Kz', '100,000–200,000 Kz'),
    o('>200000', 'Mais de 200 000 Kz', '> 200,000 Kz'), o('nao_declara', 'Não declara', 'Not declared'),
  ],
  organization_type: [
    o('individual', 'Individual', 'Individual'), o('grupo', 'Grupo informal', 'Informal group'), o('associacao', 'Associação', 'Association'),
    o('cooperativa', 'Cooperativa', 'Cooperative'), o('empresa', 'Empresa', 'Company'),
  ],
  operator_signature_type: [
    o('nome_escrito', 'Nome escrito', 'Written name'), o('impressao_digital', 'Impressão digital', 'Fingerprint'),
    o('assinatura_digital', 'Assinatura digital', 'Digital signature'),
  ],
} satisfies Record<string, Option[]>;

export const label = (opts: Option[], value: unknown, locale = 'pt') =>
  opts.find((x) => x.value === value)?.[locale === 'en' ? 'en' : 'pt'] ?? (value == null || value === '' ? '—' : String(value));