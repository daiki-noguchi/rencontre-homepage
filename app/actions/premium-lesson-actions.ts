"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import type { PremiumLessonInput, PremiumLessonWithFeatures } from "@/lib/premium-lesson-types"
import { revalidatePath } from "next/cache"

// プレミアムレッスン一覧を取得
export async function getPremiumLessons(): Promise<PremiumLessonWithFeatures[]> {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      console.error("Supabaseクライアントの作成に失敗しました")
      return []
    }

    // プレミアムレッスンを取得
    const { data: premiumLessons, error } = await supabase
      .from("premium_lessons")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("プレミアムレッスンの取得に失敗しました:", error)
      return []
    }

    // 各プレミアムレッスンの特徴を取得
    const premiumLessonsWithFeatures = await Promise.all(
      premiumLessons.map(async (lesson) => {
        const { data: features, error: featuresError } = await supabase
          .from("premium_lesson_features")
          .select("*")
          .eq("premium_lesson_id", lesson.id)
          .order("sort_order", { ascending: true })

        if (featuresError) {
          console.error(`レッスンID ${lesson.id} の特徴の取得に失敗しました:`, featuresError)
          return { ...lesson, features: [] }
        }

        return { ...lesson, features: features || [] }
      }),
    )

    return premiumLessonsWithFeatures
  } catch (error) {
    console.error("プレミアムレッスン一覧の取得中にエラーが発生しました:", error)
    return []
  }
}

// プレミアムレッスンを取得
export async function getPremiumLesson(id: number): Promise<PremiumLessonWithFeatures | null> {
  try {
    // IDが無効な場合は早期リターン
    if (!id || isNaN(id)) {
      console.error(`無効なプレミアムレッスンID: ${id}`)
      return null
    }

    const supabase = createServerSupabaseClient()
    if (!supabase) {
      console.error("Supabaseクライアントの作成に失敗しました")
      return null
    }

    // プレミアムレッスンを取得
    const { data: lesson, error } = await supabase.from("premium_lessons").select("*").eq("id", id).single()

    if (error) {
      console.error(`プレミアムレッスンID ${id} の取得に失敗しました:`, error)
      return null
    }

    // プレミアムレッスンの特��を取得
    const { data: features, error: featuresError } = await supabase
      .from("premium_lesson_features")
      .select("*")
      .eq("premium_lesson_id", id)
      .order("sort_order", { ascending: true })

    if (featuresError) {
      console.error(`プレミアムレッスンID ${id} の特徴の取得に失敗しました:`, featuresError)
      return { ...lesson, features: [] }
    }

    return { ...lesson, features: features || [] }
  } catch (error) {
    console.error(`プレミアムレッスンID ${id} の取得中にエラーが発生しました:`, error)
    return null
  }
}

// プレミアムレッスンを作成
export async function createPremiumLesson(
  input: PremiumLessonInput,
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました" }
    }

    // プレミアムレッスンを作成
    const { data: lesson, error } = await supabase
      .from("premium_lessons")
      .insert({
        title: input.title,
        description: input.description,
        size: input.size,
        price: input.price,
        image_url: input.image_url,
        sort_order: input.sort_order || 0,
      })
      .select()
      .single()

    if (error) {
      console.error("プレミアムレッスンの作成に失敗しました:", error)
      return { success: false, error: error.message }
    }

    // 特徴がある場合は追加
    if (input.features && input.features.length > 0) {
      const featuresWithLessonId = input.features.map((feature, index) => ({
        premium_lesson_id: lesson.id,
        content: feature.content,
        sort_order: feature.sort_order || index,
      }))

      const { error: featuresError } = await supabase.from("premium_lesson_features").insert(featuresWithLessonId)

      if (featuresError) {
        console.error("プレミアムレッスンの特徴の作成に失敗しました:", featuresError)
        // レッスン自体は作成されているので、エラーは返さずに続行
      }
    }

    revalidatePath("/admin/premium-lessons")
    revalidatePath("/")
    return { success: true, id: lesson.id }
  } catch (error) {
    console.error("プレミアムレッスンの作成中にエラーが発生しました:", error)
    return { success: false, error: "プレミアムレッスンの作成中に予期しないエラーが発生しました" }
  }
}

// プレミアムレッスンを更新
export async function updatePremiumLesson(
  id: number,
  input: PremiumLessonInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    // IDが無効な場合は早期リターン
    if (!id || isNaN(id)) {
      return { success: false, error: `無効なプレミアムレッスンID: ${id}` }
    }

    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました" }
    }

    // プレミアムレッスンを更新
    const { error } = await supabase
      .from("premium_lessons")
      .update({
        title: input.title,
        description: input.description,
        size: input.size,
        price: input.price,
        image_url: input.image_url,
        sort_order: input.sort_order,
      })
      .eq("id", id)

    if (error) {
      console.error(`プレミアムレッスンID ${id} の更新に失敗しました:`, error)
      return { success: false, error: error.message }
    }

    // 既存の特徴を削除
    const { error: deleteError } = await supabase.from("premium_lesson_features").delete().eq("premium_lesson_id", id)

    if (deleteError) {
      console.error(`プレミアムレッスンID ${id} の特徴の削除に失敗しました:`, deleteError)
      // 続行
    }

    // 特徴がある場合は追加
    if (input.features && input.features.length > 0) {
      const featuresWithLessonId = input.features.map((feature, index) => ({
        premium_lesson_id: id,
        content: feature.content,
        sort_order: feature.sort_order || index,
      }))

      const { error: featuresError } = await supabase.from("premium_lesson_features").insert(featuresWithLessonId)

      if (featuresError) {
        console.error(`プレミアムレッスンID ${id} の特徴の作成に失敗しました:`, featuresError)
        // 続行
      }
    }

    revalidatePath("/admin/premium-lessons")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error(`プレミアムレッスンID ${id} の更新中にエラーが発生しました:`, error)
    return { success: false, error: "プレミアムレッスンの更新中に予期しないエラーが発生しました" }
  }
}

// プレミアムレッスンを削除
export async function deletePremiumLesson(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // IDが無効な場合は早期リターン
    if (!id || isNaN(id)) {
      return { success: false, error: `無効なプレミアムレッスンID: ${id}` }
    }

    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました" }
    }

    // プレミアムレッスンを削除（特徴は外部キー制約でカスケード削除される）
    const { error } = await supabase.from("premium_lessons").delete().eq("id", id)

    if (error) {
      console.error(`プレミアムレッスンID ${id} の削除に失敗しました:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/premium-lessons")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error(`プレミアムレッスンID ${id} の削除中にエラーが発生しました:`, error)
    return { success: false, error: "プレミアムレッスンの削除中に予期しないエラーが発生しました" }
  }
}
