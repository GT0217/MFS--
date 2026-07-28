"use client"

import { useState, useEffect, useActionState } from "react"
import Image from "next/image"
import { CheckCircle, XCircle } from "lucide-react"
import { CRITERIA, INSIGHT_CATEGORIES, type AppWithScore, type Insight, type SiteSettings } from "@/lib/types"
import { saveApp, deleteApp, saveInsight, deleteInsight, saveSiteSettings, type SaveState } from "@/app/actions"
import { RichTextEditor } from "@/components/rich-text-editor"
import "react-quill-new/dist/quill.snow.css"

const input =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"

/** 저장 성공/실패 알림 토스트 */
function SaveToast({ state }: { state: SaveState }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!state) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2500)
    return () => clearTimeout(t)
  }, [state])

  if (!visible || !state) return null

  return (
    <div
      className={`fixed bottom-28 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition-all ${
        state.ok
          ? "bg-primary text-primary-foreground"
          : "bg-red-500 text-white"
      }`}
      role="status"
      aria-live="polite"
    >
      {state.ok ? (
        <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {state.message}
    </div>
  )
}
const label = "text-xs font-semibold text-muted-foreground"

export function AdminDashboard({
  apps,
  insights,
  siteSettings,
}: {
  apps: AppWithScore[]
  insights: Insight[]
  siteSettings: SiteSettings
}) {
  const [tab, setTab] = useState<"apps" | "insights" | "home">("apps")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
          <button
            onClick={() => setTab("apps")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              tab === "apps" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            앱 / 랭킹 ({apps.length})
          </button>
          <button
            onClick={() => setTab("insights")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              tab === "insights" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            인사이트 ({insights.length})
          </button>
          <button
            onClick={() => setTab("home")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              tab === "home" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            홈 화면
          </button>
        </div>
      </div>

      {tab === "apps" ? (
        <div className="flex flex-col gap-4">
          <Collapsible title="새 앱 추가" accent>
            <AppForm />
          </Collapsible>
          {apps.map((app) => (
            <Collapsible
              key={app.id}
              title={`${app.name} · ${app.overall.toFixed(1)}점`}
              subtitle={app.category}
            >
              <AppForm app={app} />
            </Collapsible>
          ))}
        </div>
      ) : tab === "insights" ? (
        <div className="flex flex-col gap-4">
          <Collapsible title="새 인사이트 추가" accent>
            <InsightForm />
          </Collapsible>
          {insights.map((it) => (
            <Collapsible key={it.id} title={it.title} subtitle={it.type}>
              <InsightForm insight={it} />
            </Collapsible>
          ))}
        </div>
      ) : (
        <HomeSettingsForm settings={siteSettings} />
      )}
    </div>
  )
}

function Collapsible({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string
  subtitle?: string
  accent?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(Boolean(accent))
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-card shadow-sm ${
        accent ? "border-primary/40" : "border-border"
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex flex-col">
          <span className={`font-bold ${accent ? "text-primary" : ""}`}>{title}</span>
          {subtitle ? (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          ) : null}
        </span>
        <span className="text-muted-foreground">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="border-t border-border px-5 py-5">{children}</div> : null}
    </div>
  )
}

function Field({ children, htmlFor, text }: { children: React.ReactNode; htmlFor?: string; text: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={label}>
        {text}
      </label>
      {children}
    </div>
  )
}

function ImagePicker({ name, current, text }: { name: string; current?: string | null; text: string }) {
  const [preview, setPreview] = useState<string | null>(current ?? null)
  return (
    <Field text={text}>
      <div className="flex items-center gap-3">
        {preview ? (
          <Image
            src={preview || "/placeholder.svg"}
            alt="미리보기"
            width={56}
            height={56}
            className="h-14 w-14 rounded-xl border border-border object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
            없음
          </div>
        )}
        <input
          type="file"
          name={name}
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0]
            setPreview(f ? URL.createObjectURL(f) : current ?? null)
          }}
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
        />
      </div>
    </Field>
  )
}

