import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // 認証クッキーを削除
  cookies().delete("admin-token")

  // 管理者ログインページにリダイレクト
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"))
}
