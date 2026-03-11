import { NextResponse } from "next/server"
import { checkServiceRoleKey } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const hasServiceRoleKey = await checkServiceRoleKey()

    return NextResponse.json({
      hasServiceRoleKey,
      message: hasServiceRoleKey
        ? "サービスロールキーが正しく設定されています"
        : "サービスロールキーが設定されていないか、無効です",
    })
  } catch (error) {
    console.error("サービスロールキーのチェック中にエラーが発生しました:", error)
    return NextResponse.json(
      {
        hasServiceRoleKey: false,
        error: "サービスロールキーのチェック中にエラーが発生しました",
      },
      { status: 500 },
    )
  }
}
