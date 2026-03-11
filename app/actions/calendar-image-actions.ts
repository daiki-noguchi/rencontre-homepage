"use server"

import { createServiceRoleClient } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import type { CalendarImage, CalendarImageInput } from "@/lib/calendar-image-types"
import { createClient } from "@supabase/supabase-js"

// サービスロールクライアントのシングルトンインスタンス
let serviceRoleClient: ReturnType<typeof createClient> | null = null

// 直接サービスロールクライアントを作成する関数
const createCalendarServiceRoleClient = () => {
  // 既存のクライアントがあれば再利用
  if (serviceRoleClient) {
    console.log("[v0] 既存のサービスロールクライアントを再利用します")
    return serviceRoleClient
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("[v0] 環境変数チェック:")
    console.log("[v0] SUPABASE_URL:", url ? `${url.substring(0, 50)}` : "未設定")
    console.log("[v0] SERVICE_ROLE_KEY length:", serviceRoleKey ? `${serviceRoleKey.length}文字` : "未設定")
    console.log("[v0] SERVICE_ROLE_KEY prefix:", serviceRoleKey ? `${serviceRoleKey.substring(0, 20)}...` : "未設定")

    // 必須の環境変数が設定されているか確認
    if (!url) {
      console.error("[v0] Supabase URLが設定されていません")
      throw new Error("NEXT_PUBLIC_SUPABASE_URLまたはSUPABASE_URLを設定してください")
    }

    if (!serviceRoleKey) {
      console.error("[v0] サービスロールキーが設定されていません")
      throw new Error("SUPABASE_SERVICE_ROLE_KEYを設定してください")
    }

    if (!serviceRoleKey.startsWith("eyJ")) {
      console.error("[v0] サービスロールキーの形式が正しくありません。JWTトークンである必要があります（'eyJ'で始まる）")
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEYの形式が正しくありません。Supabaseダッシュボードから正しいservice_role keyをコピーしてください",
      )
    }

    console.log(`[v0] カレンダー用サービスロールクライアント作成中...`)

    // クライアントを作成して保存
    serviceRoleClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    console.log("[v0] サービスロールクライアントの作成に成功しました")
    return serviceRoleClient
  } catch (error) {
    console.error("[v0] カレンダー用サービスロールクライアントの作成に失敗しました:", error)
    return null
  }
}

