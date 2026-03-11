import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getSupabaseUrl, getSupabaseAnonKey } from "./env"

// Supabaseのストレージバケットが存在するか確認する関数
export async function checkStorageBucket(bucketName = "images"): Promise<boolean> {
  try {
    const supabase = createClientComponentClient({
      supabaseUrl: getSupabaseUrl(),
      supabaseKey: getSupabaseAnonKey(),
    })

    // バケットの存在確認
    const { data, error } = await supabase.storage.getBucket(bucketName)

    if (error) {
      console.error(`checkStorageBucket: バケット '${bucketName}' の確認に失敗しました:`, error)
      return false
    }

    return !!data
  } catch (error) {
    console.error(`checkStorageBucket: バケット '${bucketName}' の確認中にエラーが発生しました:`, error)
    return false
  }
}

// Supabaseのストレージバケットを作成する関数
export async function createStorageBucket(bucketName = "images"): Promise<boolean> {
  try {
    const supabase = createClientComponentClient({
      supabaseUrl: getSupabaseUrl(),
      supabaseKey: getSupabaseAnonKey(),
    })

    // バケットの作成
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    })

    if (error) {
      console.error(`createStorageBucket: バケット '${bucketName}' の作成に失敗しました:`, error)
      return false
    }

    console.log(`createStorageBucket: バケット '${bucketName}' を作成しました`)
    return true
  } catch (error) {
    console.error(`createStorageBucket: バケット '${bucketName}' の作成中にエラーが発生しました:`, error)
    return false
  }
}
