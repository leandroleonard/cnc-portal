import { Activity, BarChart3 } from 'lucide-react';
import type { StatisticBreakdownItem } from '@/types/domain';

function ChartEmpty({ label }: { label: string }) {
  return <div className="chart-empty" role="status"><Activity size={22} /><span>{label}</span></div>;
}

export function BarChart({ title, subtitle, items, emptyLabel }: { title: string; subtitle?: string; items: StatisticBreakdownItem[]; emptyLabel: string }) {
  const max = Math.max(0, ...items.map((item) => item.value));
  return <article className="chart-card chart-card--wide">
    <div className="chart-heading"><div><span>{subtitle ?? title}</span><h2>{title}</h2></div><BarChart3 size={20} aria-hidden="true" /></div>
    {items.length === 0 ? <ChartEmpty label={emptyLabel} /> : <div className="bar-chart" role="img" aria-label={title}>
      {items.map((item) => <div key={item.id} title={`${item.label}: ${item.value}`}><span style={{ height: `${max > 0 ? Math.max(4, (item.value / max) * 100) : 4}%` }} /><small>{item.label}</small><span className="sr-only">{item.value}</span></div>)}
    </div>}
  </article>;
}

export function HorizontalBreakdown({ title, items, emptyLabel }: { title: string; items: StatisticBreakdownItem[]; emptyLabel: string }) {
  const max = Math.max(0, ...items.map((item) => item.value));
  return <article className="chart-card">
    <div className="chart-heading"><div><span>{title}</span><h2>{title}</h2></div></div>
    {items.length === 0 ? <ChartEmpty label={emptyLabel} /> : <ul className="breakdown-list">{items.map((item) => <li key={item.id} title={`${item.label}: ${item.value}`}><div className="breakdown-list__label"><span>{item.label}</span><strong>{new Intl.NumberFormat().format(item.value)}</strong></div><span className="breakdown-track"><span style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%` }} /></span></li>)}</ul>}
  </article>;
}

export function TrendChart({ title, items, emptyLabel }: { title: string; items: Array<{ period: string; value: number }>; emptyLabel: string }) {
  if (items.length === 0) return <article className="chart-card chart-card--wide"><div className="chart-heading"><div><span>{title}</span><h2>{title}</h2></div></div><ChartEmpty label={emptyLabel} /></article>;
  const max = Math.max(1, ...items.map((item) => item.value));
  const width = 700;
  const height = 220;
  const padding = 18;
  const points = items.map((item, index) => {
    const x = items.length === 1 ? width / 2 : padding + (index / (items.length - 1)) * (width - padding * 2);
    const y = height - padding - (item.value / max) * (height - padding * 2);
    return { x, y, item };
  });
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const area = `${line} L ${points.at(-1)?.x ?? 0} ${height - padding} L ${points[0]?.x ?? 0} ${height - padding} Z`;
  return <article className="chart-card chart-card--wide"><div className="chart-heading"><div><span>{title}</span><h2>{title}</h2></div></div><div className="line-chart"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} preserveAspectRatio="none"><title>{title}</title><path className="line-fill" d={area} /><path d={line} />{points.map(({ x, y, item }) => <g key={item.period}><circle cx={x} cy={y} r="4" /><title>{item.period}: {item.value}</title></g>)}</svg></div><div className="trend-labels">{items.map((item) => <span key={item.period}>{item.period}</span>)}</div></article>;
}
