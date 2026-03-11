import { getNewsById } from "@/app/actions/news-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getDummyNewsById } from "@/lib/dummy-data"
import { ArrowLeft, CalendarIcon, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface NewsPageProps {
  params: {
    id: string
  }
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    notFound()
  }

  let news = null

  try {
    // サーバーアクションでニュース記事を取得
    news = await getNewsById(id)
  } catch (error) {
    console.error(`ID ${id} のニュース記事の取得中にエラーが発生しました:`, error)
  }

  // サーバーアクションが失敗した場合はダミーデータを使用
  if (!news) {
    console.warn(`ID ${id} のニュース記事が見つかりませんでした。ダミーデータを使用します。`)

    try {
      news = getDummyNewsById(id)
    } catch (error) {
      console.error(`ID ${id} のダミーニュース記事の取得中にエラーが発生しました:`, error)
    }

    // ダミーデータにも存在しない場合はハードコードされたデータを使用
    if (!news) {
      if (id === 1) {
        news = {
          id: 1,
          title: "春のフラワーアレンジメント特別レッスン開催",
          date: "2025-04-15",
          category: "イベント",
          content:
            "春の花材を使った特別レッスンを開催します。桜やチューリップなど、春ならではの花材を使ったアレンジメントを学びましょう。",
          full_content:
            "春の花材を使った特別レッスンを開催します。桜やチューリップなど、春ならではの花材を使ったアレンジメントを学びましょう。\n\n参加者には、特製の花器をプレゼントいたします。初心者の方も安心してご参加いただけます。",
          created_at: "2025-03-01T00:00:00Z",
          event_details: {
            dates: "2025年4月15日（火）",
            time: "14:00〜16:00",
            location: "森の音スタジオ",
            fee: "5,000円（材料費込み）",
            contact: "info@morinooto.jp",
          },
        }
      } else if (id === 2) {
        news = {
          id: 2,
          title: "新しいレッスンメニュー「七色星花アレンジメント」が登場",
          date: "2025-03-10",
          category: "お知らせ",
          content: "takako先生認定の特別レッスンメニュー「七色星花アレンジメント」が新しく登場しました。",
          full_content:
            "takako先生認定の特別レッスンメニュー「七色星花アレンジメント」が新しく登場しました。\n\n七色の花材を使用し、星型に配置する独自のアレンジメント技法です。季節ごとに異なる花材を使用するため、一年を通して楽しめるレッスンとなっています。",
          created_at: "2025-03-01T00:00:00Z",
        }
      } else if (id === 3) {
        news = {
          id: 3,
          title: "GW期間中の営業について",
          date: "2025-04-20",
          category: "お知らせ",
          content: "ゴールデンウィーク期間中は通常通り営業いたします。",
          full_content:
            "ゴールデンウィーク期間中（2025年4月29日〜5月5日）は通常通り営業いたします。\n\n期間中は特別レッスンも開催予定ですので、ぜひお越しください。詳細は後日お知らせいたします。",
          created_at: "2025-03-01T00:00:00Z",
        }
      } else {
        // それでも見つからない場合は404
        return (
          <main className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Button variant="ghost" size="sm" className="mb-4" asChild>
                  <Link href="/#information" className="flex items-center text-[#2E5A1C]">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    ニュース一覧に戻る
                  </Link>
                </Button>

                <Card className="p-6 bg-white/90 backdrop-blur shadow-md mb-8">
                  <div className="text-center py-8">
                    <h1 className="text-2xl font-bold text-[#4A4A4A] mb-4">お知らせが見つかりません</h1>
                    <p className="text-gray-600">指定されたIDのお知らせは見つかりませんでした。</p>
                  </div>
                </Card>
              </div>
            </div>
          </main>
        )
      }
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/#information" className="flex items-center text-[#2E5A1C]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ニュース一覧に戻る
            </Link>
          </Button>

          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant={news.category === "イベント" ? "outline" : "secondary"} className="px-3 py-1">
              {news.category}
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {news.date}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#4A4A4A] mb-6">{news.title}</h1>

          {news.image_url && (
            <div className="relative w-full mb-8 rounded-lg overflow-hidden">
              {/* 画像のアスペクト比を固定せず、高さを自動調整するように変更 */}
              <div className="relative w-full" style={{ maxHeight: "500px" }}>
                <Image
                  src={news.image_url || "/placeholder.svg?height=400&width=800"}
                  alt={news.title}
                  width={800}
                  height={400}
                  className="object-contain w-full h-auto max-h-[500px]"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            </div>
          )}

          <Card className="p-6 bg-white/90 backdrop-blur shadow-md mb-8">
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-gray-700">{news.full_content || news.content}</p>
            </div>
          </Card>

          {news.event_details && Object.keys(news.event_details).length > 0 && (
            <Card className="p-6 bg-white/90 backdrop-blur shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#2E5A1C]">イベント詳細</h2>
              <Separator className="mb-4" />
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {news.event_details.dates && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">開催日</dt>
                    <dd className="mt-1 text-gray-700">{news.event_details.dates}</dd>
                  </div>
                )}
                {news.event_details.time && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">時間</dt>
                    <dd className="mt-1 text-gray-700">{news.event_details.time}</dd>
                  </div>
                )}
                {news.event_details.location && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">場所</dt>
                    <dd className="mt-1 text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-[#2E5A1C]" />
                      {news.event_details.location}
                    </dd>
                  </div>
                )}
                {news.event_details.fee && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">参加費</dt>
                    <dd className="mt-1 text-gray-700">{news.event_details.fee}</dd>
                  </div>
                )}
                {news.event_details.contact && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">お問い合わせ</dt>
                    <dd className="mt-1 text-gray-700">{news.event_details.contact}</dd>
                  </div>
                )}
              </dl>
            </Card>
          )}

          {news.related_links && news.related_links.length > 0 && (
            <Card className="p-6 bg-white/90 backdrop-blur shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-[#2E5A1C]">関連リンク</h2>
              <Separator className="mb-4" />
              <ul className="space-y-2">
                {news.related_links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
