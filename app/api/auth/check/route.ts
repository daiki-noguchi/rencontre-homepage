import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    return NextResponse.json({ authenticated })
  } catch (error) {
    console.error("認証状態の確認中にエラーが発生しました:", error)
    return NextResponse.json({ authenticated: false, error: "認証状態の確認中にエラーが発生しました" }, { status: 500 })
  }
}
