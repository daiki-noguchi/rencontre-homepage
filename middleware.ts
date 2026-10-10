import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_TOKEN_COOKIE, verifyAdminToken } from "@/lib/admin-token"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 管理者ページへのアクセスをチェック（ログインページは除く）
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const authenticated = await verifyAdminToken(request.cookies.get(ADMIN_TOKEN_COOKIE)?.value)
    if (!authenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

// 管理者ページのみにミドルウェアを適用
export const config = {
  matcher: ["/admin/:path*"],
}
