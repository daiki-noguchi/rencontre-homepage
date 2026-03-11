"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ArrowRight, Star, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import type { PremiumLessonWithFeatures } from "@/lib/premium-lesson-types"
import { getPremiumLessons } from "@/app/actions/premium-lesson-actions"

// コンポーネントを更新
export default function PremiumLessonSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [premiumLessons, setPremiumLessons] = useState<PremiumLessonWithFeatures[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPremiumLessons = async () => {
      try {
        const data = await getPremiumLessons()
        setPremiumLessons(data)
      } catch (error) {
        console.error("プレミアムレッスンの取得に失敗しました:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPremiumLessons()
  }, [])

  // データがない場合はダミーデータを使用
  const displayLessons =
    premiumLessons.length > 0
      ? premiumLessons
      : [
          {
            id: 1,
            title: "丸リース",
            description:
              "鮮やかなピンク、パープル、ブルーのグラデーションが特徴的な丸型リース。カーネーション、バラ、小花を贅沢に使用し、華やかで存在感のある作品に仕上げています。",
            size: "直径20cm〜30cm",
            price: "6,000円〜8,000円",
            image_url:
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-03-15%200.27.07-qVfXrbrFJ4OyvbKBHbV2CKdrDLmBnK.png",
            created_at: "",
            features: [
              { id: 1, premium_lesson_id: 1, content: "華やかな色彩が空間を彩ります", sort_order: 0, created_at: "" },
              { id: 2, premium_lesson_id: 1, content: "季節を問わず飾れるデザイン", sort_order: 1, created_at: "" },
            ],
          },
        ]

  return (
    <section id="premium-lesson" className="bg-[#d9c1e6] text-white py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1 text-sm font-medium bg-white/10 text-white border-white/30"
          >
            PREMIUM
          </Badge>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-2 tracking-wider text-[#4A2B82]">
            七色星花
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 tracking-wider text-[#4A2B82]">
            (なないろほしか)
          </h3>
          <p className="text-lg text-[#4A2B82]/90 max-w-2xl mx-auto">
            生花のような鮮やかさを持つ七色星花を使用した、当教室でしか体験できない特別なアレンジメントです。
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
              setApi={(api) => {
                api?.on("select", () => {
                  setCurrentSlide(api.selectedScrollSnap())
                })
              }}
            >
              <CarouselContent>
                {displayLessons.map((lesson, index) => (
                  <CarouselItem key={lesson.id}>
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                      <Image
                        src={lesson.image_url || "/placeholder.svg"}
                        alt={`七色星花アレンジメント - ${lesson.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <CarouselPrevious className="bg-white/20 hover:bg-white/30 border-white/40" />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <CarouselNext className="bg-white/20 hover:bg-white/30 border-white/40" />
              </div>
            </Carousel>

            <div className="flex justify-center gap-2 mt-4">
              {displayLessons.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? "w-6 bg-white" : "bg-white/60"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/20 backdrop-blur shadow-lg border-none">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-[#4A2B82]" />
                  <span className="text-[#4A2B82] font-medium">特別レッスン</span>
                </div>
                <CardTitle className="text-2xl mb-2 text-[#4A2B82]">{displayLessons[currentSlide].title}</CardTitle>
                <CardDescription className="text-[#4A2B82]/90">
                  {displayLessons[currentSlide].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-[#4A2B82]/70">サイズ</p>
                    <p className="text-lg text-[#4A2B82]">{displayLessons[currentSlide].size}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[#4A2B82]/70">料金</p>
                    <p className="text-lg text-[#4A2B82]">{displayLessons[currentSlide].price}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#4A2B82]/20">
                  <h3 className="text-lg font-medium mb-3 text-[#4A2B82]">レッスンの特徴</h3>
                  <ul className="space-y-2">
                    {displayLessons[currentSlide].features?.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-[#4A2B82]" />
                        <span className="text-[#4A2B82]">{feature.content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full bg-[#4A2B82] text-white hover:bg-[#4A2B82]/90 border-none shadow-md"
                  asChild
                >
                  <Link href="/reservation" className="flex items-center justify-center gap-2">
                    <span>レッスンのご予約</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
