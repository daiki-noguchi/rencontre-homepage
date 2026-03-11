"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw, AlertTriangle } from "lucide-react"
import { SimpleLessonCard } from "@/components/simple-lesson-card"
import type { SimpleLesson } from "@/lib/lesson-types-simple"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

interface SimpleLessonsClientProps {
  lessons: SimpleLesson[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function SimpleLessonsClient({
  lessons = [],
  isLoading = false,
  error = null,
  onRetry,
}: SimpleLessonsClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)")

  // 1ページあたりのカード数
  const cardsPerPage = isMobile ? 1 : isTablet ? 2 : 3

  // カテゴリーの一覧を取得
  const categories = Array.from(new Set(lessons.map((lesson) => lesson.category).filter(Boolean))) as string[]

  // フィルタリングされたレッスン
  const filteredLessons = activeCategory ? lessons.filter((lesson) => lesson.category === activeCategory) : lessons

  // 総ページ数
  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / cardsPerPage))

  // ページ移動関数
  const prevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
  }

  const nextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
  }

  // カテゴリー変更関数
  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category)
    setCurrentPage(0) // カテゴリー変更時にページをリセット
  }

  // カテゴリー変更時にページ番号をリセット
  useEffect(() => {
    setCurrentPage(0)
  }, [activeCategory])

  // 安全なレッスンデータを確保
  const safeFilteredLessons = Array.isArray(filteredLessons) ? filteredLessons : []
  const currentLessons = safeFilteredLessons.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)

  return (
    <section id="lessons" className="bg-[#cee6c1] py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-8 tracking-wider text-[#2E5A1C]">
          LESSONS
        </h2>
        <p className="text-lg text-[#2E5A1C]/80 max-w-2xl mb-12">
          Rencontreでは様々なフラワーアレンジメントのレッスンをご用意しています。初心者の方でも安心して参加いただけます。
        </p>

        {/* エラーメッセージ */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span>{error}</span>
              {onRetry && (
                <Button onClick={onRetry} disabled={isLoading} className="whitespace-nowrap">
                  {isLoading ? (
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
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* ローディングインジケーター */}
        {isLoading && (
          <div className="flex justify-center py-8 mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E5A1C]"></div>
          </div>
        )}

        {/* カテゴリーフィルター */}
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

        {/* レッスンカード表示 */}
        {!isLoading && safeFilteredLessons.length > 0 ? (
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
                >
                  <CarouselContent>
                    {safeFilteredLessons.map((lesson) => (
                      <CarouselItem key={lesson.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <SimpleLessonCard lesson={lesson} />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2">
                    <CarouselPrevious className="bg-white/80 border-[#2E5A1C]/20 text-[#2E5A1C]" />
                  </div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                    <CarouselNext className="bg-white/80 border-[#2E5A1C]/20 text-[#2E5A1C]" />
                  </div>
                </Carousel>
                <div className="flex justify-center mt-4 gap-2">
                  {Array.from({ length: Math.ceil(safeFilteredLessons.length / cardsPerPage) }).map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentPage === index ? "w-6 bg-[#2E5A1C]" : "bg-[#2E5A1C]/30"
                      }`}
                      onClick={() => setCurrentPage(index)}
                      aria-label={`ページ ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {currentLessons.map((lesson) => (
                  <div key={lesson.id} className="flex justify-center">
                    <SimpleLessonCard lesson={lesson} />
                  </div>
                ))}
              </div>
            )}

            {/* ページネーション */}
            {safeFilteredLessons.length > cardsPerPage && (
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
                  {currentPage + 1} / {totalPages}
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
        ) : !isLoading ? (
          <div className="text-center py-10 bg-white/80 rounded-lg shadow-sm">
            <p className="text-gray-500">
              {activeCategory
                ? `${activeCategory}カテゴリーのレッスンはありません`
                : "現在レッスンは登録されていません"}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
