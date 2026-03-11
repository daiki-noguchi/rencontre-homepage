"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { motion } from "framer-motion"
import type { LessonWithRelations } from "@/lib/lesson-types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LessonCard } from "@/components/lesson-card"
import { getLessonsBasicInfo } from "@/app/actions/lesson-actions"
import { LessonCardClickable } from "@/components/lesson-card-clickable"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLoading } from "@/lib/contexts/loading-context"
import { getDummyLessons } from "@/lib/dummy-data"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

// エラーメッセージコンポーネント
function ErrorMessage({ message, onRetry, isRetrying }: { message: string; onRetry: () => void; isRetrying: boolean }) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>エラーが発生しました</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
        <span>{message}</span>
        <Button onClick={onRetry} disabled={isRetrying} className="whitespace-nowrap">
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

// LoadingIndicatorコンポーネント
function LoadingIndicator() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E5A1C]"></div>
    </div>
  )
}

// LessonsSectionのクライアントコンポーネント
interface LessonsSectionClientProps {
  initialLessons: LessonWithRelations[]
  useRealData?: boolean
  isClickable?: boolean
}

export default function LessonsSectionClient({
  initialLessons,
  useRealData = true,
  isClickable = false,
}: LessonsSectionClientProps) {
  const { setLoading: setGlobalLoading, setLoadingMessage } = useLoading()
  const [lessons, setLessons] = useState<LessonWithRelations[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [headingSize, setHeadingSize] = useState("text-4xl")
  const [motionEnabled, setMotionEnabled] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)")
  const isDesktopQuery = useMediaQuery("(min-width: 768px)")
  const [isDesktop, setIsDesktop] = useState(false)
  const initialLoadDone = useRef(false)
  const dataFetchingInProgress = useRef(false)

  // カルーセルAPIの状態管理
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const [carouselReady, setCarouselReady] = useState(false)

  // 1ページあたりのカード数を画面サイズに応じて設定
  const cardsPerPage = isMobile ? 1 : isTablet ? 2 : 3

  // 初期化処理
  useEffect(() => {
    setIsClient(true)

    // モーション設定
    try {
      setMotionEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    } catch (e) {
      console.warn("window.matchMedia is not supported in this environment.")
    }

    setIsDesktop(isDesktopQuery)

    // Set heading size based on screen size
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setHeadingSize("text-8xl")
      } else if (window.innerWidth >= 1024) {
        setHeadingSize("text-7xl")
      } else if (window.innerWidth >= 768) {
        setHeadingSize("text-6xl")
      } else if (window.innerWidth >= 640) {
        setHeadingSize("text-5xl")
      } else {
        setHeadingSize("text-4xl")
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [isDesktopQuery])

  // 初期データの処理
  useEffect(() => {
    // 初期データのバリデーション
    if (initialLessons && Array.isArray(initialLessons)) {
      console.log("初期データを使用します:", initialLessons.length)
      setLessons(initialLessons)
    } else {
      console.warn("初期データが無効です。ダミーデータを使用します。")
      // ダミーデータを使用
      const dummyData = getDummyLessons()
      setLessons(dummyData)
    }
  }, [initialLessons])

  // カルーセルAPIの設定
  useEffect(() => {
    if (!carouselApi) {
      return
    }

    console.log("カルーセルAPIが設定されました")
    setCarouselReady(true)

    // カルーセルの選択変更イベントをリッスン
    const onSelect = () => {
      console.log("カルーセル選択変更:", carouselApi.selectedScrollSnap())
      setCurrentPage(carouselApi.selectedScrollSnap())
    }

    carouselApi.on("select", onSelect)

    // クリーンアップ関数
    return () => {
      carouselApi.off("select", onSelect)
      setCarouselReady(false)
    }
  }, [carouselApi])

  // カテゴリーの一覧を取得
  const categories = Array.from(new Set(lessons.map((lesson) => lesson.category).filter(Boolean))) as string[]

  // フィルタリングされたレッスン
  const filteredLessons = activeCategory ? lessons.filter((lesson) => lesson.category === activeCategory) : lessons

  // 総ページ数を計算
  const totalFilteredPages = Math.max(1, Math.ceil(filteredLessons.length / cardsPerPage))

  // 前のページに移動
  const prevPage = useCallback(() => {
    console.log("前のページへ移動")
    if (isMobile && carouselApi && carouselReady) {
      carouselApi.scrollPrev()
    } else {
      setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalFilteredPages - 1))
    }
  }, [carouselApi, carouselReady, isMobile, totalFilteredPages])

  // 次のページに移動
  const nextPage = useCallback(() => {
    console.log("次のページへ移動")
    if (isMobile && carouselApi && carouselReady) {
      carouselApi.scrollNext()
    } else {
      setCurrentPage((prev) => (prev < totalFilteredPages - 1 ? prev + 1 : 0))
    }
  }, [carouselApi, carouselReady, isMobile, totalFilteredPages])

  // ページインジケーターをクリックしたときの処理
  const handlePageClick = useCallback(
    (index: number) => {
      console.log("ページインジケータークリック:", index)
      setCurrentPage(index)

      if (carouselApi && carouselReady) {
        console.log("カルーセルをスクロール:", index)
        carouselApi.scrollTo(index)
      }
    },
    [carouselApi, carouselReady],
  )

  // カテゴリー切り替え
  const handleCategoryChange = useCallback(
    (category: string | null) => {
      console.log("カテゴリー変更:", category)
      setActiveCategory(category)
      setCurrentPage(0) // カテゴリー変更時にページをリセット

      // カルーセルもリセット
      if (carouselApi && carouselReady) {
        console.log("カルーセルをリセット")
        setTimeout(() => {
          carouselApi.scrollTo(0)
        }, 0)
      }
    },
    [carouselApi, carouselReady],
  )

  // データの再取得を試みる関数
  const handleRetry = useCallback(async () => {
    // 既にデータ取得中の場合は処理をスキップ
    if (dataFetchingInProgress.current) {
      console.log("既にデータ取得中のため、スキップします")
      return
    }

    dataFetchingInProgress.current = true
    setLoading(true)
    setError(null)

    try {
      console.log("データの再取得を試みます")
      const data = await getLessonsBasicInfo()

      if (data && Array.isArray(data) && data.length > 0) {
        setLessons(data)
        setError(null)
      } else {
        console.warn("再取得したデータが空です")
        // ダミーデータを使用
        const dummyData = getDummyLessons()
        setLessons(dummyData)
      }
    } catch (err) {
      console.error("データ再取得エラー:", err)
      setError("データの再取得中にエラーが発生しました")
      // ダミーデータを使用
      const dummyData = getDummyLessons()
      setLessons(dummyData)
    } finally {
      setLoading(false)
      dataFetchingInProgress.current = false
    }
  }, [])

  // isDesktopQueryの変更を監視
  useEffect(() => {
    if (isClient) {
      setIsDesktop(isDesktopQuery)
    }
  }, [isDesktopQuery, isClient])

  // クライアントサイドでレンダリングされるまでは簡易的なローディング表示
  if (!isClient) {
    return (
      <section id="lessons" className="bg-[#cee6c1] py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className={`${headingSize} font-light mb-8 tracking-wider text-[#2E5A1C]`}>LESSONS</h2>
          <p className="text-lg text-[#2E5A1C]/80 max-w-2xl mb-12">
            Rencontreでは様々なフラワーアレンジメントのレッスンをご用意しています。初心者の方でも安心して参加いただけます。
          </p>
        </div>
      </section>
    )
  }

  // 現在表示するレッスン
  const currentLessons = !isMobile
    ? filteredLessons.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)
    : filteredLessons

  return (
    <section id="lessons" className="bg-[#cee6c1] py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {motionEnabled ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`${headingSize} font-light mb-8 tracking-wider text-[#2E5A1C]`}>LESSONS</h2>
            <p className="text-lg text-[#2E5A1C]/80 max-w-2xl mb-12">
              Rencontreでは様々なフラワーアレンジメントのレッスンをご用意しています。初心者の方でも安心して参加いただけます。
            </p>
          </motion.div>
        ) : (
          <div>
            <h2 className={`${headingSize} font-light mb-8 tracking-wider text-[#2E5A1C]`}>LESSONS</h2>
            <p className="text-lg text-[#2E5A1C]/80 max-w-2xl mb-12">
              Rencontreでは様々なフラワーアレンジメントのレッスンをご用意しています。初心者の方でも安心して参加いただけます。
            </p>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && <ErrorMessage message={error} onRetry={handleRetry} isRetrying={loading} />}

        {/* カテゴリーフィルター - カテゴリーがある場合のみ表示 */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(null)}
              className={
                activeCategory === null
                  ? "bg-[#2E5A1C] hover:bg-[#2E5A1C]/90"
                  : "border-[#2E5A1C] text-[#2E5A1C] hover:bg-[#2E5A1C]/10"
              }
            >
              すべて
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category)}
                className={
                  activeCategory === category
                    ? "bg-[#2E5A1C] hover:bg-[#2E5A1C]/90"
                    : "border-[#2E5A1C] text-[#2E5A1C] hover:bg-[#2E5A1C]/10"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        <div className="relative">
          {/* ローディング表示 */}
          {loading && <LoadingIndicator />}

          {/* レッスンカードがない場合のメッセージ */}
          {!loading && (!lessons.length || !filteredLessons.length) && (
            <div className="text-center py-10 bg-white/80 rounded-lg shadow-sm">
              <p className="text-gray-500">
                {!lessons.length ? "現在レッスンは登録されていません" : "選択したカテゴリーのレッスンはありません"}
              </p>
            </div>
          )}

          {/* レッスンカードがある場合の表示 */}
          {!loading && filteredLessons.length > 0 && (
            <>
              {/* モバイル表示時はカルーセル、それ以外はグリッド表示 */}
              {isMobile ? (
                <div className="relative">
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full"
                    setApi={setCarouselApi}
                    defaultIndex={currentPage}
                  >
                    <CarouselContent>
                      {filteredLessons.map((lesson) => (
                        <CarouselItem key={lesson.id} className="md:basis-1/2 lg:basis-1/3">
                          <div className="p-1">
                            {isClickable ? <LessonCardClickable lesson={lesson} /> : <LessonCard lesson={lesson} />}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2">
                      <CarouselPrevious
                        className="bg-white/80 border-[#2E5A1C]/20 text-[#2E5A1C]"
                        onClick={(e) => {
                          e.stopPropagation()
                          prevPage()
                        }}
                      />
                    </div>
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                      <CarouselNext
                        className="bg-white/80 border-[#2E5A1C]/20 text-[#2E5A1C]"
                        onClick={(e) => {
                          e.stopPropagation()
                          nextPage()
                        }}
                      />
                    </div>
                  </Carousel>
                  <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: filteredLessons.length }).map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentPage === index ? "w-6 bg-[#2E5A1C]" : "bg-[#2E5A1C]/30"
                        }`}
                        onClick={() => handlePageClick(index)}
                        aria-label={`ページ ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {currentLessons.map((lesson) => (
                    <div key={lesson.id} className="flex justify-center">
                      {isClickable ? <LessonCardClickable lesson={lesson} /> : <LessonCard lesson={lesson} />}
                    </div>
                  ))}
                </div>
              )}

              {/* ページネーションコントロール - 複数ページがある場合のみ表示 */}
              {filteredLessons.length > cardsPerPage && (
                <div className="flex justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white hover:bg-white/90 border-[#2E5A1C]/20 text-[#2E5A1C]"
                    onClick={prevPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">前のページ</span>
                  </Button>
                  <div className="flex items-center text-sm text-[#2E5A1C]">
                    {currentPage + 1} / {totalFilteredPages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white hover:bg-white/90 border-[#2E5A1C]/20 text-[#2E5A1C]"
                    onClick={nextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">次のページ</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
