"use server"

import { createAdminSupabaseClient, createDirectSupabaseClient } from "@/lib/supabase"
import type { LessonWithRelations, LessonInput } from "@/lib/lesson-types"
import { getDummyLessons } from "@/lib/dummy-data"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/env"

// サービスロールクライアントのシングルトンインスタンス
let serviceRoleClient: ReturnType<typeof createClient> | null = null

// 直接サービスロールクライアントを作成する関数
const createServiceRoleClient = () => {
  // 既存のクライアントがあれば再利用
  if (serviceRoleClient) {
    console.log("既存のサービスロールクライアントを再利用します")
    return serviceRoleClient
  }

  try {
    const url = getSupabaseUrl()
    const serviceRoleKey = getSupabaseServiceRoleKey()

    console.log(`レッスン用サービスロールクライアント作成: URL=${url.substring(0, 10)}...`)
    console.log(`サービスロールキーの長さ: ${serviceRoleKey.length}文字`)

    // クライアントを作成して保存
    serviceRoleClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    return serviceRoleClient
  } catch (error) {
    console.error("レッスン用サービスロールクライアントの作成に失敗しました:", error)
    return null
  }
}

// レッスンを作成する
export async function createLesson(
  lessonInput: LessonInput,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log("createLesson: レッスンの作成を開始します")

    // 直接サービスロールクライアントを作成
    const supabase = createServiceRoleClient()

    if (!supabase) {
      console.error("createLesson: サービスロールクライアントの作成に失敗しました")
      return {
        success: false,
        error: "データベース接続に失敗しました。環境変数の設定を確認してください。",
      }
    }

    // 1. レッスンの基本情報を挿入
    console.log("createLesson: レッスンの基本情報を挿入します")
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .insert([
        {
          name_ja: lessonInput.name_ja,
          name_en: lessonInput.name_en,
          description: lessonInput.description,
          duration: lessonInput.duration,
          fee: lessonInput.fee,
          capacity: lessonInput.capacity,
          category: lessonInput.category,
          has_multiple_plans: lessonInput.has_multiple_plans,
          detail_info: lessonInput.detail_info,
          is_order_only: lessonInput.is_order_only,
          sort_order: lessonInput.sort_order || 0,
        },
      ])
      .select()

    if (lessonError) {
      console.error("createLesson: レッスンの作成に失敗しました:", lessonError)

      // エラーメッセージを詳細に出力
      if (lessonError.message.includes("permission denied")) {
        return {
          success: false,
          error: "データベースへの書き込み権限がありません。サービスロールキーを確認してください。",
        }
      }

      return { success: false, error: lessonError.message }
    }

    if (!lesson || lesson.length === 0) {
      return { success: false, error: "レッスンの作成に失敗しました: データが返されませんでした" }
    }

    const lessonId = lesson[0].id
    console.log("createLesson: レッスンの基本情報を作成しました。ID:", lessonId)

    // 2. 画像情報を挿入
    if (lessonInput.images && lessonInput.images.length > 0) {
      console.log("createLesson: 画像情報を挿入します:", lessonInput.images.length)
      const { error: imagesError } = await supabase.from("lesson_images").insert(
        lessonInput.images.map((image, index) => ({
          lesson_id: lessonId,
          image_url: image.image_url,
          is_main: image.is_main,
          sort_order: image.sort_order || index,
        })),
      )

      if (imagesError) {
        console.error("createLesson: 画像情報の挿入に失敗しました:", imagesError)
        return { success: false, error: imagesError.message }
      }
    }

    // 3. プラン情報を挿入（存在する場合）
    if (lessonInput.plans && lessonInput.plans.length > 0) {
      console.log("createLesson: プラン情報を挿入します:", lessonInput.plans.length)
      const { error: plansError } = await supabase.from("lesson_plans").insert(
        lessonInput.plans.map((plan, index) => ({
          lesson_id: lessonId,
          name: plan.name,
          price: plan.price,
          description: plan.description,
          sort_order: plan.sort_order || index,
        })),
      )

      if (plansError) {
        console.error("createLesson: プラン情報の挿入に失敗しました:", plansError)
        return { success: false, error: plansError.message }
      }
    }

    // 4. 特徴情報を挿入（存在する場合）
    if (lessonInput.features && lessonInput.features.length > 0) {
      console.log("createLesson: 特徴情報を挿入します:", lessonInput.features.length)
      const { error: featuresError } = await supabase.from("lesson_features").insert(
        lessonInput.features.map((feature, index) => ({
          lesson_id: lessonId,
          content: feature.content,
          sort_order: feature.sort_order || index,
        })),
      )

      if (featuresError) {
        console.error("createLesson: 特徴情報の挿入に失敗しました:", featuresError)
        return { success: false, error: featuresError.message }
      }
    }

    // キャッシュを更新
    revalidatePath("/#lessons")

    console.log("createLesson: レッスンの作成が完了しました")
    return { success: true, data: { id: lessonId } }
  } catch (error) {
    console.error("createLesson: レッスンの作成中に例外が発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// レッスンを更新する
export async function updateLesson(
  id: number,
  lessonInput: LessonInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`updateLesson: ID ${id} のレッスンを更新します`)

    // 直接サービスロールクライアントを作成
    const supabase = createServiceRoleClient()

    if (!supabase) {
      console.error("updateLesson: サービスロールクライアントの作成に失敗しました")
      return {
        success: false,
        error: "データベース接続に失敗しました。環境変数の設定を確認してください。",
      }
    }

    // 1. レッスンの基本情報を更新
    const { error: lessonError } = await supabase
      .from("lessons")
      .update({
        name_ja: lessonInput.name_ja,
        name_en: lessonInput.name_en,
        description: lessonInput.description,
        duration: lessonInput.duration,
        fee: lessonInput.fee,
        capacity: lessonInput.capacity,
        category: lessonInput.category,
        has_multiple_plans: lessonInput.has_multiple_plans,
        detail_info: lessonInput.detail_info,
        is_order_only: lessonInput.is_order_only,
        sort_order: lessonInput.sort_order,
      })
      .eq("id", id)

    if (lessonError) {
      console.error("updateLesson: レッスンの更新に失敗しました:", lessonError)
      return { success: false, error: lessonError.message }
    }

    // 2. 既存の関連データを削除
    const [deleteImagesError, deletePlansError, deleteFeaturesError] = await Promise.all([
      supabase.from("lesson_images").delete().eq("lesson_id", id),
      supabase.from("lesson_plans").delete().eq("lesson_id", id),
      supabase.from("lesson_features").delete().eq("lesson_id", id),
    ])

    if (deleteImagesError.error) {
      console.error("updateLesson: 画像の削除に失敗しました:", deleteImagesError.error)
      return { success: false, error: deleteImagesError.error.message }
    }
    if (deletePlansError.error) {
      console.error("updateLesson: プランの削除に失敗しました:", deletePlansError.error)
      return { success: false, error: deletePlansError.error.message }
    }
    if (deleteFeaturesError.error) {
      console.error("updateLesson: 特徴の削除に失敗しました:", deleteFeaturesError.error)
      return { success: false, error: deleteFeaturesError.error.message }
    }

    // 3. 画像情報を再挿入
    if (lessonInput.images && lessonInput.images.length > 0) {
      console.log("updateLesson: 画像情報を再挿入します:", lessonInput.images.length)
      const { error: imagesError } = await supabase.from("lesson_images").insert(
        lessonInput.images.map((image, index) => ({
          lesson_id: id,
          image_url: image.image_url,
          is_main: image.is_main,
          sort_order: image.sort_order || index,
        })),
      )

      if (imagesError) {
        console.error("updateLesson: 画像情報の再挿入に失敗しました:", imagesError)
        return { success: false, error: imagesError.message }
      }
    }

    // 4. プラン情報を再挿入（存在する場合）
    if (lessonInput.plans && lessonInput.plans.length > 0) {
      console.log("updateLesson: プラン情報を再挿入します:", lessonInput.plans.length)
      const { error: plansError } = await supabase.from("lesson_plans").insert(
        lessonInput.plans.map((plan, index) => ({
          lesson_id: id,
          name: plan.name,
          price: plan.price,
          description: plan.description,
          sort_order: plan.sort_order || index,
        })),
      )

      if (plansError) {
        console.error("updateLesson: プラン情報の再挿入に失敗しました:", plansError)
        return { success: false, error: plansError.message }
      }
    }

    // 5. 特徴情報を再挿入（存在する場合）
    if (lessonInput.features && lessonInput.features.length > 0) {
      console.log("updateLesson: 特徴情報を再挿入します:", lessonInput.features.length)
      const { error: featuresError } = await supabase.from("lesson_features").insert(
        lessonInput.features.map((feature, index) => ({
          lesson_id: id,
          content: feature.content,
          sort_order: feature.sort_order || index,
        })),
      )

      if (featuresError) {
        console.error("updateLesson: 特徴情報の再挿入に失敗しました:", featuresError)
        return { success: false, error: featuresError.message }
      }
    }

    // キャッシュを更新
    revalidatePath("/#lessons")
    revalidatePath(`/lessons/${id}`)

    console.log("updateLesson: レッスンの更新が完了しました")
    return { success: true }
  } catch (error) {
    console.error("updateLesson: レッスンの更新中に例外が発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// すべてのレッスンを取得する関数
export async function getAllLessons(): Promise<LessonWithRelations[]> {
  try {
    console.log("getAllLessons: レッスンデータの取得を開始します")

    // Supabaseクライアントの作成（複数の方法を試す）
    let supabase = createAdminSupabaseClient()

    // 管理者クライアントの作成に失敗した場合は直接作成を試みる
    if (!supabase) {
      console.log("getAllLessons: 管理者クライアントの作成に失敗しました。直接クライアントを作成します")
      supabase = createDirectSupabaseClient(true)
    }

    // それでも失敗した場合は匿名クライアントを試す
    if (!supabase) {
      console.log("getAllLessons: 直接クライアントの作成にも失敗しました。匿名クライアントを作成します")
      supabase = createDirectSupabaseClient(false)
    }

    // すべての方法が失敗した場合はダミーデータを返す
    if (!supabase) {
      console.error("getAllLessons: すべてのクライアント作成方法が失敗しました")
      return getDummyLessons()
    }

    // レッスンの基本情報を取得
    const { data: lessons, error } = await supabase.from("lessons").select("*").order("sort_order", { ascending: true })

    if (error) {
      console.error("getAllLessons: レッスンの取得に失敗しました:", error)
      return getDummyLessons()
    }

    // レッスンが取得できなかった場合はダミーデータを返す
    if (!lessons || lessons.length === 0) {
      console.log("getAllLessons: レッスンが見つかりませんでした。ダミーデータを返します。")
      return getDummyLessons()
    }

    console.log(`getAllLessons: ${lessons.length}件のレッスンを取得しました。関連データを取得します`)

    // 各レッスンの関連データを取得
    const lessonsWithRelations = await Promise.all(
      lessons.map(async (lesson) => {
        try {
          // 画像、プラン、特徴を並列取得
          const [imagesResult, plansResult, featuresResult] = await Promise.all([
            supabase
              .from("lesson_images")
              .select("*")
              .eq("lesson_id", lesson.id)
              .order("sort_order", { ascending: true }),
            supabase
              .from("lesson_plans")
              .select("*")
              .eq("lesson_id", lesson.id)
              .order("sort_order", { ascending: true }),
            supabase
              .from("lesson_features")
              .select("*")
              .eq("lesson_id", lesson.id)
              .order("sort_order", { ascending: true }),
          ])

          return {
            ...lesson,
            images: imagesResult.data || [],
            plans: plansResult.data || [],
            features: featuresResult.data || [],
          }
        } catch (error) {
          console.error(`getAllLessons: レッスンID ${lesson.id} の関連データ取得中にエラーが発生しました:`, error)
          return {
            ...lesson,
            images: [],
            plans: [],
            features: [],
          }
        }
      }),
    )

    return lessonsWithRelations
  } catch (error) {
    console.error("getAllLessons: レッスンの取得中にエラーが発生しました:", error)
    return getDummyLessons()
  }
}

// IDでレッスンを取得する関数
export async function getLessonById(id: number): Promise<LessonWithRelations | null> {
  try {
    console.log(`getLessonById: ID ${id} のレッスンデータの取得を開始します`)

    // Supabaseクライアントの作成（複数の方法を試す）
    let supabase = createAdminSupabaseClient()

    // 管理者クライアントの作成に失敗した場合は直接作成を試みる
    if (!supabase) {
      console.log("getLessonById: 管理者クライアントの作成に失敗しました。直接クライアントを作成します")
      supabase = createDirectSupabaseClient(true)
    }

    // それでも失敗した場合は匿名クライアントを試す
    if (!supabase) {
      console.log("getLessonById: 直接クライアントの作成にも失敗しました。匿名クライアントを作成します")
      supabase = createDirectSupabaseClient(false)
    }

    // すべての方法が失敗した場合はnullを返す
    if (!supabase) {
      console.error("getLessonById: すべてのクライアント作成方法が失敗しました")
      return null
    }

    // レッスンの基本情報を取得
    const { data: lessons, error } = await supabase.from("lessons").select("*").eq("id", id).limit(1)

    if (error) {
      console.error("getLessonById: レッスンの取得に失敗しました:", error)
      return null
    }

    // レッスンが見つからない場合
    if (!lessons || lessons.length === 0) {
      console.log(`getLessonById: ID ${id} のレッスンが見つかりませんでした`)
      return null
    }

    const lesson = lessons[0]

    // 関連データを取得
    const [imagesResult, plansResult, featuresResult] = await Promise.all([
      supabase.from("lesson_images").select("*").eq("lesson_id", lesson.id).order("sort_order", { ascending: true }),
      supabase.from("lesson_plans").select("*").eq("lesson_id", lesson.id).order("sort_order", { ascending: true }),
      supabase.from("lesson_features").select("*").eq("lesson_id", lesson.id).order("sort_order", { ascending: true }),
    ])

    return {
      ...lesson,
      images: imagesResult.data || [],
      plans: plansResult.data || [],
      features: featuresResult.data || [],
    }
  } catch (error) {
    console.error("getLessonById: レッスンの取得中にエラーが発生しました:", error)
    return null
  }
}

// レッスン一覧表示用の最小限のデータだけを取得する関数
export async function getLessonsBasicInfo(): Promise<LessonWithRelations[]> {
  try {
    console.log("getLessonsBasicInfo: 基本情報のみ取得します")

    // Supabaseクライアントの作成（複数の方法を試す）
    let supabase = createAdminSupabaseClient()

    // 管理者クライアントの作成に失敗した場合は直接作成を試みる
    if (!supabase) {
      console.log("getLessonsBasicInfo: 管理者クライアントの作成に失敗しました。直接クライアントを作成します")
      supabase = createDirectSupabaseClient(true)
    }

    // それでも失敗した場合は匿名クライアントを試す
    if (!supabase) {
      console.log("getLessonsBasicInfo: 直接クライアントの作成にも失敗しました。匿名クライアントを作成します")
      supabase = createDirectSupabaseClient(false)
    }

    // すべての方法が失敗した場合はダミーデータを返す
    if (!supabase) {
      console.error("getLessonsBasicInfo: すべてのクライアント作成方法が失敗しました")
      return getDummyLessons()
    }

    // レッスンの基本情報を取得
    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("id, name_ja, name_en, description, duration, fee, capacity, category, is_order_only, sort_order")
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("getLessonsBasicInfo: レッスンの取得に失敗しました:", error)
      return getDummyLessons()
    }

    // レッスンが取得できなかった場合はダミーデータを返す
    if (!lessons || lessons.length === 0) {
      console.log("getLessonsBasicInfo: レッスンが見つかりませんでした。ダミーデータを返します。")
      return getDummyLessons()
    }

    // 各レッスンのメイン画像を取得
    const lessonsWithImages = await Promise.all(
      lessons.map(async (lesson) => {
        try {
          // メイン画像を取得
          const { data: images } = await supabase
            .from("lesson_images")
            .select("*")
            .eq("lesson_id", lesson.id)
            .eq("is_main", true)
            .limit(1)

          // メイン画像が見つからない場合は任意の画像を1枚取得
          if (!images || images.length === 0) {
            const { data: anyImages } = await supabase
              .from("lesson_images")
              .select("*")
              .eq("lesson_id", lesson.id)
              .limit(1)

            return {
              ...lesson,
              images: anyImages || [],
              plans: [],
              features: [],
            }
          }

          return {
            ...lesson,
            images: images || [],
            plans: [],
            features: [],
          }
        } catch (error) {
          console.error(`getLessonsBasicInfo: レッスンID ${lesson.id} の画像取得中にエラーが発生しました:`, error)
          return {
            ...lesson,
            images: [],
            plans: [],
            features: [],
          }
        }
      }),
    )

    return lessonsWithImages
  } catch (error) {
    console.error("getLessonsBasicInfo: レッスンの取得中にエラーが発生しました:", error)
    return getDummyLessons()
  }
}

// レッスンを削除する
export async function deleteLesson(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`deleteLesson: ID ${id} のレッスンを削除します`)

    // 直接サービスロールクライアントを作成
    const supabase = createServiceRoleClient()

    if (!supabase) {
      console.error("deleteLesson: サービスロールクライアントの作成に失敗しました")
      return {
        success: false,
        error: "データベース接続に失敗しました。環境変数の設定を確認してください。",
      }
    }

    // レッスンを削除すると、関連する画像、プラン、特徴も自動的に削除される（外部キー制約）
    const { error } = await supabase.from("lessons").delete().eq("id", id)

    if (error) {
      console.error("deleteLesson: レッスンの削除に失敗しました:", error)
      return { success: false, error: error.message }
    }

    // キャッシュを更新
    revalidatePath("/#lessons")

    console.log("deleteLesson: レッスンの削除が完了しました")
    return { success: true }
  } catch (error) {
    console.error("deleteLesson: レッスンの削除中に例外が発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}
