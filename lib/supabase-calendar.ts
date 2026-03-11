import { createClient } from "@supabase/supabase-js"
import { createServiceRoleClient } from "./supabase-admin"
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from "./env"

// デバッグログ用の関数
function logDebug(message: string, data?: any) {
  console.log(`[Supabase Calendar] ${message}`, data ? data : "")
}

// カレンダー用のSupabaseクライアントを作成する関数
export function createCalendarClient(useServiceRole = false) {
  try {
    // サービスロールを使用する場合
    if (useServiceRole) {
      // クライアントサイドでの実行を防止
      if (typeof window !== "undefined") {
        logDebug("クライアントサイドではサービスロールキーを使用できません")
        return null
      }

      // サービスロールクライアントを使用
      return createServiceRoleClient()
    }

    // 匿名キーを使用する場合
    const supabaseUrl = getSupabaseUrl()
    const supabaseAnonKey = getSupabaseAnonKey()

    logDebug(`クライアント作成: URL=${supabaseUrl}, キータイプ=匿名`)

    // クライアントを作成して返す
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    return client
  } catch (error) {
    logDebug("カレンダー用Supabaseクライアントの作成に失敗しました:", error)
    console.error("カレンダー用Supabaseクライアントの作成に失敗しました:", error)
    return null
  }
}

// カレンダー用のSupabaseクライアントが正常に作成できるかチェックする関数
export async function checkCalendarClient(): Promise<boolean> {
  try {
    // クライアントサイドでは常にfalseを返す
    if (typeof window !== "undefined") {
      return false
    }

    logDebug("カレンダークライアントをチェック中...")

    // 環境変数の確認
    const supabaseUrl = getSupabaseUrl()
    const supabaseServiceRoleKey = getSupabaseServiceRoleKey()

    const client = createCalendarClient(true)
    if (!client) {
      logDebug("クライアントの作成に失敗しました")
      return false
    }

    // 簡単な接続テスト
    logDebug("business_calendar テーブルに接続テスト中...")
    const { error } = await client.from("business_calendar").select("count", { count: "exact", head: true })

    if (error) {
      logDebug("接続テストエラー:", error)
      return false
    }

    logDebug("接続テスト成功")
    return true
  } catch (error) {
    logDebug("カレンダークライアントのチェックに失敗しました:", error)
    console.error("カレンダークライアントのチェックに失敗しました:", error)
    return false
  }
}
