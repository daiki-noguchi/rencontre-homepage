"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InfoIcon, ArrowLeft, Home, RefreshCw } from "lucide-react"
import Link from "next/link"
import { getCurrentCalendarImages } from "@/app/actions/calendar-image-actions"
import type { CalendarImage } from "@/lib/calendar-image-types"

// LINE ウィジェットの型定義
declare global {
  interface Window {
    LineIt?: {
      loadButton: () => void
    }
  }
}

export default function ReservationPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calendarImages, setCalendarImages] = useState<CalendarImage[]>([])

  // 日付文字列を解析する関数
  const parseDate = (dateStr: string | null): Date => {
    if (!dateStr) return new Date(0)

    // YYYY-MM-DD形式の日付文字列をパース
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      const year = Number.parseInt(parts[0], 10)
      const month = Number.parseInt(parts[1], 10) - 1 // 月は0から始まる
      const day = Number.parseInt(parts[2], 10)

      return new Date(year, month, day)
    }

    // パースできない場合はデフォルト値を返す
    return new Date(0)
  }

  // カレンダー画像を取得する関数
  const fetchCalendarImages = useCallback(async () => {
    try {
      setLoading(true)
      console.log("カレンダー画像を取得中...")

      const result = await getCurrentCalendarImages()

      if (result.success) {
        // display_untilが早い順（古い日付順）に並び替え
        const sortedImages = [...result.data].sort((a, b) => {
          const dateA = parseDate(a.display_until)
          const dateB = parseDate(b.display_until)

          console.log(`Comparing dates: ${a.display_until} (${dateA}) vs ${b.display_until} (${dateB})`)

          // 昇順（古い日付が先）に並び替え
          return dateA.getTime() - dateB.getTime()
        })

        setCalendarImages(sortedImages)
        console.log("カレンダー画像取得成功:", sortedImages)
      } else {
        console.error("カレンダー画像の取得に失敗しました:", result.error)
        setError("カレンダー画像の取得に失敗しました。")
      }
    } catch (error) {
      console.error("カレンダー画像の取得中にエラーが発生しました:", error)
      setError("カレンダー画像の取得に失敗しました。")
    } finally {
      setLoading(false)
    }
  }, [])

  // 初回マウント時にカレンダー画像を取得
  useEffect(() => {
    fetchCalendarImages()
  }, [fetchCalendarImages])

  // LINE ウィジェットのスクリプトを読み込む
  useEffect(() => {
    // すでに読み込まれているスクリプトがあれば削除
    const existingScript = document.getElementById("line-it-sdk")
    if (existingScript) {
      existingScript.remove()
    }

    // LINE ウィジェットのスクリプトを追加
    const script = document.createElement("script")
    script.id = "line-it-sdk"
    script.src = "https://www.line-website.com/social-plugins/js/thirdparty/loader.min.js"
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    // LINE ウィジェットの初期化
    script.onload = () => {
      if (window.LineIt) {
        window.LineIt.loadButton()
      }
    }

    // クリーンアップ関数
    return () => {
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  // LINE ウィジェットのボタンを表示するための div
  useEffect(() => {
    // LINE ウィジェットの再読み込み
    if (window.LineIt) {
      window.LineIt.loadButton()
    }
  }, [])

  useEffect(() => {
    // ページがマウントされたときに、ページトップにスクロール
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen bg-[#C2B280] py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-wider text-white whitespace-nowrap">
            ご予約方法
          </h1>
          <Button
            variant="outline"
            size="lg"
            className="mt-4 sm:mt-0 rounded-full bg-white/20 text-white hover:bg-white/30 hover:text-white border-white/40 shadow-md"
            asChild
          >
            <Link href="/" className="flex items-center gap-2" scroll={false}>
              <ArrowLeft className="h-4 w-4" />
              <span>トップページに戻る</span>
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur shadow-lg border-none">
            <CardHeader>
              <CardTitle className="text-2xl text-[#776B5D]">ご予約の流れ</CardTitle>
              <CardDescription>カレンダーを参照の上、LINEよりご予約ください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#776B5D]">以下の内容をご記入お願いします。</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-600 ml-4">
                  <li>お名前</li>
                  <li>住所：市町村名までで結構です</li>
                  <li>TEL</li>
                  <li>ご希望のお日にち、お時間</li>
                  <li>人数</li>
                  <li>レッスンメニュー</li>
                  <li>駐車場必要台数</li>
                </ol>
              </div>

              <Alert className="bg-[#776B5D]/10 border-[#776B5D]/20 text-[#776B5D]">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  レッスンメニューはHPを参照、又はInstagramで投稿した作品からお選び頂き、
                  ご希望の作品のスクショ写真を添付していただけると資材のご用意がスムーズとなり助かります。
                </AlertDescription>
              </Alert>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-medium text-[#776B5D] mb-6">ご予約・お問い合わせはこちら</h3>
                <div className="flex flex-col items-center w-full mx-auto">
                  <div
                    className="line-it-button w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2"
                    data-lang="ja"
                    data-type="friend"
                    data-env="REAL"
                    data-lineId="@gtf0394w"
                    data-size="large"
                    style={{ display: "none" }}
                  ></div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <Alert variant="outline" className="bg-[#F8F9FA] border-[#E9ECEF]">
                  <AlertTitle className="flex items-center text-[#776B5D] font-medium">
                    <InfoIcon className="h-4 w-4 mr-2" />
                    ご予約に関する注意事項
                  </AlertTitle>
                  <AlertDescription className="text-sm text-gray-600 mt-2 space-y-2">
                    <p className="flex items-start">
                      <span className="text-[#776B5D] mr-2">•</span>
                      <span>ご予約は先着順となります。</span>
                    </p>
                    <p className="flex items-start">
                      <span className="text-[#776B5D] mr-2">•</span>
                      <span>当日のキャンセルは、キャンセル料を頂戴する場合がございます。</span>
                    </p>
                    <p className="flex items-start">
                      <span className="text-[#776B5D] mr-2">•</span>
                      <span>詳しくはLINEにてお問い合わせください。</span>
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card id="calendar" className="bg-white/90 backdrop-blur shadow-lg border-none">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-[#776B5D]">営業カレンダー</CardTitle>
                  <CardDescription>下記カレンダーで営業日をご確認ください。</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchCalendarImages}
                  disabled={loading}
                  className="rounded-full bg-white/20 text-[#776B5D] hover:bg-white/30 border-[#776B5D]/40"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      更新
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#776B5D]" />
                  <span className="ml-2 text-[#776B5D]">カレンダーを読み込み中...</span>
                </div>
              ) : error ? (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle className="flex items-center">
                    <InfoIcon className="h-4 w-4 mr-2" />
                    エラーが発生しました
                  </AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : calendarImages.length > 0 ? (
                <div className="space-y-8">
                  {calendarImages.map((image) => (
                    <div key={image.id} className="flex flex-col items-center">
                      <h3 className="text-lg font-medium text-[#776B5D] mb-4">{image.title}</h3>
                      <div className="w-full max-w-3xl mx-auto bg-white p-4 rounded-lg shadow-sm">
                        <img
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.title}
                          className="w-full h-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/90 backdrop-blur shadow-md rounded-lg">
                  <p className="text-gray-500">現在表示できるカレンダーがありません</p>
                </div>
              )}

              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-medium text-[#776B5D]">営業時間</h3>
                <p className="text-gray-600">１０：００～１６：００</p>

                <Alert className="bg-[#776B5D]/10 border-[#776B5D]/20 text-[#776B5D] mt-6">
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    カレンダーは定期的に更新されます。最新の空き状況はLINEにてお問い合わせください。
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full bg-white text-[#776B5D] hover:bg-white/90 border-white shadow-md"
            asChild
          >
            <Link href="/" className="flex items-center gap-2" scroll={false}>
              <Home className="h-4 w-4" />
              <span>トップページに戻る</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