// バケットが存在するか確認し、なければ作成する
export async function ensureCalendarImageBucket() {
  try {
    console.log("[v0] バケット確認を開始します")
    const supabase = createCalendarServiceRoleClient()
    if (!supabase) {
      const errorMsg = "Supabaseクライアントの作成に失敗しました。環境変数を確認してください。"
      console.error("[v0]", errorMsg)
      return { success: false, error: errorMsg }
    }

    console.log("[v0] バケット一覧を取得中...")
    // バケットの存在を確認
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("[v0] バケット一覧の取得に失敗しました:", listError)
      console.error("[v0] エラーの詳細:", JSON.stringify(listError, null, 2))
      console.error(
        "[v0] ヒント: 'signature verification failed'エラーの場合、SUPABASE_SERVICE_ROLE_KEYが正しくない可能性があります",
      )
      console.error("[v0] 確認事項:")
      console.error("[v0] 1. Supabaseダッシュボード → Settings → API → service_role key (secret)をコピー")
      console.error("[v0] 2. v0のVars（環境変数）セクションでSUPABASE_SERVICE_ROLE_KEYを更新")
      console.error("[v0] 3. anon keyではなくservice_role keyを使用していることを確認")
      return {
        success: false,
        error: `バケット一覧の取得エラー: ${listError.message}\n\nSUPABASE_SERVICE_ROLE_KEYが正しく設定されているか確認してください。Supabaseダッシュボードの Settings → API から service_role key (secret) をコピーして、v0の環境変数を更新してください。`,
      }
    }

    console.log("[v0] バケット一覧:", buckets?.map((b) => b.name).join(", "))

    const bucketName = "images"
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

    // バケットが存在しない場合は作成
    if (!bucketExists) {
      console.log(`[v0] バケット '${bucketName}' が存在しないため作成します`)
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        console.error(`[v0] バケット '${bucketName}' の作成に失敗しました:`, createError)
        return { success: false, error: `バケット作成エラー: ${createError.message}` }
      }

      console.log(`[v0] バケット '${bucketName}' を作成しました`)
    } else {
      console.log(`[v0] バケット '${bucketName}' は既に存在します`)
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] バケット確認中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// カレンダー画像をアップロードするサーバーアクション
export async function uploadCalendarImage(formData: FormData) {
  try {
    console.log("[v0] カレンダー画像アップロードを開始します")

    // ファイルを取得
    const file = formData.get("file") as File
    if (!file) {
      console.error("[v0] ファイルが選択されていません")
      return { success: false, error: "ファイルが選択されていません" }
    }

    console.log("[v0] アップロードファイル:", file.name, `(${file.size} bytes)`)

    // バケットの存在を確認・作成
    const { success: bucketSuccess, error: bucketError } = await ensureCalendarImageBucket()
    if (!bucketSuccess) {
      console.error("[v0] バケット確認に失敗:", bucketError)
      return { success: false, error: bucketError }
    }

    // Supabaseクライアントを作成
    const supabase = createCalendarServiceRoleClient()
    if (!supabase) {
      const errorMsg = "Supabaseクライアントの作成に失敗しました"
      console.error("[v0]", errorMsg)
      return { success: false, error: errorMsg }
    }

    // ファイル名を一意にするためにUUIDを使用
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${fileName}`

    console.log("[v0] アップロード先パス: images/calendar/" + filePath)

    // ファイルをアップロード
    const { data, error } = await supabase.storage.from("images/calendar").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("[v0] カレンダー画像のアップロードに失敗しました:", error)
      return { success: false, error: `アップロードエラー: ${error.message}` }
    }

    console.log("[v0] アップロード成功:", data.path)

    // 公開URLを取得
    const { data: urlData } = supabase.storage.from("images/calendar").getPublicUrl(data.path)

    console.log("[v0] 公開URL:", urlData.publicUrl)

    // キャッシュを更新
    revalidatePath("/admin/calendar")
    revalidatePath("/reservation")

    return {
      success: true,
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl,
      },
    }
  } catch (error) {
    console.error("[v0] カレンダー画像のアップロード中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// カレンダー画像の一覧を取得するサーバーアクション
export async function listCalendarImages() {
  try {
    // Supabaseクライアントを作成
    const supabase = createServiceRoleClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました", data: [] }
    }

    // カレンダー画像の一覧を取得
    const { data, error } = await supabase
      .from("calendar_images")
      .select("*")
      .order("display_from", { ascending: false })

    if (error) {
      console.error("カレンダー画像の一覧取得に失敗しました:", error)
      return { success: false, error: error.message, data: [] }
    }

    return {
      success: true,
      data: data as CalendarImage[],
    }
  } catch (error) {
    console.error("カレンダー画像の一覧取得中にエラが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      data: [],
    }
  }
}

// 現在表示すべきカレンダー画像を取得するサーバーアクション
export async function getCurrentCalendarImages() {
  try {
    // Supabaseクライアントを作成
    const supabase = createServiceRoleClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました", data: [] }
    }

    // 現在の日付
    const today = new Date().toISOString().split("T")[0]

    // 現在表示すべきカレンダー画像を取得（複数）
    const { data, error } = await supabase
      .from("calendar_images")
      .select("*")
      .lte("display_from", today)
      .gte("display_until", today)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("カレンダー画像の取得に失敗しました:", error)
      return { success: false, error: error.message, data: [] }
    }

    return {
      success: true,
      data: data as CalendarImage[],
    }
  } catch (error) {
    console.error("カレンダー画像の取得中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      data: [],
    }
  }
}

// カレンダー画像を追加するサーバーアクション
export async function addCalendarImage(input: CalendarImageInput) {
  try {
    // Supabaseクライアントを作成
    const supabase = createServiceRoleClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました" }
    }

    // カレンダー画像を追加
    const { data, error } = await supabase
      .from("calendar_images")
      .insert({
        title: input.title,
        image_url: input.image_url,
        display_from: input.display_from,
        display_until: input.display_until,
        is_active: input.is_active !== undefined ? input.is_active : true,
      })
      .select()
      .single()

    if (error) {
      console.error("カレンダー画像の追加に失敗しました:", error)
      return { success: false, error: error.message }
    }

    // キャッシュを更新
    revalidatePath("/admin/calendar")
    revalidatePath("/reservation")

    return {
      success: true,
      data: data as CalendarImage,
    }
  } catch (error) {
    console.error("カレンダー画像の追加中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// カレンダー画像を更新するサーバーアクション
export async function updateCalendarImage(id: number, input: Partial<CalendarImageInput>) {
  try {
    // Supabaseクライアントを作成
    const supabase = createServiceRoleClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました" }
    }

    // カレンダー画像を更新
    const { data, error } = await supabase
      .from("calendar_images")
      .update({
        title: input.title,
        image_url: input.image_url,
        display_from: input.display_from,
        display_until: input.display_until,
        is_active: input.is_active,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("カレンダー画像の更新に失敗しました:", error)
      return { success: false, error: error.message }
    }

    // キャッシュを更新
    revalidatePath("/admin/calendar")
    revalidatePath("/reservation")

    return {
      success: true,
      data: data as CalendarImage,
    }
  } catch (error) {
    console.error("カレンダー画像の更新中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// カレンダー画像を削除するサーバーアクション
export async function deleteCalendarImage(id: number) {
  try {
    // Supabaseクライアントを作成
    const supabase = createServiceRoleClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました" }
    }

    // カレンダー画像を削除
    const { error } = await supabase.from("calendar_images").delete().eq("id", id)

    if (error) {
      console.error("カレンダー画像の削除に失敗しました:", error)
      return { success: false, error: error.message }
    }

    // キャッシュを更新
    revalidatePath("/admin/calendar")
    revalidatePath("/reservation")

    return {
      success: true,
    }
  } catch (error) {
    console.error("カレンダー画像の削除中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// ストレージからカレンダー画像を削除するサーバーアクション
export async function deleteCalendarImageFromStorage(path: string) {
  try {
    // Supabaseクライアントを作成
    const supabase = createServiceRoleClient()
    if (!supabase) {
      return { success: false, error: "Supabaseクライアントの作成に失敗しました" }
    }

    // ファイルを削除
    const { error } = await supabase.storage.from("images/calendar").remove([path])

    if (error) {
      console.error("カレンダー画像の削除に失敗しました:", error)
      return { success: false, error: error.message }
    }

    // キャッシュを更新
    revalidatePath("/admin/calendar")
    revalidatePath("/reservation")

    return { success: true }
  } catch (error) {
    console.error("カレンダー画像の削除中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}
