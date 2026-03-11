import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 管理者ページへのアクセスをチェック
  if (path.startsWith("/admin") && path !== "/admin/login") {
    // クライアントサイドでの認証チェックに任せるため、ミドルウェアでのチェックは一時的に無効化
    return NextResponse.next()
  }

  return NextResponse.next()
}

// 管理者ページのみにミドルウェアを適用
export const config = {
  matcher: ["/admin/:path*"],
}
