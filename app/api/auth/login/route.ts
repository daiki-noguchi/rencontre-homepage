import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SignJWT } from "jose"

// 環境変数から取得するか、ハードコードされた値を使用
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password"

// JWTの署名と検証に使用するシークレットキー
const secretKey = new TextEncoder().encode(JWT_SECRET)

export async function POST(request: Request) {
  try {
    // リクエストボディからユーザー名とパスワードを取得
    const { username, password } = await request.json()

    // ユーザー名とパスワードの検証
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, message: "認証に失敗しました" }, { status: 401 })
    }

    // JWTトークンの生成
    const token = await new SignJWT({ username, role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h") // 8時間の有効期限
      .sign(secretKey)

    // クッキーにトークンを保存
    cookies().set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60, // 8時間（秒単位）
      path: "/",
      sameSite: "strict",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("ログイン処理中にエラーが発生しました:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