function AppForm({ app }: { app?: AppWithScore }) {
  const [state, action, pending] = useActionState(saveApp, null)

  return (
    <div className="flex flex-col gap-4">
      <SaveToast state={state} />
      <form action={action} id={app ? `app-${app.id}` : "app-new"} className="flex flex-col gap-4">
        {app ? <input type="hidden" name="id" value={app.id} /> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field text="이름">
            <input name="name" defaultValue={app?.name} required className={input} />
          </Field>
          <Field text="카테고리">
            <input name="category" defaultValue={app?.category ?? "핀테크"} className={input} />
          </Field>
        </div>
        <Field text="한 줄 소개">
          <input name="tagline" defaultValue={app?.tagline ?? ""} className={input} />
        </Field>
        <Field text="설명">
          <textarea name="description" defaultValue={app?.description ?? ""} rows={2} className={input} />
        </Field>
        <Field text="동아리 코멘트">
          <textarea name="club_comment" defaultValue={app?.club_comment ?? ""} rows={2} className={input} />
        </Field>
        <Field text="앱 스토어 URL (다운로드 링크)">
          <input
            name="app_store_url"
            type="url"
            defaultValue={app?.app_store_url ?? ""}
            placeholder="https://apps.apple.com/..."
            className={input}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field text="태그 (쉼표로 구분)">
            <input name="tags" defaultValue={(app?.tags ?? []).join(", ")} placeholder="1초 송금, 다크 모드" className={input} />
          </Field>
          <Field text="대표 색상">
            <input name="accent_color" type="color" defaultValue={app?.accent_color ?? "#14bb51"} className="h-10 w-full rounded-lg border border-border bg-background" />
          </Field>
          <Field text="정렬 순서">
            <input name="sort_order" type="number" defaultValue={app?.sort_order ?? 0} className={input} />
          </Field>
        </div>
        <ImagePicker name="logo" current={app?.logo_url} text="로고 이미지" />

        <div className="rounded-xl bg-muted/50 p-4">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">평가 점수 (0–10)</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CRITERIA.filter((c) => c.score !== undefined).map((c) => (
              <Field key={c.key} text={c.label}>
                <input
                  name={c.score as string}
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  defaultValue={app && c.score ? (app[c.score] as number) : 0}
                  className={input}
                />
              </Field>
            ))}
            <Field text="평가 인원">
              <input name="rater_count" type="number" defaultValue={app?.rater_count ?? 0} className={input} />
            </Field>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between pt-1">
        <button
          type="submit"
          form={app ? `app-${app.id}` : "app-new"}
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        {app ? (
          <DeleteButton action={deleteApp} id={app.id} confirmText={`'${app.name}'을(를) 삭제할까요?`} />
        ) : null}
      </div>
    </div>
  )
}

