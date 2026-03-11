"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Heart, Users, Sparkles, Music, Flower, ShoppingBag, Home, User } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export default function AboutSection() {
  const [isClient, setIsClient] = useState(false)
  const [motionEnabled, setMotionEnabled] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // モーション設定
    try {
      setMotionEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    } catch (e) {
      console.warn("window.matchMedia is not supported in this environment.")
    }
  }, [])

  // サーバーサイドレンダリング時は簡易表示
  if (!isClient) {
    return (
      <section id="about" className="bg-[#cee6c1] text-[#4A4A4A] py-20 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-12 tracking-wider text-[#2E5A1C]">
            WELCOME
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur shadow-lg border-none h-full">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit bg-[#2E5A1C]/10 text-[#2E5A1C] border-[#2E5A1C]/20">
                  About Us
                </Badge>
                <CardTitle className="text-2xl text-[#2E5A1C] mt-2">Rencontreのおうち教室へようこそ</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="about" className="bg-[#cee6c1] text-[#4A4A4A] py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {motionEnabled ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-12 tracking-wider text-[#2E5A1C]">
              WELCOME
            </h2>
          </motion.div>
        ) : (
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-12 tracking-wider text-[#2E5A1C]">
            WELCOME
          </h2>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {motionEnabled ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/90 backdrop-blur shadow-lg border-none h-full">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit bg-[#2E5A1C]/10 text-[#2E5A1C] border-[#2E5A1C]/20">
                    About Us
                  </Badge>
                  <CardTitle className="text-2xl text-[#2E5A1C] mt-2">Rencontreのおうち教室へようこそ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <User className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                      <p className="text-gray-700">Rencontreの野口美穂と申します。</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Flower className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                      <p className="text-gray-700">季節ごとのお花を取り入れて、ドライフラワーを作成しています</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <ShoppingBag className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                      <p className="text-gray-700">フラワーアレンジメントや花雑貨を制作・販売しています</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Home className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                      <p className="text-gray-700">おうち教室でレッスンを行っております</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="bg-white/90 backdrop-blur shadow-lg border-none h-full">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit bg-[#2E5A1C]/10 text-[#2E5A1C] border-[#2E5A1C]/20">
                  About Us
                </Badge>
                <CardTitle className="text-2xl text-[#2E5A1C] mt-2">Rencontreのおうち教室へようこそ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <User className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                    <p className="text-gray-700">Rencontreの野口美穂と申します。</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Flower className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                    <p className="text-gray-700">季節ごとのお花を取り入れて、ドライフラワーを作成しています</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <ShoppingBag className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                    <p className="text-gray-700">フラワーアレンジメントや花雑貨を制作・販売しています</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Home className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                    <p className="text-gray-700">おうち教室でレッスンを行っておりま���������</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {motionEnabled ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur shadow-lg border-none h-full">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit bg-[#2E5A1C]/10 text-[#2E5A1C] border-[#2E5A1C]/20">
                    Our Philosophy
                  </Badge>
                  <CardTitle className="text-2xl text-[#2E5A1C] mt-2">自分の時間、過ごせていますか？</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Sparkles className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                    <p className="text-gray-600">
                      誰かの為に忙しく過ごす日常から、ほんのひと時抜け出してご褒美のような時間を、Rencontreのおうち教室で過ごして欲しい。
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Music className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                    <p className="text-gray-600">お花に包まれて、オルゴールが流れる空間で癒されながら作品作り。</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Users className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                    <p className="text-gray-600">４人までの少人数制です。お友達とご家族とお一人様でも。</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Heart className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                    <p className="text-gray-600">日常に彩りと癒しをお届けしたい</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="bg-white/90 backdrop-blur shadow-lg border-none h-full">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit bg-[#2E5A1C]/10 text-[#2E5A1C] border-[#2E5A1C]/20">
                  Our Philosophy
                </Badge>
                <CardTitle className="text-2xl text-[#2E5A1C] mt-2">自分の時間、過ごせていますか？</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Sparkles className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                  <p className="text-gray-600">
                    誰かの為に忙しく過ごす日常から、ほんのひと時抜け出してご褒美のような時間を、Rencontreのおうち教室で過ごして欲しい。
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Music className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                  <p className="text-gray-600">お花に包まれて、オルゴールが流れる空間で癒されながら作品作り。</p>
                </div>

                <div className="flex items-center gap-4">
                  <Users className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                  <p className="text-gray-600">４人までの少人数制です。お友達とご家族とお一人様でも。</p>
                </div>

                <div className="flex items-center gap-4">
                  <Heart className="h-6 w-6 text-[#2E5A1C] flex-shrink-0" />
                  <p className="text-gray-600">日常に彩りと癒しをお届けしたい</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {motionEnabled ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8"
          >
            <Card className="bg-white/90 backdrop-blur shadow-lg border-none">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit bg-[#2E5A1C]/10 text-[#2E5A1C] border-[#2E5A1C]/20">
                  Information
                </Badge>
                <CardTitle className="text-2xl text-[#2E5A1C] mt-2">営業情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#2E5A1C] flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-medium text-[#4A4A4A]">営業時間</h3>
                      <p className="text-gray-600">１０：００～１６：００</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#2E5A1C] flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-medium text-[#4A4A4A]">営業日</h3>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-[#2E5A1C] hover:text-[#2E5A1C]/80 underline decoration-[#2E5A1C]/70 underline-offset-2"
                        asChild
                      >
                        <Link href="/reservation" className="flex items-center gap-1.5" scroll={false}>
                          <span>カレンダーをご参照ください</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">
                  ※ レッスンは完全予約制となっております。ご希望の日時をLINEにてお問い合わせください。
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <div className="mt-8">
            <Card className="bg-white/90 backdrop-blur shadow-lg border-none">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit bg-[#2E5A1C]/10 text-[#2E5A1C] border-[#2E5A1C]/20">
                  Information
                </Badge>
                <CardTitle className="text-2xl text-[#2E5A1C] mt-2">営業情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#2E5A1C] flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-medium text-[#4A4A4A]">営業時間</h3>
                      <p className="text-gray-600">１０：００～１６：００</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#2E5A1C] flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-medium text-[#4A4A4A]">営業日</h3>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-[#2E5A1C] hover:text-[#2E5A1C]/80 underline decoration-[#2E5A1C]/70 underline-offset-2"
                        asChild
                      >
                        <Link href="/reservation" className="flex items-center gap-1.5" scroll={false}>
                          <span>カレンダーをご参照ください</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">
                  ※ レッスンは完全予約制となっております。ご希望の日時をLINEにてお問い合わせください。
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
