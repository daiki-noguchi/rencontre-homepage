"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// ギャラリー画像の配列
const galleryImages = [
  {
    src: "/images/gallery/image1.jpg",
    alt: "フラワーアレンジメント作品1",
    fallback: "/placeholder.svg?height=600&width=800",
  },
  {
    src: "/images/gallery/image2.jpg",
    alt: "フラワーアレンジメント作品2",
    fallback: "/placeholder.svg?height=600&width=800",
  },
  {
    src: "/images/gallery/image3.jpg",
    alt: "フラワーアレンジメント作品3",
    fallback: "/placeholder.svg?height=600&width=800",
  },
  {
    src: "/images/gallery/image4.jpg",
    alt: "フラワーアレンジメント作品4",
    fallback: "/placeholder.svg?height=600&width=800",
  },
  {
    src: "/images/gallery/image5.jpg",
    alt: "フラワーアレンジメント作品5",
    fallback: "/placeholder.svg?height=600&width=800",
  },
  {
    src: "/images/gallery/image6.jpg",
    alt: "フラワーアレンジメント作品6",
    fallback: "/placeholder.svg?height=600&width=800",
  },
]

export default function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState<Record<number, boolean>>({})

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1))
  }

  const handleImageError = (index: number) => {
    setImageError((prev) => ({ ...prev, [index]: true }))
  }

  return (
    <section id="gallery" className="bg-[#F9F7F4] py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-12 tracking-wider text-[#2E5A1C]">
          GALLERY
        </h2>

        <div className="relative max-w-4xl mx-auto">
          <Card className="border-none shadow-lg overflow-hidden bg-white">
            <CardContent className="p-0 relative aspect-[4/3]">
              <div className="relative w-full h-full">
                <Image
                  src={
                    imageError[currentIndex] ? galleryImages[currentIndex].fallback : galleryImages[currentIndex].src
                  }
                  alt={galleryImages[currentIndex].alt}
                  fill
                  className="object-cover transition-opacity duration-500"
                  onError={() => handleImageError(currentIndex)}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-[#2E5A1C] rounded-full h-10 w-10"
                onClick={prevSlide}
                aria-label="前の画像"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-[#2E5A1C] rounded-full h-10 w-10"
                onClick={nextSlide}
                aria-label="次の画像"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${currentIndex === index ? "bg-[#2E5A1C]" : "bg-gray-300"}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`画像 ${index + 1} に移動`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
