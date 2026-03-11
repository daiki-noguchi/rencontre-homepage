"use server"

import { createServiceRoleClient } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// バケットが存在するか確認し、なければ作成する
export async function ensureNewsImageBucket() {
  try {
    const supabase = createServiceRoleClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました" }
    }

    // バケットの存在を確認
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("バケット一覧の取得に失敗しました:", listError)
      return { success: false, error: listError.message }
    }

    const bucketName = "news_images"
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    // バケットが存在しない場合は作成
    if (!bucketExists) {
      console.log(`バケット '${bucketName}' が存在しないため作成します`)
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        console.error(`バケット '${bucketName}' の作成に失敗しました:`, createError)
        return { success: false, error: createError.message }
      }

      console.log(`バケット '${bucketName}' を作成しました`)
    } else {
      console.log(`バケット '${bucketName}' は既に存在します`)
    }

    return { success: true }
  } catch (error) {
    console.error("バケット確認中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// ニュース画像をア��プロードするサーバーアクション
export async function uploadNewsImage(formData: FormData) {
  try {
    // ファイルを取得
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "ファイルが選択されていません" }
    }

    // バケットの存在を確認・作成
    const { success: bucketSuccess, error: bucketError } = await ensureNewsImageBucket()
    if (!bucketSuccess) {
      return { success: false, error: bucketError }
    }

    // Supabaseクライアントを作成
    const supabase = createServiceRoleClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました" }
    }

    // ファイル名を一意にするためにUUIDを使用
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${fileName}`

    // ファイルをアップロード
    const { data, error } = await supabase.storage.from("news_images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("ニュース画像のアップロードに失敗しました:", error)
      return { success: false, error: error.message }
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage.from("news_images").getPublicUrl(data.path)

    // キャッシュを更新
    revalidatePath("/admin/news")

    return {
      success: true,
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl,
      },
    }
  } catch (error) {
    console.error("ニュース画像のアップロード中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}
