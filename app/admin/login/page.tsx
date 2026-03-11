"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Lock } from "lucide-react"

// ハードコードされた認証情報（本番環境では使用しないでください）
const ADMIN_USERNAME = "rencontre_admin"
const ADMIN_PASSWORD = "mihoamethyst25"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // ログイン状態をチェック
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin-logged-in")
    if (isLoggedIn === "true") {
      router.push("/admin")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // シンプルな認証チェック
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // ログイン成功
      localStorage.setItem("admin-logged-in", "true")

      toast({
        title: "ログイン成功",
        description: "管理者ページにリダイレクトします",
      })

      // 少し遅延させてトーストを表示する時間を確保
      setTimeout(() => {
        router.push("/admin")
      }, 500)
    } else {
      toast({
        title: "ログイン失敗",
        description: "ユーザー名またはパスワードが正しくありません",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cee6c1] to-[#e6f2df] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur shadow-lg border-none">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#2E5A1C]/10 flex items-center justify-center mb-2">
            <Lock className="h-8 w-8 text-[#2E5A1C]" />
          </div>
          <CardTitle className="text-2xl text-center text-[#2E5A1C]">管理者ログイン</CardTitle>
          <CardDescription className="text-center">Rencontre管理システムにログインしてください</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ユーザー名</Label>
              <Input
                id="username"
                type="text"
                placeholder="管理者ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="管理者パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-[#2E5A1C] hover:bg-[#2E5A1C]/90" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ログイン中...
                </>
              ) : (
                "ログイン"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
