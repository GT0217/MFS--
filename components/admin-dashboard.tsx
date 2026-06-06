import type { Ranking, Insight } from "@/lib/db"
import {
  addRanking,
  updateRanking,
  deleteRanking,
  addInsight,
  deleteInsight,
  logout,
} from "@/app/actions"

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"

export function AdminDashboard({
  rankings,
  insights,
}: {
  rankings: Ranking[]
  insights: Insight[]
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Add ranking */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">랭킹 추가</h2>
        <form action={addRanking} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input name="name" placeholder="이름" required className={inputClass} />
            <input
              name="category"
              placeholder="카테고리 (예: 종합)"
              defaultValue="종합"
              className={inputClass}
            />
            <input
              name="score"
              type="number"
              placeholder="점수"
              defaultValue={0}
              className={inputClass}
            />
          </div>
          <input name="note" placeholder="메모 (선택)" className={inputClass} />
          <button
            type="submit"
            className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            추가
          </button>
        </form>
      </section>

      {/* Manage rankings */}
      <section>
        <h2 className="mb-4 text-lg font-bold">랭킹 관리 ({rankings.length})</h2>
        <div className="flex flex-col gap-3">
          {rankings.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <form
                action={updateRanking}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <input type="hidden" name="id" value={r.id} />
                <input
                  name="name"
                  defaultValue={r.name}
                  className={`${inputClass} flex-1`}
                />
                <input
                  name="score"
                  type="number"
                  defaultValue={r.score}
                  className={`${inputClass} w-full sm:w-24`}
                />
                <input
                  name="note"
                  defaultValue={r.note ?? ""}
                  placeholder="메모"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="submit"
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  저장
                </button>
              </form>
              <form action={deleteRanking} className="mt-2">
                <input type="hidden" name="id" value={r.id} />
                <button
                  type="submit"
                  className="text-xs font-medium text-red-500 hover:text-red-600"
                >
                  삭제
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* Add insight */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">인사이트 추가</h2>
        <form action={addInsight} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input name="title" placeholder="제목" required className={inputClass} />
            <input name="tag" placeholder="태그 (선택)" className={inputClass} />
          </div>
          <textarea
            name="body"
            placeholder="내용"
            required
            rows={3}
            className={inputClass}
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            추가
          </button>
        </form>
      </section>

      {/* Manage insights */}
      <section>
        <h2 className="mb-4 text-lg font-bold">인사이트 관리 ({insights.length})</h2>
        <div className="flex flex-col gap-3">
          {insights.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
              <form action={deleteInsight}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="shrink-0 text-xs font-medium text-red-500 hover:text-red-600"
                >
                  삭제
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <form action={logout}>
        <button
          type="submit"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          로그아웃
        </button>
      </form>
    </div>
  )
}
