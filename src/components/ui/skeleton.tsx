export function CardSkeleton({ count = 3 }: { count?: number }) {
  return <div className="card-grid card-grid--three" aria-label="A carregar">
    {Array.from({ length: count }, (_, index) => <div className="card-skeleton" key={index}><span /><span /><span /></div>)}
  </div>;
}

export function PageSkeleton() {
  return <div className="page-skeleton" aria-busy="true" aria-label="A carregar página"><span /><span /><span /></div>;
}
