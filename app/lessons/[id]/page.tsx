"use client"

import { useRef } from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Clock,
  JapaneseYenIcon as Yen,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLessonById, getAllLessons } from "@/app/actions/lesson-actions"
import { getDummyLessons } from "@/lib/dummy-data"
import type { LessonWithRelations } from "@/lib/lesson-types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

export default function LessonDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [currentImage, setCurrentImage] = useState(0)
  const [api, setApi] = useState<any>(null)
  const [showOtherLessons, setShowOtherLessons] = useState(false)
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const [lesson, setLesson] = useState<LessonWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [otherLessons, setOtherLessons] = useState<LessonWithRelations[]>([])
  const [loadingOtherLessons, setLoadingOtherLessons] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const initialLoadDone = useRef(false)
  // フォールバックモードを追跡するためのref
  const usingFallbackData = useRef(false)
  const mainLessonFetched = useRef(false)
  const otherLessonsFetched = useRef(false)
  // データ取得試行回数を追跡するためのref
  const mainFetchAttemptCount = useRef(0)
  const otherFetchAttemptCount = useRef(0)
  // 最大試行回数
  const MAX_FETCH_ATTEMPTS = 1

  // メインレッスンデータを取得する関数
  const fetchMainLesson = useCallback(async () => {
    // 既にフォールバックデータを使用している場合や、メインレッスンが取得済みの場合はスキップ
    if (usingFallbackData.current || mainLessonFetched.current) {
      console.log("fetchMainLesson: フォールバックデータ使用中またはデータ取得済みのためスキップします")
      return
    }

    // 最大試行回数に達した場合はフォールバックデータを使用
    if (mainFetchAttemptCount.current >= MAX_FETCH_ATTEMPTS) {
      console.log(`fetchMainLesson: 最大試行回数(${MAX_FETCH_ATTEMPTS})に達しました。フォールバックデータを使用します`)
      const id = Number(params.id)
      const dummyLessons = getDummyLessons()
      const dummyLesson = dummyLessons.find((l) => l.id === id)
      if (dummyLesson) {
        setLesson(dummyLesson)
        usingFallbackData.current = true
        mainLessonFetched.current = true
        setError(null)
      }
      return
    }

    if (!params.id) return

    setLoading(true)
    setError(null)
    mainFetchAttemptCount.current++

    try {
      const id = Number(params.id)

      // IDが無効な場合
      if (isNaN(id)) {
        console.error("無効なレッスンID:", params.id)
        setError("無効なレッスンIDです")
        setLoading(false)
        return
      }

      // レッスンデータを取得
      const lessonData = await getLessonById(id)

      if (lessonData) {
        console.log(`ID ${id} のレッスンデータを取得しました`)
        setLesson(lessonData)
        mainLessonFetched.current = true
      } else {
        console.error("レッスンが見つかりません:", id)
        setError("レッスンが見つかりません")

        // ダミーデータから同じIDのレッスンを探す
        const dummyLessons = getDummyLessons()
        const dummyLesson = dummyLessons.find((l) => l.id === id)

        if (dummyLesson) {
          console.log("ダミーデータからレッスンを使用します:", id)
          setLesson(dummyLesson)
          setError(null)
          usingFallbackData.current = true
          mainLessonFetched.current = true
        }
      }
    } catch (error) {
      console.error("レッスンの取得中にエラーが発生しました:", error)
      setError("データの取得中にエラーが発生しました")

      // 最大試行回数に達した場合はダミーデータを使用
      if (mainFetchAttemptCount.current >= MAX_FETCH_ATTEMPTS) {
        try {
          const id = Number(params.id)
          const dummyLessons = getDummyLessons()
          const dummyLesson = dummyLessons.find((l) => l.id === id)

          if (dummyLesson) {
            console.log("エラー発生時にダミーデータを使用します:", id)
            setLesson(dummyLesson)
            setError(null)
            usingFallbackData.current = true
            mainLessonFetched.current = true
          }
        } catch (e) {
          console.error("ダミーデータの取得にも失敗しました:", e)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [params.id])

  // 他のレッスンデータを取得する関数
  const fetchOtherLessons = useCallback(async () => {
    // 既にフォールバックデータを使用している場合や、他のレッスンが取得済みの場合はスキップ
    if (usingFallbackData.current || otherLessonsFetched.current) {
      console.log("fetchOtherLessons: フォールバックデータ使用中またはデータ取得済みのためスキップします")
      return
    }

    // 最大試行回数に達した場合はフォールバックデータを使用
    if (otherFetchAttemptCount.current >= MAX_FETCH_ATTEMPTS) {
      console.log(
        `fetchOtherLessons: 最大試行回数(${MAX_FETCH_ATTEMPTS})に達しました。フォールバックデータを使用します`,
      )
      const currentId = Number(params.id)
      const dummyLessons = getDummyLessons()
      setOtherLessons(dummyLessons.filter((l) => l.id !== currentId))
      usingFallbackData.current = true
      otherLessonsFetched.current = true
      return
    }

    if (!params.id) return

    setLoadingOtherLessons(true)
    otherFetchAttemptCount.current++

    try {
      const currentId = Number(params.id)

      // 全レッスンデータを取得
      const allLessons = await getAllLessons()

      if (allLessons && allLessons.length > 0) {
        console.log(`${allLessons.length}件のレッスンデータを取得しました`)
        // 現在のレッスン以外をフィルタリング
        const filtered = allLessons.filter((l) => l.id !== currentId)
        setOtherLessons(filtered)
        otherLessonsFetched.current = true
      } else {
        console.log("レッスンデータが取得できませんでした。ダミーデータを使用します")
        // ダミーデータを使用
        const dummyLessons = getDummyLessons()
        setOtherLessons(dummyLessons.filter((l) => l.id !== currentId))
        usingFallbackData.current = true
        otherLessonsFetched.current = true
      }
    } catch (error) {
      console.error("他のレッスンデータの取得中にエラーが発生しました:", error)

      // 最大試行回数に達した場合はダミーデータを使用
      if (otherFetchAttemptCount.current >= MAX_FETCH_ATTEMPTS) {
        try {
          const currentId = Number(params.id)
          const dummyLessons = getDummyLessons()
          setOtherLessons(dummyLessons.filter((l) => l.id !== currentId))
          usingFallbackData.current = true
          otherLessonsFetched.current = true
        } catch (e) {
          console.error("ダミーデータの取得にも失敗しました:", e)
        }
      }
    } finally {
      setLoadingOtherLessons(false)
    }
  }, [params.id])

  // 初回マウント時のデータ取得
  useEffect(() => {
    if (initialLoadDone.current) return

    // ページがマウントされたときに、ページトップにスクロール
    window.scrollTo(0, 0)

    // メインレッスンと他のレッスンを取得
    const fetchData = async () => {
      await fetchMainLesson()
      await fetchOtherLessons()
      initialLoadDone.current = true
    }

    fetchData()
  }, [fetchMainLesson, fetchOtherLessons])

  // パラメータが変更された場合のデータ再取得
  useEffect(() => {
    if (!initialLoadDone.current) return

    // IDが変更された場合はデータを再取得
    // フラグをリセット
    mainLessonFetched.current = false
    otherLessonsFetched.current = false
    usingFallbackData.current = false
    mainFetchAttemptCount.current = 0
    otherFetchAttemptCount.current = 0

    fetchMainLesson()
    fetchOtherLessons()
  }, [params.id, fetchMainLesson, fetchOtherLessons])

  // 再試行時のデータ再取得
  useEffect(() => {
    if (retryCount > 0 && !usingFallbackData.current) {
      // フラグをリセット
      mainLessonFetched.current = false
      otherLessonsFetched.current = false
      mainFetchAttemptCount.current = 0
      otherFetchAttemptCount.current = 0

      fetchMainLesson()
      fetchOtherLessons()
    }
  }, [retryCount, fetchMainLesson, fetchOtherLessons])

  // 再試行ハンドラー
  const handleRetry = () => {
    // フォールバックデータを使用していない場合のみ再試行
    if (!usingFallbackData.current) {
      setRetryCount((prev) => prev + 1)
    } else {
      console.log("既にフォールバックデータを使用しているため、再試行はスキップします")
    }
  }

  // ローディング中の表示
  if (loading) {
    return (
      <main className="min-h-screen bg-[#C2B280] py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#776B5D]"></div>
          </div>
        </div>
      </main>
    )
  }

  // エラーが発生した場合
  if (error && !lesson) {
    return (
      <main className="min-h-screen bg-[#C2B280] py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ErrorMessage message={error} onRetry={handleRetry} isRetrying={loading || loadingOtherLessons} />
            <Button
              variant="outline"
              size="lg"
              className="mt-4 rounded-full bg-white text-[#776B5D] hover:bg-white/90 border-white shadow-md"
              asChild
            >
              <Link href="/#lessons" className="flex items-center gap-2" scroll={false}>
                <ArrowLeft className="h-4 w-4" />
                <span>レッスン一覧に戻る</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // レッスンが見つからない場合の処理を修正

  // レッスンが見つからない場合
  if (!lesson) {
    return (
      <main className="min-h-screen bg-[#C2B280] py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <Card className="bg-white/90 backdrop-blur shadow-lg border-none p-8 max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl text-[#776B5D]">レッスンが見つかりません</CardTitle>
                <CardDescription>指定されたIDのレッスンは登録されていません</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full bg-white text-[#776B5D] hover:bg-white/90 border-white shadow-md"
                  asChild
                >
                  <Link href="/#lessons" className="flex items-center gap-2" scroll={false}>
                    <ArrowLeft className="h-4 w-4" />
                    <span>レッスン一覧に戻る</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  // 画像配列を取得（単一画像の場合は配列に変換）
  const images = lesson.images || []

  // カテゴリーでグループ化
  const lessonsByCategory = otherLessons.reduce(
    (acc, lesson) => {
      const category = lesson.category || "その他"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(lesson)
      return acc
    },
    {} as Record<string, typeof otherLessons>,
  )

  return (
    <main className="min-h-screen bg-[#C2B280] py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light tracking-wider text-white break-words leading-tight max-w-full">
            {lesson.name_ja}
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 sm:mt-0 rounded-full bg-white/20 text-white hover:bg-white/30 hover:text-white border-white/40 shadow-md"
            asChild
          >
            <Link href="/#lessons" className="flex items-center gap-2" scroll={false}>
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">レッスン一覧に戻る</span>
            </Link>
          </Button>
        </div>

        {/* モバイル向けタブ表示 */}
        {isMobile && (
          <Tabs defaultValue="details" className="mb-6">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="details">レッスン詳細</TabsTrigger>
              <TabsTrigger value="other-lessons">他のレッスン</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              {lesson.id === 8 ? (
                <InariumDetails lesson={lesson} />
              ) : (
                <LessonDetails
                  lesson={lesson}
                  images={images}
                  currentImage={currentImage}
                  setCurrentImage={setCurrentImage}
                  api={api}
                  setApi={setApi}
                />
              )}
            </TabsContent>
            <TabsContent value="other-lessons">
              <Card className="bg-white/90 backdrop-blur shadow-lg border-none">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg text-[#776B5D]">他のレッスンメニュー</CardTitle>
                  <CardDescription className="text-sm">他のレッスンも見てみませんか？</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {loadingOtherLessons ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#776B5D]"></div>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      {Object.entries(lessonsByCategory).map(([category, lessons]) => (
                        <div key={category} className="mb-4">
                          <h3 className="text-sm font-medium text-[#776B5D] mb-2">{category}</h3>
                          <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
                            {lessons.map((otherLesson) => (
                              <HorizontalLessonCard
                                key={otherLesson.id}
                                lesson={otherLesson}
                                currentLessonId={lesson.id}
                              />
                            ))}
                          </div>
                          <Separator className="my-3" />
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* タブレット・デスクトップ向けレイアウト */}
        {!isMobile && (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
            <div className="lg:col-span-2 space-y-6">
              {lesson.id === 8 ? (
                <InariumDetails lesson={lesson} />
              ) : (
                <LessonDetails
                  lesson={lesson}
                  images={images}
                  currentImage={currentImage}
                  setCurrentImage={setCurrentImage}
                  api={api}
                  setApi={setApi}
                />
              )}
            </div>

            {/* 他のレッスン一覧 - サイドバー */}
            <div className="lg:col-span-1">
              <Card className="bg-white/90 backdrop-blur shadow-lg border-none lg:sticky lg:top-4 overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg text-[#776B5D]">他のレッスンメニュー</CardTitle>
                  <CardDescription className="text-sm">他のレッスンも見てみませんか？</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {loadingOtherLessons ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#776B5D]"></div>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      {Object.entries(lessonsByCategory).map(([category, lessons]) => (
                        <div key={category} className="mb-4">
                          <h3 className="text-sm font-medium text-[#776B5D] mb-2">{category}</h3>
                          <div className="space-y-3">
                            {lessons.map((otherLesson) => (
                              <Link key={otherLesson.id} href={`/lessons/${otherLesson.id}`} className="block">
                                <Card className={`mb-3 transition-all hover:shadow-md bg-white/90`}>
                                  <CardContent className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden">
                                      <Image
                                        src={otherLesson.images?.[0]?.image_url || "/placeholder.svg"}
                                        alt={otherLesson.name_ja}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 64px, 80px"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                      <h4 className="text-sm sm:text-base font-medium text-[#776B5D] break-words mb-1">
                                        {otherLesson.name_ja}
                                      </h4>
                                      <div className="flex flex-wrap items-center gap-2">
                                        {otherLesson.category && (
                                          <Badge
                                            variant="outline"
                                            className="text-[0.65rem] sm:text-xs px-1 py-0 h-4 bg-[#776B5D]/5 text-[#776B5D] border-[#776B5D]/20"
                                          >
                                            {otherLesson.category}
                                          </Badge>
                                        )}
                                        <span className="text-xs sm:text-sm text-gray-500">{otherLesson.fee}</span>
                                      </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-[#776B5D] flex-shrink-0 ml-1" />
                                  </CardContent>
                                </Card>
                              </Link>
                            ))}
                          </div>
                          <Separator className="my-3" />
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full border-[#776B5D] text-[#776B5D] hover:bg-[#776B5D]/10"
                      asChild
                    >
                      <Link href="/#lessons" className="flex items-center justify-center gap-2" scroll={false}>
                        <span>レッスン一覧に戻る</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* モバイル向け - 他のレッスン横スクロール表示 */}
        {isMobile && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-light text-white">他のレッスンメニュー</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 p-1 h-auto"
                onClick={() => setShowOtherLessons(!showOtherLessons)}
              >
                {showOtherLessons ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>

            {showOtherLessons && (
              <div className="space-y-6">
                {loadingOtherLessons ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : (
                  Object.entries(lessonsByCategory).map(([category, lessons]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-white mb-3">{category}</h3>
                      <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
                        {lessons.map((otherLesson) => (
                          <HorizontalLessonCard key={otherLesson.id} lesson={otherLesson} currentLessonId={lesson.id} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

// レッスン詳細コンポーネント - 共通部分を抽出
function LessonDetails({
  lesson,
  images,
  currentImage,
  setCurrentImage,
  api,
  setApi,
}: {
  lesson: (typeof getDummyLessons)[0]
  images: any[]
  currentImage: number
  setCurrentImage: (index: number) => void
  api: any
  setApi: (api: any) => void
}) {
  const isMobile = useMediaQuery("(max-width: 640px)")

  return (
    <>
      <div className="space-y-3 md:space-y-4">
        <div className="relative rounded-lg overflow-hidden shadow-xl bg-white/10">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            setApi={(newApi) => {
              setApi(newApi)
              newApi?.on("select", () => {
                setCurrentImage(newApi.selectedScrollSnap())
              })
            }}
          >
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-square w-full">
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={`${lesson.name_ja} - 画像 ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index === 0}
                    />
                    {lesson.id === 4 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 text-right">
                        提供: komypasse
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10">
              <CarouselPrevious className="h-7 w-7 md:h-8 md:w-8" />
            </div>
            <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10">
              <CarouselNext className="h-7 w-7 md:h-8 md:w-8" />
            </div>
          </Carousel>
        </div>

        {/* サムネイルナビゲーション - レスポンシブ対応 */}
        {images.length > 1 && (
          <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                className={`relative w-14 h-14 md:w-20 md:h-20 rounded-md overflow-hidden flex-shrink-0 transition-all ${
                  currentImage === index ? "ring-2 ring-[#776B5D] ring-offset-2" : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => {
                  if (api) {
                    api.scrollTo(index)
                  }
                }}
              >
                <Image
                  src={image.image_url || "/placeholder.svg"}
                  alt={`${lesson.name_ja} - サムネイル ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 56px, 80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Card className="bg-white/90 backdrop-blur shadow-lg border-none">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-xl md:text-2xl text-[#776B5D]">{lesson.name_en}</CardTitle>
            <CardDescription className="text-base md:text-lg">{lesson.description}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
            {lesson.duration && (
              <div className="flex justify-between items-center text-base md:text-lg text-gray-700 mb-4 md:mb-6 border-t border-gray-100 pt-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  <span>所要時間: {lesson.duration}</span>
                </div>
              </div>
            )}

            <div className="space-y-3 md:space-y-4">
              <h3 className="text-lg md:text-xl font-medium text-[#776B5D]">特徴</h3>
              <ul className="space-y-2">
                {lesson.features?.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">{feature.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {lesson.plans && lesson.plans.length > 0 && (
          <Card className="bg-white/90 backdrop-blur shadow-lg border-none">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl text-[#776B5D]">料金プラン</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[70%]">プラン名</TableHead>
                      <TableHead className="text-right w-[30%]">料金</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lesson.plans.map((plan, index) => (
                      <TableRow key={index}>
                        <TableCell className="align-top">
                          <div className="space-y-1 md:space-y-2">
                            <div className="font-medium text-sm md:text-base">{plan.name}</div>
                            <div className="text-xs md:text-sm text-muted-foreground whitespace-normal">
                              {plan.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right align-top whitespace-nowrap">
                          <div className="flex items-center justify-end text-base md:text-lg font-bold text-[#776B5D]">
                            {lesson.id === 5 ? (
                              <span>要相談</span>
                            ) : (
                              <>
                                <Yen className="h-4 w-4 md:h-5 md:w-5 mr-1 flex-shrink-0" />
                                {typeof plan.price === "string" ? plan.price.replace("円", "") : plan.price}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 md:mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full bg-[#776B5D] text-white hover:bg-[#776B5D]/90 border-none shadow-md text-sm md:text-base"
                  asChild
                >
                  <Link href="/reservation" className="flex items-center justify-center gap-2">
                    <span>ご予約はこちら</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

// インアリウム専用のコンポーネント
function InariumDetails({ lesson }: { lesson: (typeof getDummyLessons)[0] }) {
  const [showDetails, setShowDetails] = useState(false)

  // 詳細情報が表示されたときに、そのセクションまでスクロール
  useEffect(() => {
    if (showDetails) {
      const detailsSection = document.getElementById("details-section")
      if (detailsSection) {
        detailsSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [showDetails])

  return (
    <>
      {/* 基本情報 */}
      <div className="bg-white/90 backdrop-blur shadow-lg rounded-lg p-6 md:p-8 text-center mb-6">
        <h2 className="text-2xl font-medium text-[#776B5D] mb-4">インアリウム基本情報</h2>

        {/* 画像ギャラリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {lesson.images?.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={image.image_url || "/placeholder.svg"}
                alt={`インアリウム作品例 ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>

        <p className="text-gray-700 mb-6">{lesson.description}</p>
        <Button
          className="rounded-full bg-[#776B5D] text-white hover:bg-[#776B5D]/90 border-none shadow-md"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              詳細情報を閉じる
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              詳細情報を見る
            </>
          )}
        </Button>
      </div>

      {/* 詳細情報（トグル表示） */}
      {showDetails && (
        <div
          id="details-section"
          className="bg-white/90 backdrop-blur shadow-lg rounded-lg p-6 md:p-8 animate-in fade-in duration-300"
        >
          <h2 className="text-2xl font-medium text-[#776B5D] mb-4 text-center">インアリウム詳細情報</h2>
          <Card className="bg-[#776B5D]/5 border-none mb-6">
            <CardContent className="p-6">
              <ScrollArea className="h-[200px] rounded-md">
                <div className="text-gray-700 text-center whitespace-pre-line">{lesson.detail_info}</div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 詳細コンテンツ */}
          <div className="space-y-6 mb-8">
            <div className="bg-[#776B5D]/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-[#776B5D] mb-2">特徴</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                {lesson.features?.map((feature, index) => (
                  <li key={index}>{feature.content}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#776B5D]/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-[#776B5D] mb-2">オーダー方法</h3>
              <p className="text-gray-700 mb-2">
                インアリウムは制作に高度な技術と時間を要するため、オーダー制作のみとなります。
                ご希望のデザインや用途に合わせてカスタマイズいたします。
              </p>
              <p className="text-gray-700">詳細な料金やデザインについては、LINEにてお問い合わせください。</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="rounded-full bg-white text-[#776B5D] hover:bg-white/90 border-white shadow-md"
              onClick={() => setShowDetails(false)}
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              <span>詳細情報を閉じる</span>
            </Button>

            <Button
              className="rounded-full bg-[#776B5D] text-white hover:bg-[#776B5D]/90 border-none shadow-md"
              asChild
            >
              <Link href="/reservation" className="flex items-center justify-center gap-2">
                <span>お問い合わせはこちら</span>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

// モバイル向けの横スクロールレッスンカード
function HorizontalLessonCard({
  lesson,
  currentLessonId,
}: { lesson: (typeof getDummyLessons)[0]; currentLessonId: number }) {
  const isCurrentLesson = lesson.id === currentLessonId

  return (
    <Link href={`/lessons/${lesson.id}`} className="block flex-shrink-0 w-[200px]">
      <Card
        className={`h-full transition-all hover:shadow-md ${isCurrentLesson ? "bg-[#776B5D]/10 border-[#776B5D]/30" : "bg-white/90"}`}
      >
        <CardContent className="p-3 flex flex-col h-full">
          <div className="relative w-full aspect-square rounded-md overflow-hidden mb-2">
            <Image
              src={lesson.images?.[0]?.image_url || "/placeholder.svg"}
              alt={lesson.name_ja}
              fill
              className="object-cover"
              sizes="200px"
            />
            {isCurrentLesson && (
              <div className="absolute inset-0 bg-[#776B5D]/30 flex items-center justify-center">
                <span className="text-xs font-medium text-white bg-[#776B5D] px-2 py-1 rounded">現在表示中</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-[#776B5D] truncate">{lesson.name_ja}</h4>
            <div className="flex items-center mt-1 mb-2">
              {lesson.category && (
                <Badge
                  variant="outline"
                  className="text-[0.65rem] px-1 py-0 h-4 bg-[#776B5D]/5 text-[#776B5D] border-[#776B5D]/20"
                >
                  {lesson.category}
                </Badge>
              )}
              <span className="text-xs text-gray-500 ml-2">{lesson.fee}</span>
            </div>
          </div>
          {!isCurrentLesson && (
            <div className="flex justify-end">
              <ArrowRight className="h-4 w-4 text-[#776B5D]" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
