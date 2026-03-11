"use server"

import type { NewsArticle } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { getDummyNews, getDummyNewsById } from "@/lib/dummy-data"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env"

// サービスロールクライアントのシングルトンインスタンス
let serviceRoleClient: ReturnType<typeof createClient> | null = null

// サーバーアクション用のSupabaseクライアントを作成
const createNewsActionClient = () => {
  // 既存のクライアントがあれば再利用
  if (serviceRoleClient) {
    console.log("既存のサービスロールクライアントを再利用します")
    return serviceRoleClient
  }

  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseAnonKey()

    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("ニュースアクション用クライアントの作成に失敗しました:", error)
    return null
  }
}

// すべてのニュース記事を取得する関数
export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    console.log("getAllNews: ニュース記事の取得を開始します")

    // Supabaseクライアントの作成
    const supabase = createNewsActionClient()
    if (!supabase) {
      console.error("getAllNews: クライアントの作成に失敗しました。ダミーデータを返します")
      return getDummyNews()
    }

    // ニュース記事を取得
    const { data, error } = await supabase.from("news").select("*").order("date", { ascending: false })

    if (error) {
      console.error("getAllNews: ニュース記事の取得に失敗しました:", error)
      return getDummyNews()
    }

    // ニュース記事が取得できなかった場合はダミーデータを返す
    if (!data || data.length === 0) {
      console.log("getAllNews: ニュース記事が見つかりませんでした。ダミーデータを返します。")
      return getDummyNews()
    }

    return data
  } catch (error) {
    console.error("getAllNews: ニュース記事の取得中にエラーが発生しました:", error)
    return getDummyNews()
  }
}

// IDでニュース記事を取得する関数
export async function getNewsById(id: number): Promise<NewsArticle | null> {
  try {
    console.log(`getNewsById: ID ${id} のニュース記事の取得を開始します`)

    // Supabaseクライアントの作成
    const supabase = createNewsActionClient()
    if (!supabase) {
      console.error("getNewsById: クライアントの作成に失敗しました。ダミーデータを返します")
      return getDummyNewsById(id)
    }

    // ニュース記事を取得
    const { data, error } = await supabase.from("news").select("*").eq("id", id).limit(1)

    if (error) {
      console.error("getNewsById: ニュース記事の取得に失敗しました:", error)
      return getDummyNewsById(id)
    }

    // ニュース記事が見つからない場合
    if (!data || data.length === 0) {
      console.log(`getNewsById: ID ${id} のニュース記事が見つかりませんでした`)
      return getDummyNewsById(id)
    }

    return data[0]
  } catch (error) {
    console.error("getNewsById: ニュース記事の取得中にエラーが発生しました:", error)
    return getDummyNewsById(id)
  }
}

// カテゴリーでフィルタリングしたニュース記事を取得する関数
export async function getNewsByCategory(category: string): Promise<NewsArticle[]> {
  try {
    console.log(`getNewsByCategory: カテゴリー ${category} のニュース記事を取得します`)

    // Supabaseクライアントの作成
    const supabase = createNewsActionClient()
    if (!supabase) {
      console.error("getNewsByCategory: クライアントの作成に失敗しました。ダミーデータを返します")
      return getDummyNews().filter((news) => news.category === category)
    }

    // ニュース記事を取得
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("category", category)
      .order("date", { ascending: false })

    if (error) {
      console.error(`getNewsByCategory: カテゴリー ${category} のニュース記事の取得に失敗しました:`, error)
      return getDummyNews().filter((news) => news.category === category)
    }

    // ニュース記事が見つからない場合
    if (!data || data.length === 0) {
      console.log(`getNewsByCategory: カテゴリー ${category} のニュース記事が見つかりませんでした`)
      return getDummyNews().filter((news) => news.category === category)
    }

    return data
  } catch (error) {
    console.error(`getNewsByCategory: カテゴリー ${category} のニュース記事の取得中にエラーが発生しました:`, error)
    return getDummyNews().filter((news) => news.category === category)
  }
}

// ニュース記事を追加する関数
export async function addNewsArticle(formData: {
  title: string
  category: string
  content: string
  full_content: string
  image_url: string
  date: string
}): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    console.log("addNewsArticle: ニュース記事の追加を開始します")

    // Supabaseクライアントの作成
    const supabase = createNewsActionClient()
    if (!supabase) {
      console.error("addNewsArticle: サービスロールクライアントの作成に失敗しました")
      return {
        success: false,
        error:
          "データベース接続に失敗しました。環境変数の設定を確認してください。",
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
    console.log("挿入データ:", {
      title: formData.title,
      category: formData.category,
      content: formData.content.substring(0, 20) + "...",
      full_content: formData.full_content ? formData.full_content.substring(0, 20) + "..." : "",
      image_url: formData.image_url ? "設定あり" : "なし",
      date: formData.date,
    })

    // Supabaseにデータを挿入
    const { data, error } = await supabase
      .from("news")
      .insert([
        {
          title: formData.title,
          category: formData.category,
          content: formData.content,
          full_content: formData.full_content || "",
          image_url: formData.image_url || "",
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

// ニュース記事を更新する関数
export async function updateNews(id: number, formData: NewsArticle): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`updateNews: ID ${id} のニュース記事を更新します`)

    // Supabaseクライアントの作成
    const supabase = createNewsActionClient()
    if (!supabase) {
      return { success: false, error: "データベース接続に失敗しました。環境変数の設定を確認してください。" }
    }

    // 入力データのバリデーション
    if (!formData.title || !formData.category || !formData.content || !formData.date) {
      return {
        success: false,
        error: "必須項目が入力されていません",
      }
    }

    console.log("updateNews: データをデータベースに更新します")

    // Supabaseでデータを更新
    const { error } = await supabase
      .from("news")
      .update({
        title: formData.title,
        category: formData.category,
        content: formData.content,
        full_content: formData.full_content || "",
        image_url: formData.image_url || "",
        date: formData.date,
      })
      .eq("id", id)

    if (error) {
      console.error("updateNews: ニュース記事の更新中にエラーが発生しました:", error)

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
    revalidatePath(`/news/${id}`)

    console.log("updateNews: ニュース記事の更新が完了しました")
    return { success: true }
  } catch (error) {
    console.error("updateNews: 予期しないエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// ニュース記事を削除する関数
export async function deleteNews(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`deleteNews: ID ${id} のニュース記事を削除します`)

    // Supabaseクライアントの作成
    const supabase = createNewsActionClient()
    if (!supabase) {
      return { success: false, error: "データベース接続に失敗しました。環境変数の設定を確認してください。" }
    }

    // ニュース記事を削除
    const { error } = await supabase.from("news").delete().eq("id", id)

    if (error) {
      console.error("deleteNews: ニュース記事の削除に失敗しました:", error)
      return { success: false, error: error.message }
    }

    // キャッシュを更新
    revalidatePath("/#information")

    console.log("deleteNews: ニュース記事の削除が完了しました")
    return { success: true }
  } catch (error) {
    console.error("deleteNews: ニュース記事の削除中に例外が発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}
