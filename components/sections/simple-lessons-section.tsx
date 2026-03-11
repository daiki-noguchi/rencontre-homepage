"use client"

import { useState, useEffect, useCallback } from "react"
import { getSimpleLessons } from "@/app/actions/simple-lesson-actions"
import { SimpleLessonsClient } from "./simple-lessons-client"
import { DUMMY_LESSONS } from "@/lib/lesson-types-simple"

export default function SimpleLessonsSection() {
  const [lessons, setLessons] = useState(DUMMY_LESSONS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // データ取得関数
  const fetchLessons = useCallback(async () => {
    if (!mounted) return

    setLoading(true)
    setError(null)

    try {
      console.log("SimpleLessonsSection: レッスンデータの取得を開始します")
      const data = await getSimpleLessons()

      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`SimpleLessonsSection: ${data.length}件のレッスンデータを取得しました`)
        setLessons(data)
      } else {
        console.warn("SimpleLessonsSection: データが空のためフォールバックデータを使用します")
        setLessons(DUMMY_LESSONS)
      }
    } catch (error) {
      console.error("SimpleLessonsSection: データ取得中にエラーが発生しました:", error)
      setError("データの取得に失敗しました")
      // エラー時はフォールバックデータを使用
      setLessons(DUMMY_LESSONS)
    } finally {
      setLoading(false)
    }
  }, [mounted])

  // マウント時の処理
  useEffect(() => {
    setMounted(true)
  }, [])

  // マウント後にデータを取得
  useEffect(() => {
    if (mounted) {
      // NEWSセクションとの競合を避けるため、少し遅延させてデータ取得を開始
      const timer = setTimeout(() => {
        fetchLessons()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [mounted, fetchLessons])

  // サーバーサイドレンダリング時はシンプルな表示を返す
  if (!mounted) {
    return (
      <section id="lessons" className="bg-[#cee6c1] py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-8 tracking-wider text-[#2E5A1C]">
            LESSONS
          </h2>
          <p className="text-lg text-[#2E5A1C]/80 max-w-2xl mb-12">
            Rencontreでは様々なフラワーアレンジメントのレッスンをご用意しています。初心者の方でも安心して参加いただけます。
          </p>
        </div>
      </section>
    )
  }

  // クライアントサイドレンダリング時はデータを渡す
  return <SimpleLessonsClient lessons={lessons} isLoading={loading} error={error} onRetry={fetchLessons} />
}
