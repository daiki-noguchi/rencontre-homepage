import { NextResponse } from "next/server"
import { login } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // リクエストボディからユーザー名とパスワードを取得
    const { username, password } = await request.json()

    if (!(await login(username, password))) {
      return NextResponse.json({ success: false, message: "認証に失敗しました" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("ログイン処理中にエラーが発生しました:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
