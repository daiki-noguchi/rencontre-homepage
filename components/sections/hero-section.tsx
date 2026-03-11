"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* 背景画像 */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/hero-bg.jpg"
            alt="森の音フラワーアレンジメント教室"
            fill
            priority
            className={`object-cover transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            onError={() => {
              // 画像読み込みエラー時のフォールバック
              console.error("ヒーロー画像の読み込みに失敗しました")
              setLoaded(true) // エラーでも表示を続行
            }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-wider">森の音</h1>
        <p className="text-xl md:text-2xl mb-8 font-light tracking-wide">
          自然の美しさを活かしたフラワーアレンジメント教室
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-[#2E5A1C] hover:bg-[#1F3D12] text-white border-none">
            <Link href="#contact">お問い合わせ</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-transparent text-white border-white hover:bg-white/10"
          >
            <Link href="#about">教室について</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
