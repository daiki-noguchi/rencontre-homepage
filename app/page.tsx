"use client"

import { useEffect } from "react"
import TopSection from "@/components/sections/top-section"
import AboutSection from "@/components/sections/about-section"
import InformationSection from "@/components/sections/information-section"
import ConceptSection from "@/components/sections/concept-section"
import SimpleLessonsSection from "@/components/sections/simple-lessons-section" // サーバーコンポーネント
import AccessSection from "@/components/sections/access-section"
import Footer from "@/components/footer"
import { BackToTop } from "@/components/back-to-top"
import PremiumLessonSection from "@/components/sections/premium-lesson-section"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // ページがマウントされたときに、ページトップにスクロール
    window.scrollTo(0, 0)

    // ハッシュがある場合は、対応する要素にスクロール
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.substring(1)
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#cee6c1]">
      <TopSection />
      <AboutSection />
      <InformationSection />
      <ConceptSection />
      <SimpleLessonsSection />
      <PremiumLessonSection />
      <AccessSection />
      <Footer />
      <BackToTop />
    </main>
  )
}
