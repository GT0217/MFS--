export default function HomeLoading() {
  return (
    <div className="pb-2" aria-busy="true" aria-label="홈 화면을 불러오는 중">
      {/* Hero skeleton - 실제 히어로와 동일한 그라데이션으로 깜빡임 방지 */}
      <header
        className="relative overflow-hidden px-5 pb-12 pt-14 text-white"
        style={{ background: "linear-gradient(135deg, #0b7a33 0%, #0f9a42 50%, #14bb51 100%)" }}
      >
        <div className="relative">
          <div className="h-6 w-40 rounded-full bg-white/20" />
          <div className="mt-4 space-y-2.5">
            <div className="h-6 w-56 rounded bg-white/25" />
            <div className="h-6 w-44 rounded bg-white/25" />
          </div>
          <div className="mt-3 h-4 w-52 rounded bg-white/15" />
        </div>
      </header>

      {/* Top 3 skeleton */}
      <section className="-mt-6 rounded-t-[28px] bg-background px-5 pt-7">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
        <div className="-mx-5 mt-4 flex gap-3 overflow-hidden px-5 pb-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-[196px] w-60 shrink-0 rounded-[24px] bg-muted" />
          ))}
        </div>
      </section>

      {/* CTA skeleton */}
      <section className="px-5 pt-6">
        <div className="h-[76px] w-full rounded-[20px] bg-muted" />
      </section>

      {/* Club intro skeleton */}
      <section className="px-5 pt-7">
        <div className="overflow-hidden rounded-[24px] bg-card shadow-sm ring-1 ring-border">
          <div className="aspect-[16/10] w-full bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-48 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
      </section>
    </div>
  )
}
