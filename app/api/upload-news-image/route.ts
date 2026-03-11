import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    console.log("upload-news-image: 画像アップロードリクエストを受信しました")

    // 環境変数の取得
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseServiceRoleKey()

    // Supabaseクライアントの作成
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    // バケット名の設定
    const bucketName = "images"

    // バケットが存在するか確認し、存在しない場合は作成
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("upload-news-image: バケットの一覧取得に失敗しました:", listError)
      return NextResponse.json({ error: `バケットの一覧取得に失敗しました: ${listError.message}` }, { status: 500 })
    }

    // バケットが存在するかチェック
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      console.log(`upload-news-image: バケット ${bucketName} を作成します`)
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
      })

      if (createError) {
        console.error(`upload-news-image: バケット ${bucketName} の作成に失敗しました:`, createError)
        return NextResponse.json({ error: `バケットの作成に失敗しました: ${createError.message}` }, { status: 500 })
      }
    }

    // FormDataからファイルを取得
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 })
    }

    // ファイル名の生成（一意のファイル名を作成）
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const fileName = `news-image-${timestamp}.${fileExtension}`

    // ファイルをArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Supabaseにファイルをアップロード
    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) {
      console.error("upload-news-image: ファイルのアップロードに失敗しました:", error)
      return NextResponse.json({ error: `ファイルのアップロードに失敗しました: ${error.message}` }, { status: 500 })
    }

    // アップロードされたファイルの公開URLを取得
    const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    console.log("upload-news-image: ファイルのアップロードに成功しました:", publicUrl.publicUrl)

    return NextResponse.json({ url: publicUrl.publicUrl })
  } catch (error) {
    console.error("upload-news-image: 予期しないエラーが発生しました:", error)
    return NextResponse.json(
      { error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
