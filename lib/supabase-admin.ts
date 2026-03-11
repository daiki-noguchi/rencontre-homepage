import { createClient } from "@supabase/supabase-js"
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from "./env"

// サービスロールクライアントのシングルトンインスタンス
let serviceRoleClient: ReturnType<typeof createClient> | null = null

// サーバーサイドのSupabaseクライアントを作成
export const createServerSupabaseClient = () => {
  try {
    const url = getSupabaseUrl()
    const anonKey = getSupabaseAnonKey()

    return createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  } catch (error) {
    console.error("Supabaseクライアントの作成に失敗しました:", error)
    return null
  }
}

// サービスロール用のSupabaseクライアントを作成する関数
export function createServiceRoleClient() {
  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseServiceRoleKey = getSupabaseServiceRoleKey()

    // シングルトンパターンを使用してクライアントを再利用
    if (serviceRoleClient) {
      return serviceRoleClient
    }

    // クライアントを作成
    serviceRoleClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    return serviceRoleClient
  } catch (error) {
    console.error("サービスロールクライアントの作成に失敗しました:", error)
    return null
  }
}

// サービスロールキーが設定されているかチェックする関数
export const checkServiceRoleKey = async (): Promise<boolean> => {
  try {
    const client = createServiceRoleClient()
    if (!client) return false

    // 簡単な接続テスト
    const { error } = await client.from("news").select("count", { count: "exact", head: true })
    return !error
  } catch (error) {
    console.error("サービスロールキーのチェックに失敗しました:", error)
    return false
  }
}
