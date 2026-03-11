"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Trash2, Star, ArrowLeft } from "lucide-react"
import type { PremiumLessonWithFeatures } from "@/lib/premium-lesson-types"
import { getPremiumLessons, deletePremiumLesson } from "@/app/actions/premium-lesson-actions"
import { useToast } from "@/components/ui/use-toast"

export default function PremiumLessonsPage() {
  const [premiumLessons, setPremiumLessons] = useState<PremiumLessonWithFeatures[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPremiumLessons = async () => {
      try {
        const data = await getPremiumLessons()
        setPremiumLessons(data)
      } catch (error) {
        console.error("プレミアムレッスンの取得に失敗しました:", error)
        toast({
          title: "エラー",
          description: "プレミアムレッスンの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPremiumLessons()
  }, [toast])

  const handleDelete = async (id: number) => {
    if (confirm("このプレミアムレッスンを削除してもよろしいですか？")) {
      setDeleting(id)
      try {
        const result = await deletePremiumLesson(id)
        if (result.success) {
          setPremiumLessons(premiumLessons.filter((lesson) => lesson.id !== id))
          toast({
            title: "削除完了",
            description: "プレミアムレッスンが削除されました",
          })
        } else {
          toast({
            title: "エラー",
            description: result.error || "プレミアムレッスンの削除に失敗しました",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("プレミアムレッスンの削除中にエラーが発生しました:", error)
        toast({
          title: "エラー",
          description: "プレミアムレッスンの削除中にエラーが発生しました",
          variant: "destructive",
        })
      } finally {
        setDeleting(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d9c1e6] to-[#e8dcef]">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-wider text-[#4A2B82]">プレミアムレッスン管理</h1>
            <p className="text-[#4A2B82]/70 mt-2">七色星花アレンジメントの管理</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>管理トップに戻る</span>
              </Link>
            </Button>
            <Button size="sm" className="rounded-full bg-[#4A2B82] hover:bg-[#4A2B82]/90" asChild>
              <Link href="/admin/premium-lessons/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>新規作成</span>
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="my-6 bg-[#4A2B82]/20" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/50 border-none shadow animate-pulse">
                <CardHeader className="h-40 bg-gray-200" />
                <CardContent className="py-4">
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : premiumLessons.length === 0 ? (
          <Card className="bg-white/50 border-none shadow">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-[#4A2B82]/30 mb-4" />
              <h3 className="text-xl font-medium text-[#4A2B82] mb-2">プレミアムレッスンがありません</h3>
              <p className="text-[#4A2B82]/70 mb-6 text-center">
                七色星花アレンジメントのプレミアムレッスンを追加してください
              </p>
              <Button className="bg-[#4A2B82] hover:bg-[#4A2B82]/90" asChild>
                <Link href="/admin/premium-lessons/new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>新規プレミアムレッスンを作成</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumLessons.map((lesson) => (
              <Card
                key={lesson.id}
                className="bg-white/50 border-none shadow overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={lesson.image_url || "/placeholder.svg"}
                    alt={lesson.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-[#4A2B82]">{lesson.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A2B82]/70">価格:</span>
                    <span className="font-medium text-[#4A2B82]">{lesson.price}</span>
                  </div>
                  {lesson.size && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-[#4A2B82]/70">サイズ:</span>
                      <span className="font-medium text-[#4A2B82]">{lesson.size}</span>
                    </div>
                  )}
                  <div className="mt-3">
                    <span className="text-sm text-[#4A2B82]/70">特徴:</span>
                    <ul className="mt-1 text-sm space-y-1">
                      {lesson.features?.slice(0, 2).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="h-3 w-3 text-[#4A2B82] mt-1 shrink-0" />
                          <span className="line-clamp-1">{feature.content}</span>
                        </li>
                      ))}
                      {(lesson.features?.length || 0) > 2 && (
                        <li className="text-[#4A2B82]/70 text-xs">他 {(lesson.features?.length || 0) - 2} 件...</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#4A2B82] border-[#4A2B82]/30 hover:bg-[#4A2B82]/10"
                    asChild
                  >
                    <Link href={`/admin/premium-lessons/${lesson.id}`} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <span>編集</span>
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(lesson.id)}
                    disabled={deleting === lesson.id}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {deleting === lesson.id ? (
                      <span>削除中...</span>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span>削除</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
