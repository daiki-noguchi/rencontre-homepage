import { createClient } from "@supabase/supabase-js"
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from "./env"

// サーバーサイド用のSupabaseクライアントのシングルトンインスタンス
let serverSupabaseClient: ReturnType<typeof createClient> | null = null
let adminSupabaseClient: ReturnType<typeof createClient> | null = null

// サーバーサイド用のSupabaseクライアント（匿名キー使用）
export const createServerSupabaseClient = () => {
  try {
    // 既存のクライアントがあれば再利用
    if (serverSupabaseClient) return serverSupabaseClient

    const url = getSupabaseUrl()
    const anonKey = getSupabaseAnonKey()

    // 最小限の設定でクライアントを作成
    console.log(`createServerSupabaseClient: クライアントを作成します (URL=${url.substring(0, 10)}...)`)
    serverSupabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    return serverSupabaseClient
  } catch (error) {
    console.error("createServerSupabaseClient: クライアントの作成に失敗しました:", error)
    return null
  }
}

// 管理者用のSupabaseクライアント（サービスロールキー使用）
export const createAdminSupabaseClient = () => {
  try {
    // 既存のクライアントがあれば再利用
    if (adminSupabaseClient) return adminSupabaseClient

    const url = getSupabaseUrl()
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseAnonKey()

    // 最小限の設定でクライアントを作成
    console.log(`createAdminSupabaseClient: クライアントを作成します (URL=${url.substring(0, 10)}...)`)

    adminSupabaseClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    return adminSupabaseClient
  } catch (error) {
    console.error("createAdminSupabaseClient: クライアントの作成に失敗しました:", error)
    return null
  }
}

// 直接クライアントを作成する関数（フォールバック用）
export const createDirectSupabaseClient = (useServiceRole = false) => {
  try {
    const url = getSupabaseUrl()
    let key: string

    if (useServiceRole) {
      key = process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseAnonKey()
    } else {
      key = getSupabaseAnonKey()
    }

    // クライアントを作成
    const client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    return client
  } catch (error) {
    console.error("createDirectSupabaseClient: クライアントの作成に失敗しました:", error)
    return null
  }
}

// ニュース記事の型定義
export type NewsArticle = {
  id: number
  title: string
  date: string
  category: string
  content: string
  full_content?: string
  image_url?: string
  event_details?: {
    dates?: string
    time?: string
    location?: string
    organizer?: string
    address?: string
    access?: string
    fee?: string
    contact?: string
  }
  related_links?: {
    title: string
    url: string
  }[]
  created_at: string
}
