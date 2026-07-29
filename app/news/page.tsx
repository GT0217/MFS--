import { Newspaper } from "lucide-react"
import { getNews } from "@/lib/db"
import { NewsList } from "@/components/news-list"
import { PageHeader } from "@/components/page-header"

export const dynamic = "force-dynamic"

export default async function NewsPage() {
  const newsList = await getNews()

  return (
    <div>
      <PageHeader
        icon={Newspaper}
        eyebrow="NEWS"
        title="뉴스"
      />
      <div className="px-5">
        <NewsList newsList={newsList} />
      </div>
    </div>
  )
}
