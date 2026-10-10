import { NextResponse } from "next/server"
import { logout } from "@/lib/auth"

export async function POST() {
  // 認証クッキーを削除
  logout()

  return NextResponse.json({ success: true })
}
