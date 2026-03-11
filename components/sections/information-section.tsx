"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, InfoIcon, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getAllNews, getNewsByCategory } from "@/app/actions/news-actions"
import type { NewsArticle } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getDummyNews } from "@/lib/dummy-data"

// ニュース記事カードコンポーネント
function AnnouncementCard({ announcement }: { announcement: NewsArticle }) {
  return (
    <Card className="bg-white/90 backdrop-blur shadow-md overflow-hidden border-none h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge
            variant={announcement.category === "イベント" ? "outline" : "secondary"}
            className="px-3 py-1 text-xs font-medium"
          >
            {announcement.category}
          </Badge>
          <div className="flex items-center text-xs text-gray-500">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {announcement.date}
          </div>
        </div>
        <CardTitle className="text-[#4A4A4A] text-xl mt-2">{announcement.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-600 text-base">{announcement.content}</CardDescription>
      </CardContent>
      <CardFooter className="pt-0 flex justify-end">
        <Button variant="link" size="sm" className="text-xs text-[#2E5A1C] p-0 h-auto" asChild>
          <Link href={`/news/${announcement.id}`} className="flex items-center">
            詳細を見る
            <InfoIcon className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// ローディングインジケーターコンポーネント
function LoadingIndicator() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E5A1C]"></div>
    </div>
  )
}

// エラーメッセージコンポーネント
function ErrorMessage({ message, onRetry, isRetrying }: { message: string; onRetry: () => void; isRetrying: boolean }) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>エラーが発生しました</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
        <span>{message}</span>
        <Button variant="outline" size="sm" onClick={onRetry} className="whitespace-nowrap" disabled={isRetrying}>
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              読み込み中...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行する
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  )
}

