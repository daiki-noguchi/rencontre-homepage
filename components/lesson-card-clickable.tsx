"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Clock, JapaneseYenIcon as Yen, ArrowRight, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { LessonWithRelations } from "@/lib/lesson-types"

interface LessonCardProps {
  lesson: LessonWithRelations
}

export function LessonCardClickable({ lesson }: LessonCardProps) {
  // データの安全性チェック
  if (!lesson) {
    return null
  }

  // メイン画像URLを取得するヘルパー関数
  const getMainImageUrl = (): string => {
    if (!lesson.images || lesson.images.length === 0) {
      return "/placeholder.svg?height=400&width=600"
    }

    const mainImage = lesson.images.find((img) => img.is_main)
    return mainImage ? mainImage.image_url : lesson.images[0].image_url
  }

  return (
    <Link href={`/lessons/${lesson.id}`} className="block h-full">
      <Card className="bg-white/90 backdrop-blur shadow-lg overflow-hidden border-none h-full transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative w-full aspect-video md:aspect-[4/3] lg:aspect-[16/9]">
            <Image
              src={getMainImageUrl() || "/placeholder.svg"}
              alt={lesson.name_ja || "レッスン画像"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* カテゴリーバッジ */}
            {lesson.category && (
              <div className="absolute top-2 left-2 z-20">
                <Badge variant="secondary" className="bg-white/80 text-[#2E5A1C] hover:bg-white">
                  {lesson.category}
                </Badge>
              </div>
            )}

            {lesson.is_order_only && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 text-xs font-bold z-20 rounded-md">
                オーダーのみ
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col flex-1">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-medium mb-1 line-clamp-2 text-[#2E5A1C]">
                {lesson.name_ja || "レッスン名"}
              </CardTitle>
              <CardDescription className="text-sm">{lesson.name_en || ""}</CardDescription>
            </CardHeader>

            <div className="flex-1 flex flex-col">
              <p className={`text-sm text-gray-600 mb-6 ${!lesson.is_order_only ? "line-clamp-3" : ""}`}>
                {lesson.description || "詳細はお問い合わせください。"}
              </p>

              <CardFooter className="p-0 mt-auto flex flex-col gap-4">
                {!lesson.is_order_only && (
                  <div className="grid grid-cols-2 gap-2 w-full text-sm text-gray-700 border-t border-gray-100 pt-4">
                    {lesson.duration && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-[#2E5A1C]" />
                        <span>{lesson.duration}</span>
                      </div>
                    )}
                    {lesson.fee && (
                      <div className="flex items-center">
                        <Yen className="h-4 w-4 mr-1.5 text-[#2E5A1C]" />
                        <span>{lesson.fee}</span>
                      </div>
                    )}
                    {lesson.capacity && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1.5 text-[#2E5A1C]" />
                        <span>{lesson.capacity}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end items-center w-full">
                  <div className="text-xs text-[#2E5A1C] font-medium flex items-center">
                    {lesson.is_order_only ? "詳細を見る" : "料金プランを見る"}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </div>
              </CardFooter>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
