"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllLessons, deleteLesson } from "../../actions/lesson-actions"
import type { LessonWithRelations } from "@/lib/lesson-types"

export default function AdminLessonsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [lessons, setLessons] = useState<LessonWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  // レッスン一覧を取得
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true)
        const data = await getAllLessons()
        setLessons(data)
      } catch (error) {
        console.error("レッスンの取得中にエラーが発生しました:", error)
        toast({
          title: "エラーが発生しました",
          description: "レッスンの読み込みに失敗しました。",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [toast])

  // レッスンを削除
  const handleDeleteLesson = async (id: number) => {
    if (!confirm("このレッスンを削除してもよろしいですか？この操作は元に戻せません。")) {
      return
    }

    try {
      setDeleting(id)
      const result = await deleteLesson(id)

      if (result.success) {
        toast({
          title: "レッスンを削除しました",
          description: "レッスンが正常に削除されました。",
        })
        // 一覧を更新
        setLessons((prevLessons) => prevLessons.filter((lesson) => lesson.id !== id))
      } else {
        throw new Error(result.error || "削除中にエラーが発生しました")
      }
    } catch (error) {
      console.error("レッスンの削除中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "レッスンの削除に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  // メイン画像URLを取得するヘルパー関数
  const getMainImageUrl = (lesson: LessonWithRelations): string => {
    if (!lesson.images || lesson.images.length === 0) {
      return "/placeholder.svg?height=48&width=48"
    }

    const mainImage = lesson.images.find((img) => img.is_main)
    return mainImage ? mainImage.image_url : lesson.images[0].image_url
  }

  return (
    <main className="min-h-screen bg-[#cee6c1] py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wider text-[#2E5A1C] break-words leading-tight max-w-full">
            レッスン管理
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-white/20 text-[#2E5A1C] hover:bg-white/30 hover:text-[#2E5A1C] border-[#2E5A1C]/40 shadow-md"
              asChild
            >
              <Link href="/admin" className="flex items-center gap-2" scroll={false}>
                <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">管理トップに戻る</span>
              </Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="rounded-full bg-[#2E5A1C] hover:bg-[#2E5A1C]/90 shadow-md"
              asChild
            >
              <Link href="/admin/lessons/new" className="flex items-center gap-2">
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">新規レッスン</span>
              </Link>
            </Button>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur shadow-lg border-none overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-[#2E5A1C]">レッスン一覧</CardTitle>
            <CardDescription>登録されているレッスンを管理します。</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">画像</TableHead>
                      <TableHead>レッスン名</TableHead>
                      <TableHead>カテゴリー</TableHead>
                      <TableHead>料金</TableHead>
                      <TableHead>時間</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          レッスンが登録されていません
                        </TableCell>
                      </TableRow>
                    ) : (
                      lessons.map((lesson) => (
                        <TableRow key={lesson.id}>
                          <TableCell>
                            <div className="relative w-10 h-10 rounded-md overflow-hidden">
                              <img
                                src={getMainImageUrl(lesson) || "/placeholder.svg"}
                                alt={lesson.name_ja}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <p className="text-[#2E5A1C]">{lesson.name_ja}</p>
                              <p className="text-xs text-gray-500">{lesson.name_en}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {lesson.category && (
                              <Badge variant="outline" className="bg-[#2E5A1C]/10 text-[#2E5A1C] border-[#2E5A1C]/20">
                                {lesson.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{lesson.fee}</TableCell>
                          <TableCell>{lesson.duration}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => router.push(`/admin/lessons/${lesson.id}`)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">編集</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                disabled={deleting === lesson.id}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">削除</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
            <p>合計: {lessons.length} レッスン</p>
            <p>最終更新: {new Date().toLocaleDateString("ja-JP")}</p>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
