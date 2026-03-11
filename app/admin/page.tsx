"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Newspaper, BookOpen, Calendar, Star, Home } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()

  // ログイン状態をチェック
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin-logged-in")
    if (isLoggedIn !== "true") {
      router.push("/admin/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cee6c1] to-[#e6f2df]">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-wider text-[#2E5A1C]">管理ページ</h1>
            <p className="text-[#2E5A1C]/70 mt-2">Rencontreサイトの管理機能</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>サイトに戻る</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ニュース管理カード */}
          <Card className="bg-white/90 backdrop-blur shadow-lg border-none overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Newspaper className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-[#2E5A1C]">ニュース管理</CardTitle>
              <CardDescription>お知らせの追加・編集・削除</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-gray-600">
                ホームページに表示されるお知らせを管理します。
                新しいお知らせの追加や既存のお知らせの編集・削除ができます。
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/admin/news">管理する</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* レッスン管理カード */}
          <Card className="bg-white/90 backdrop-blur shadow-lg border-none overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl text-[#2E5A1C]">レッスン管理</CardTitle>
              <CardDescription>レッスンの追加・編集・削除</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-gray-600">
                ホームページに表示されるレッスン情報を管理します。
                新しいレッスンの追加や既存のレッスンの編集・削除ができます。
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                <Link href="/admin/lessons">管理する</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* カレンダー管理カード */}
          <Card className="bg-white/90 backdrop-blur shadow-lg border-none overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-[#2E5A1C]">カレンダー管理</CardTitle>
              <CardDescription>予約可能日の設定</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-gray-600">
                予約カレンダーの管理を行います。 予約可能な日時の追加や削除、予約枠の設定ができます。
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                <Link href="/admin/calendar">管理する</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* プレミアムレッスン管理カード */}
          <Card className="bg-white/90 backdrop-blur shadow-lg border-none overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-[#2E5A1C]">プレミアムレッスン管理</CardTitle>
              <CardDescription>七色星花アレンジメントの管理</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-gray-600">
                ホームページに表示されるプレミアムレッスン情報を管理します。
                新しいプレミアムレッスンの追加や既存のプレミアムレッスンの編集・削除ができます。
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/admin/premium-lessons">管理する</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
