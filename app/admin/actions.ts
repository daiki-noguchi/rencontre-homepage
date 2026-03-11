"use server"

import { createAdminSupabaseClient, createDirectSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// ニュース記事を追加するサーバーアクション
export async function addNewsArticle(formData: {
  title: string
  category: string
  content: string
  full_content: string
  image_url: string
  date: string
}) {
  try {
    console.log("addNewsArticle: ニュース記事の追加を開始します")

    // Supabaseクライアントの作成（複数の方法を試す）
    let supabase = createAdminSupabaseClient()

    // 管理者クライアントの作成に失敗した場合は直接作成を試みる
    if (!supabase) {
      console.log("addNewsArticle: 管理者クライアントの作成に失敗しました。直接クライアントを作成します")
      supabase = createDirectSupabaseClient(true)
    }

    // すべての方法が失敗した場合はエラーを返す
    if (!supabase) {
      console.error("addNewsArticle: すべてのクライアント作成方法が失敗しました")
      return {
        success: false,
        error: "データベース接続に失敗しました。環境変数の設定を確認してください。",
      }
    }

    // 入力データのバリデーション
    if (!formData.title || !formData.category || !formData.content || !formData.date) {
      return {
        success: false,
        error: "必須項目が入力されていません",
      }
    }

    console.log("addNewsArticle: データをデータベースに挿入します")

    // Supabaseにデータを挿入
    const { data, error } = await supabase
      .from("news")
      .insert([
        {
          title: formData.title,
          category: formData.category,
          content: formData.content,
          full_content: formData.full_content,
          image_url: formData.image_url,
          date: formData.date,
        },
      ])
      .select()

    if (error) {
      console.error("addNewsArticle: ニュース記事の追加中にエラーが発生しました:", error)

      // エラーメッセージを詳細に出力
      if (error.message.includes("permission denied")) {
        return {
          success: false,
          error: "データベースへの書き込み権限がありません。サービスロールキーを確認してください。",
        }
      }

      return { success: false, error: error.message }
    }

    // キャッシュを更新
    revalidatePath("/#information")

    console.log("addNewsArticle: ニュース記事の追加が完了しました")
    return { success: true, data }
  } catch (error) {
    console.error("addNewsArticle: 予期しないエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}