function InsightForm({ insight }: { insight?: Insight }) {
  const formId = insight ? `insight-${insight.id}` : "insight-new"
  const [bodyHtml, setBodyHtml] = useState<string>(insight?.body ?? "")
  const [state, baseAction, pending] = useActionState(saveInsight, null)

  return (
    <div className="flex flex-col gap-4">
      <SaveToast state={state} />
      <form
        action={async (fd) => {
          fd.set("body", bodyHtml)
          await baseAction(fd)
        }}
        id={formId}
        className="flex flex-col gap-4"
      >
        {insight ? <input type="hidden" name="id" value={insight.id} /> : null}
        <input type="hidden" name="type" value="인사이트" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field text="카테고리">
            <select name="category" defaultValue={insight?.category ?? ""} className={input}>
              <option value="">— 선택 —</option>
              {INSIGHT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field text="정렬 순서">
            <input name="sort_order" type="number" defaultValue={insight?.sort_order ?? 0} className={input} />
          </Field>
        </div>
        <Field text="제목">
          <input name="title" defaultValue={insight?.title} required className={input} />
        </Field>
        <Field text="요약 (목록에 표시되는 한 줄 설명)">
          <input name="summary" defaultValue={insight?.summary ?? ""} className={input} />
        </Field>
        <Field text="작성자">
          <input name="author" defaultValue={insight?.author ?? ""} className={input} />
        </Field>
        <Field text="게시일">
          <input
            name="published_on"
            type="date"
            defaultValue={insight?.published_on ? String(insight.published_on).slice(0, 10) : ""}
            className={input}
          />
        </Field>

        <ImagePicker name="image" current={insight?.image_url} text="대표 썸네일 이미지" />

        {/* 본문 에디터 — 툴바의 이미지 버튼으로 원하는 위치에 이미지 삽입 */}
        <Field text="본문 (툴바의 이미지 버튼으로 원하는 위치에 사진 삽입 가능)">
          <RichTextEditor
            value={bodyHtml}
            onChange={setBodyHtml}
            placeholder="본문 내용을 입력하고, 툴바의 🖼 버튼으로 이미지를 삽입하세요..."
          />
        </Field>
        <input type="hidden" name="body" value={bodyHtml} />
      </form>

      <div className="flex items-center justify-between pt-1">
        <button
          type="submit"
          form={formId}
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        {insight ? (
          <DeleteButton action={deleteInsight} id={insight.id} confirmText={`'${insight.title}'을(를) 삭제할까요?`} />
        ) : null}
      </div>
    </div>
  )
}

function HomeSettingsForm({ settings }: { settings: SiteSettings }) {
  const [heroPreview, setHeroPreview] = useState<string | null>(settings.hero_image_url ?? null)
  const [state, action, pending] = useActionState(saveSiteSettings, null)

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-sm">
      <SaveToast state={state} />
      <div className="px-5 py-4">
        <p className="font-bold text-primary">홈 화면 설정</p>
        <p className="text-xs text-muted-foreground">저장 후 즉시 홈 화면에 반영됩니다.</p>
      </div>
      <div className="border-t border-border px-5 py-5">
        <form action={action} className="flex flex-col gap-5">
          {/* 히어로 섹션 */}
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">히어로 섹션 (상단 배너)</p>
            <div className="flex flex-col gap-4">
              {/* 배경 이미지 업로더 */}
              <Field text="배경 사진 (JPG, PNG, WEBP — 권장 가로 900px 이상)">
                <div className="flex flex-col gap-3">
                  {heroPreview && (
                    <div className="relative h-36 w-full overflow-hidden rounded-xl border border-border">
                      <img
                        src={heroPreview}
                        alt="히어로 배경 미리보기"
                        className="h-full w-full object-cover object-center"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/50 to-black/70">
                        <span className="text-xs font-semibold text-white/80">미리보기</span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    name="hero_image"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setHeroPreview(URL.createObjectURL(f))
                    }}
                    className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    파일을 선택하지 않으면 기존 사진이 유지됩니다.
                  </p>
                </div>
              </Field>
              <Field text="메인 제목 (줄바꿈: Enter 키)">
                <textarea name="hero_title" defaultValue={settings.hero_title} rows={3} className={input} />
              </Field>
              <Field text="부제 (히어로 아래 설명 문구)">
                <textarea name="hero_subtitle" defaultValue={settings.hero_subtitle} rows={2} className={input} />
              </Field>
            </div>
          </div>

          {/* 동아리 소개 섹션 */}
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">동아리 소개 섹션 (하단 카드)</p>
            <div className="flex flex-col gap-4">
              <Field text="소개 제목">
                <input name="club_intro_title" defaultValue={settings.club_intro_title} className={input} />
              </Field>
              <Field text="소개 본문">
                <textarea name="club_intro_body" defaultValue={settings.club_intro_body} rows={4} className={input} />
              </Field>
              <Field text="활동 멤버 수">
                <input name="member_count" type="number" defaultValue={settings.member_count} className={input} />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="self-start rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {pending ? "저장 중..." : "저장"}
          </button>
        </form>
      </div>
    </div>
  )
}

function DeleteButton({
  action,
  id,
  confirmText,
}: {
  action: (formData: FormData) => void
  id: number
  confirmText: string
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm font-medium text-red-500 hover:text-red-600">
        삭제
      </button>
    </form>
  )
}
