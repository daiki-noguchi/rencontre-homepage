"use server"

import { createClient } from "@supabase/supabase-js"

// サービスロールキーが有効かどうかをチェックするサーバーアクション
export async function checkServiceRoleKey() {
  try {
    // サーバーサイドでのみ環境変数を使用
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        success: false,
        error: "必要な環境変数が設定されていません",
      }
    }

    // テスト用のクライアントを作成
    const testClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    // 簡単なクエリを実行してテスト
    const { error } = await testClient.from("lessons").select("count", { count: "exact", head: true })

    if (error) {
      console.error("サービスロールキーテストエラー:", error)
      return {
        success: false,
        error: "サービスロールキーが無効です",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("環境変数チェック中にエラーが発生しました:", error)
    return {
      success: false,
      error: "環境変数チェックに失敗しました",
    }
  }
}
