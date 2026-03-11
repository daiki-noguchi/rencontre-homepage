import { createClient } from "@supabase/supabase-js"
import { getSupabaseUrl, getSupabaseAnonKey } from "./env"

// クライアントサイド用のSupabaseクライアントを作成
export const createClientSideSupabaseClient = () => {
  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseAnonKey = getSupabaseAnonKey()

    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("クライアントサイドSupabaseクライアントの作成に失敗しました:", error)
    return null
  }
}

// 画像をアップロードする関数
export async function uploadImage(file: File): Promise<string> {
  try {
    console.log("uploadImage: 画像のアップロードを開始します")

    // ファイルが存在しない場合
    if (!file) {
      console.error("uploadImage: ファイルが指定されていません")
      return "/placeholder.svg?key=2vdan"
    }

    // ファイルサイズが大きすぎる場合 (5MB以上)
    if (file.size > 5 * 1024 * 1024) {
      console.error("uploadImage: ファイルサイズが大きすぎます")
      return "/placeholder.svg?key=zaeif"
    }

    // 画像ファイルでない場合
    if (!file.type.startsWith("image/")) {
      console.error("uploadImage: 画像ファイルではありません")
      return "/placeholder.svg?key=azjs2"
    }

    // APIルートを使用して画像をアップロード
    const formData = new FormData()
    formData.append("file", file)

    console.log("uploadImage: APIルートを使用して画像をアップロードします")
    const response = await fetch("/api/upload-news-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      console.error("uploadImage: APIレスポンスが正常ではありません:", response.status)
      return "/placeholder.svg?key=abjry"
    }

    const data = await response.json()
    console.log("uploadImage: アップロード成功:", data.url)
    return data.url
  } catch (error) {
    console.error("uploadImage: 画像のアップロード中にエラーが発生しました:", error)
    return "/placeholder.svg?key=d0gzm"
  }
}

// バケットが存在するか確認し、存在しない場合は作成する関数
export async function ensureBucketExists(supabase: any, bucketName: string): Promise<boolean> {
  try {
    console.log(`ensureBucketExists: バケット ${bucketName} の存在を確認します`)

    // バケットが存在するか確認
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error(`ensureBucketExists: バケットの一覧取得に失敗しました:`, listError)
      return false
    }

    // バケットが存在するかチェック
    const bucketExists = buckets.some((bucket: any) => bucket.name === bucketName)

    if (bucketExists) {
      console.log(`ensureBucketExists: バケット ${bucketName} は既に存在します`)
      return true
    }

    // バケットが存在しない場合は作成
    console.log(`ensureBucketExists: バケット ${bucketName} を作成します`)
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
    })

    if (createError) {
      console.error(`ensureBucketExists: バケット ${bucketName} の作成に失敗しました:`, createError)
      return false
    }

    console.log(`ensureBucketExists: バケット ${bucketName} を作成しました`)
    return true
  } catch (error) {
    console.error(`ensureBucketExists: バケット ${bucketName} の確認中にエラーが発生しました:`, error)
    return false
  }
}
