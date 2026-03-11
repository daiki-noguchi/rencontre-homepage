"use server"

import { createClient } from "@supabase/supabase-js"
import { type SimpleLesson, DUMMY_LESSONS } from "@/lib/lesson-types-simple"
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env"

// リクエスト間隔を管理するための変数
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 最小リクエスト間隔（ミリ秒）

// シンプルなSupabaseクライアント作成関数
function createSupabaseClient() {
  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseAnonKey = getSupabaseAnonKey()

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      // タイムアウト設定を追加
      global: {
        fetch: (...args) => {
          // タイムアウト付きのfetch
          const controller = new AbortController()
          const { signal } = controller

          // 5秒後にタイムアウト
          const timeoutId = setTimeout(() => controller.abort(), 5000)

          return fetch(...args, { signal })
            .then((response) => {
              clearTimeout(timeoutId)
              return response
            })
            .catch((error) => {
              clearTimeout(timeoutId)
              console.error("Fetch error:", error)
              throw error
            })
        },
      },
    })
  } catch (error) {
    console.error("Supabaseクライアント作成エラー:", error)
    return null
  }
}

// シンプルなレッスン一覧取得関数
export async function getSimpleLessons(): Promise<SimpleLesson[]> {
  try {
    console.log("getSimpleLessons: レッスンデータの取得を開始")

    // リクエスト間隔を確認
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime

    // 前回のリクエストから最小間隔が経過していない場合は待機
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL && lastRequestTime > 0) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
      console.log(`getSimpleLessons: リクエスト間隔を確保するため${waitTime}ms待機します`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    // リクエスト時間を更新
    lastRequestTime = Date.now()

    const supabase = createSupabaseClient()
    if (!supabase) {
      console.log("getSimpleLessons: Supabaseクライアントの作成に失敗。ダミーデータを返します")
      return DUMMY_LESSONS
    }

    // 1. レッスンの基本情報を取得
    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("id, name_ja, name_en, description, duration, fee, capacity, category, is_order_only")
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("getSimpleLessons: レッスン取得エラー:", error)
      return DUMMY_LESSONS
    }

    if (!lessons || lessons.length === 0) {
      console.log("getSimpleLessons: レッスンが見つかりません。ダミーデータを返します")
      return DUMMY_LESSONS
    }

    // 2. 各レッスンのメイン画像を取得して結合
    const lessonsWithImages = await Promise.all(
      lessons.map(async (lesson) => {
        try {
          // メイン画像を取得
          const { data: images } = await supabase
            .from("lesson_images")
            .select("image_url")
            .eq("lesson_id", lesson.id)
            .eq("is_main", true)
            .limit(1)

          // メイン画像が見つからない場合は任意の画像を1枚取得
          if (!images || images.length === 0) {
            const { data: anyImages } = await supabase
              .from("lesson_images")
              .select("image_url")
              .eq("lesson_id", lesson.id)
              .limit(1)

            return {
              ...lesson,
              image_url:
                anyImages && anyImages.length > 0 ? anyImages[0].image_url : "/placeholder.svg?height=400&width=600",
            }
          }

          return {
            ...lesson,
            image_url: images[0].image_url,
          }
        } catch (error) {
          console.error(`getSimpleLessons: レッスンID ${lesson.id} の画像取得エラー:`, error)
          // エラー時はプレースホルダー画像を使用
          return {
            ...lesson,
            image_url: "/placeholder.svg?height=400&width=600",
          }
        }
      }),
    )

    console.log(`getSimpleLessons: ${lessonsWithImages.length}件のレッスンデータを取得完了`)
    return lessonsWithImages
  } catch (error) {
    console.error("getSimpleLessons: 予期しないエラー:", error)
    return DUMMY_LESSONS
  }
}