// メインコンポーネント
export default function InformationSection() {
  const [activeTab, setActiveTab] = useState("all")
  const [announcements, setAnnouncements] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const [useFallback, setUseFallback] = useState(false)
  const isMountedRef = useRef(false)
  const fetchingRef = useRef(false)

  // ニュース記事を取得する関数
  const fetchNews = useCallback(() => {
    // 既に読み込み中の場合は処理をスキップ
    if (fetchingRef.current) {
      console.log("既にデータ取得中のため、スキップします")
      return
    }

    fetchingRef.current = true
    setLoading(true)
    setError(null)

    // 非同期処理を開始
    setTimeout(async () => {
      try {
        let data: NewsArticle[] = []
        let fetchAttempts = 0
        const maxAttempts = 3 // 最大試行回数を増やす

        // サーバーアクションを使用してデータを取得（再試行ロジック追加）
        while (fetchAttempts < maxAttempts && !useFallback) {
          try {
            console.log(
              `fetchNews: ${activeTab === "all" ? "全ての" : activeTab}ニュースを取得します (試行: ${fetchAttempts + 1}/${maxAttempts})`,
            )

            // データ取得
            data = await (activeTab === "all" ? getAllNews() : getNewsByCategory(activeTab))

            // データが取得できた場合はループを抜ける
            if (data && Array.isArray(data) && data.length > 0) {
              console.log(`${data.length}件のニュースデータを取得しました`)
              break
            }

            // データが空の場合は再試行
            console.warn("データが空です。再試行します。")
            fetchAttempts++

            // 最後の試行でなければ少し待機
            if (fetchAttempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
            }
          } catch (error) {
            console.error(`データ取得エラー (試行: ${fetchAttempts + 1}/${maxAttempts}):`, error)
            fetchAttempts++

            // 最後の試行でなければ少し待機
            if (fetchAttempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
            }
          }
        }

        // 全ての試行が失敗した場合のみフォールバックを使用
        if ((fetchAttempts >= maxAttempts || useFallback) && (!data || !Array.isArray(data) || data.length === 0)) {
          console.log("全ての試行が失敗したため、フォールバックモードでダミーデータを使用します")
          try {
            // ダミーデータを使用
            const dummyData = getDummyNews()
            data = activeTab === "all" ? dummyData : dummyData.filter((item) => item.category === activeTab)
            console.log(`フォールバックデータ: ${data.length}件のニュースを使用します`)
          } catch (error) {
            console.error("ダミーデータの取得に失敗しました:", error)
            data = []
          }
        }

        // データをセット
        setAnnouncements(data)

        // カテゴリーの一覧を取得（全てのタブの場合の���）
        if (activeTab === "all") {
          try {
            // カテゴリー取得も再試行ロジックを追加
            let categoryAttempts = 0
            let allNews = []

            while (categoryAttempts < maxAttempts) {
              try {
                allNews = await getAllNews()
                if (allNews && Array.isArray(allNews) && allNews.length > 0) {
                  break
                }
                categoryAttempts++
                if (categoryAttempts < maxAttempts) {
                  await new Promise((resolve) => setTimeout(resolve, 1000))
                }
              } catch (error) {
                categoryAttempts++
                if (categoryAttempts < maxAttempts) {
                  await new Promise((resolve) => setTimeout(resolve, 1000))
                }
              }
            }

            // 全ての試行が失敗した場合のみダミーデータを使用
            if (categoryAttempts >= maxAttempts && (!allNews || !Array.isArray(allNews) || allNews.length === 0)) {
              allNews = getDummyNews()
            }

            const uniqueCategories = Array.from(new Set(allNews.map((item) => item.category)))
            setCategories(uniqueCategories)
          } catch (error) {
            console.error("カテゴリー取得エラー:", error)
            // エラー時はダミーデータからカテゴリーを取得
            const dummyData = getDummyNews()
            const uniqueCategories = Array.from(new Set(dummyData.map((item) => item.category)))
            setCategories(uniqueCategories)
          }
        }

        setError(null)
      } catch (error) {
        console.error("データ取得エラー:", error)
        setError("データの読み込みに失敗しました。ネットワーク接続を確認してください。")

        // エラー時はダミーデータを使用
        try {
          const dummyData = getDummyNews()
          // カテゴリーでフィルタリング
          const filteredData = activeTab === "all" ? dummyData : dummyData.filter((item) => item.category === activeTab)
          setAnnouncements(filteredData)

          // カテゴリーの一覧を取得（全てのタブの場合のみ）
          if (activeTab === "all") {
            const uniqueCategories = Array.from(new Set(dummyData.map((item) => item.category)))
            setCategories(uniqueCategories)
          }
        } catch (e) {
          console.error("ダミーデータの設定にも失敗しました:", e)
        }
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    }, 0) // setTimeout を使用して非同期処理をスケジュール
  }, [activeTab, useFallback])

  // 初回マウント時の処理
  useEffect(() => {
    // コンポーネントがマウントされたときにのみデータを取得
    if (!isMountedRef.current) {
      console.log("InformationSection: 初回マウント時のデータ取得を開始します")
      isMountedRef.current = true

      // 少し遅延させてデータ取得を開始（他のコンポーネントの初期化が完了するのを待つ）
      const timer = setTimeout(() => {
        fetchNews()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [fetchNews])

  // タブ変更時の処理
  useEffect(() => {
    // 初回マウント時は処理しない（上のuseEffectで処理されるため）
    if (isMountedRef.current && fetchingRef.current === false) {
      console.log(`InformationSection: タブが変更されました (${activeTab})`)

      // 少し遅延させてデータ取得を開始
      const timer = setTimeout(() => {
        fetchNews()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [activeTab, retryCount, fetchNews])

  // 再試行ハンドラー
  const handleRetry = useCallback(() => {
    setUseFallback(false) // 再試行時はサーバーアクションを再度試みる
    setRetryCount((prev) => prev + 1)
    console.log("データの再取得を試みます")
  }, [])

  // フォールバックモードに切り替えるハンドラー
  const handleSwitchToFallback = useCallback(() => {
    setUseFallback(true)
    try {
      const dummyData = getDummyNews()
      const filteredData = activeTab === "all" ? dummyData : dummyData.filter((item) => item.category === activeTab)
      setAnnouncements(filteredData)

      // カテゴリーの一覧を取得（全てのタブの場合のみ）
      if (activeTab === "all") {
        const uniqueCategories = Array.from(new Set(dummyData.map((item) => item.category)))
        setCategories(uniqueCategories)
      }

      console.log(`フォールバックデータ: ${filteredData.length}件のニュースを使用します`)
      setError(null)
    } catch (error) {
      console.error("ダミーデータの設定に失敗しました:", error)
    }
    setRetryCount((prev) => prev + 1)
  }, [activeTab])

  // 初期表示時にダミーデータを設定
  useEffect(() => {
    if (announcements.length === 0 && !loading && !error) {
      console.log("初期表示時にデータがありません。データベースからの取得を試みます")
      handleRetry() // ダミーデータではなく再試行を実行
    }
  }, [announcements.length, loading, error, handleRetry])

  return (
    <section id="information" className="bg-[#cee6c1] text-[#4A4A4A] py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-12 tracking-wider text-[#2E5A1C]">
          NEWS
        </h2>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={handleRetry} isRetrying={loading} />
            <div className="mt-2 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwitchToFallback}
                className="text-xs"
                disabled={useFallback || loading}
              >
                ダミーデータを使用する
              </Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="mb-8">
            <TabsList className="bg-[#2E5A1C]/10 p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#2E5A1C] data-[state=active]:text-white text-[#2E5A1C]"
              >
                すべて
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-[#2E5A1C] data-[state=active]:text-white text-[#2E5A1C]"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 max-w-2xl mx-auto">
              {loading ? (
                <LoadingIndicator />
              ) : announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))
              ) : (
                <div className="text-center py-12 bg-white/90 backdrop-blur shadow-md rounded-lg">
                  <p className="text-gray-500">お知らせはありません</p>
                </div>
              )}
            </div>
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 max-w-2xl mx-auto">
                {loading ? (
                  <LoadingIndicator />
                ) : announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white/90 backdrop-blur shadow-md rounded-lg">
                    <p className="text-gray-500">お知らせはありません</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
