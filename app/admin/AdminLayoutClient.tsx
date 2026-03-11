"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ログインページの場合は認証チェックをスキップ
    if (pathname === "/admin/login") {
      setIsLoading(false)
      return
    }

    // クライアントサイドでの認証チェック
    const isLoggedIn = localStorage.getItem("admin-logged-in")

    if (isLoggedIn !== "true") {
      router.push("/admin/login")
    } else {
      setIsLoading(false)
    }
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem("admin-logged-in")
    router.push("/admin/login")
  }

  if (isLoading && pathname !== "/admin/login") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2E5A1C]"></div>
      </div>
    )
  }

  // ログインページの場合は子コンポーネントのみを表示
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[#2E5A1C]">Rencontre 管理パネル</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </Button>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-2">
            <a
              href="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/admin" ? "bg-[#2E5A1C] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              ダッシュボード
            </a>
            <a
              href="/admin/lessons"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname?.startsWith("/admin/lessons") ? "bg-[#2E5A1C] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              レッスン管理
            </a>
            <a
              href="/admin/premium-lessons"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname?.startsWith("/admin/premium-lessons")
                  ? "bg-[#2E5A1C] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              プレミアムレッスン管理
            </a>
            <a
              href="/admin/news"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname?.startsWith("/admin/news") ? "bg-[#2E5A1C] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              お知らせ管理
            </a>
            <a
              href="/admin/calendar"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname?.startsWith("/admin/calendar") ? "bg-[#2E5A1C] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              カレンダー管理
            </a>
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
