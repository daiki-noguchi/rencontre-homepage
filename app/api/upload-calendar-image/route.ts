import { type NextRequest, NextResponse } from "next/server"
import { uploadCalendarImage } from "@/app/actions/calendar-image-actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const result = await uploadCalendarImage(formData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("カレンダー画像アップロードAPIエラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      },
      { status: 500 },
    )
  }
}
