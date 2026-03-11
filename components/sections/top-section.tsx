"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, ChevronLeft, ChevronRight, X } from "lucide-react"
import { LineIcon } from "@/components/icons/line-icon"
import { cn } from "@/lib/utils"
import Link from "next/link"

const images = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_8262.JPG-mlMUz1gV4427A5XSGxhwwD1hhN0Pud.jpeg", // ナチュラルアレンジメント
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_8260.JPG-yEanEfRM4Yf3IDnTVm3IZENQWQ8w1D.jpeg", // 壁掛けアレンジメント
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_8261.JPG-WmJrrzhkhxRFf7GlBbXVhOue1bQrnd.jpeg", // ピンクシャクヤク
]

export default function TopSection() {
  const [currentImage, setCurrentImage] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById("mobile-menu")
      if (isMenuOpen && menu && !menu.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  // メニュー項目をクリックしたときにメニューを閉じる関数
  const handleMenuItemClick = () => {
    setIsMenuOpen(false)
  }

  // メニューを開く/閉じる関数
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
          isScrolled ? "bg-[#1F2937]/90 backdrop-blur-sm shadow-lg" : "bg-transparent",
          "py-4 px-4 md:px-6",
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="w-[120px] md:w-[160px]"></div>

          {/* ヘッダー内のタイトル - スクロール時に表示 */}
          <div className="text-center">
            <h2
              className={cn(
                "font-bold text-white drop-shadow-md transition-all duration-300",
                "text-2xl md:text-3xl",
                isScrolled ? "opacity-100 scale-100" : "opacity-0 scale-90",
              )}
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Rencontre
            </h2>
          </div>

          <div className="w-[120px] md:w-[160px] flex justify-end">
            <Button
              variant="outline"
              className={cn(
                "relative overflow-hidden group",
                "rounded-full border-2 shadow-lg",
                "transition-all duration-300 ease-in-out",
                // モバイルではコンパクトに、デスクトップでは元のサイズを維持
                "p-0 md:px-4 md:py-2",
                // min-w-[100px]を削除し、モバイルでの最小幅を設定
                "w-12 h-12 md:w-auto md:h-auto md:min-w-[100px]",
                isScrolled
                  ? "bg-white text-[#1F2937] border-white hover:bg-white/90"
                  : "bg-white/20 text-white border-white/40 hover:bg-white/30 hover:border-white",
                isMenuOpen && "bg-white text-[#1F2937] border-white",
              )}
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative z-10 flex items-center gap-2">
                <Menu className="h-6 w-6 md:h-5 md:w-5" />
                <span className="text-sm font-medium hidden md:inline">Menu</span>
              </div>
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-300",
                  "bg-white scale-100 group-hover:scale-110",
                  "origin-center transform",
                  isScrolled ? "opacity-0" : "opacity-10",
                  "group-hover:opacity-20",
                )}
              />
            </Button>
          </div>
        </div>
      </header>

      {/* カスタムモバイルメニュー */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full sm:max-w-md",
          "bg-gradient-to-br from-[#1F2937] to-[#374151]",
          "transform transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
          "flex flex-col",
          "shadow-xl",
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mt-8 mb-8">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-cormorant)" }}>
              Rencontre
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">閉じる</span>
            </Button>
          </div>
          <nav className="grid gap-2 text-white">
            <a
              href="#information"
              className="text-xl hover:text-white/90 transition-all relative group px-4 py-3"
              onClick={handleMenuItemClick}
            >
              <span className="relative z-10">インフォメーション</span>
              <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" />
            </a>
            <a
              href="#lessons"
              className="text-xl hover:text-white/90 transition-all relative group px-4 py-3"
              onClick={handleMenuItemClick}
            >
              <span className="relative z-10">レッスンメニュー</span>
              <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" />
            </a>
            <a
              href="https://minne.com/@biglove-25"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:text-white/90 transition-all relative group px-4 py-3"
              onClick={handleMenuItemClick}
            >
              <span className="relative z-10">オンラインshop</span>
              <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" />
            </a>
            <a
              href="https://www.instagram.com/cafeserendipity0527/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:text-white/90 transition-all relative group px-4 py-3"
              onClick={handleMenuItemClick}
            >
              <span className="relative z-10">委託販売先</span>
              <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" />
            </a>
            <a
              href="https://page.line.me/gtf0394w"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl hover:text-white/90 transition-all relative group px-4 py-3"
              onClick={handleMenuItemClick}
            >
              <span className="relative z-10">お問い合わせ</span>
              <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" />
            </a>
            <Link
              href="/reservation"
              className="text-xl hover:text-white/90 transition-all relative group px-4 py-3"
              onClick={handleMenuItemClick}
              scroll={false}
            >
              <span className="relative z-10">ご予約方法</span>
              <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" />
            </Link>
            <a
              href="#access"
              className="text-xl hover:text-white/90 transition-all relative group px-4 py-3"
              onClick={handleMenuItemClick}
            >
              <span className="relative z-10">おうち教室情報</span>
              <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" />
            </a>
          </nav>
          <div className="mt-auto mb-8">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full bg-white text-[#1F2937] hover:bg-white/90 hover:text-[#1F2937] border-white shadow-md h-12 w-full"
              asChild
            >
              <a
                href="https://page.line.me/gtf0394w"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <LineIcon className="h-8 w-8" bgColor="#1F2937" iconColor="white" />
                <span className="text-base">ご予約・お問い合わせ</span>
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* オーバーレイ */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
      )}

      <div className="relative h-screen w-full overflow-hidden">
        {images.map((src, index) => (
          <div
            key={index}
            className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
            style={{ opacity: currentImage === index ? 1 : 0 }}
          >
            <Image
              src={src || "/placeholder.svg"}
              alt={`Flower arrangement ${index + 1}`}
              fill
              className="object-cover w-full h-full"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}

        {/* メインタイトル - 画像の中央に配置 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <h1
            className="font-bold text-white drop-shadow-lg text-6xl md:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Rencontre
          </h1>
          <p className="text-white/90 tracking-wider mt-3 text-base md:text-lg drop-shadow-md">ランコントル</p>
        </div>

        <div className="absolute inset-x-0 bottom-10 flex justify-center gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                currentImage === index ? "w-6 bg-white" : "bg-white/60"
              }`}
              onClick={() => setCurrentImage(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white border-none shadow-sm z-10"
          onClick={prevImage}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white border-none shadow-sm z-10"
          onClick={nextImage}
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}
