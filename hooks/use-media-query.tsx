"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  // サーバーサイドレンダリング時はfalseを返す
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // windowオブジェクトがあるかチェック（クライアントサイドのみ）
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query)

      // 初期値を設定
      setMatches(media.matches)

      // リスナーを設定
      const listener = () => setMatches(media.matches)
      media.addEventListener("change", listener)

      // クリーンアップ
      return () => media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}
