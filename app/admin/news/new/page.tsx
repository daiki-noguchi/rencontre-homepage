"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/upload-helpers"
import Image from "next/image"
import { ImageIcon, Loader2, X, CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// サーバーアクションを追加
import { addNewsArticle } from "@/app/actions/news-actions"

export default function AdminNewsNewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [manualImageUrl, setManualImageUrl] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [serviceRoleKeyMissing, setServiceRoleKeyMissing] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "お知らせ",
    content: "",
    full_content: "",
    image_url: "",
    date: new Date().toISOString().split("T")[0],
  })

  // 環境変数の存在チェック
  useEffect(() => {
    const checkServiceRoleKey = async () => {
      try {
        // テスト用のサーバーアクション呼び出し
        const result = await fetch("/api/check-service-role-key")
        const data = await result.json()

        if (!data.hasServiceRoleKey) {
          setServiceRoleKeyMissing(true)
          toast({
            title: "警告",
            description: "サービスロールキーが設定されていません。フォールバックキーを使用します。",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("サービスロールキーとストレージのチェックに失敗しました:", error)
      }
    }

    checkServiceRoleKey()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "エラー",
        description: "ファイルサイズは5MB以下にしてください",
        variant: "destructive",
      })
      return
    }

    // 画像フ���イルかチェック
    if (!file.type.startsWith("image/")) {
      toast({
        title: "エラー",
        description: "画像ファイルをアップロードしてください",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadLoading(true)

      // プレビュー用のURL作成
      const objectUrl = URL.createObjectURL(file)
      setPreviewImage(objectUrl)

      // 画像をアップロード
      const imageUrl = await uploadImage(file)
      console.log("アップロードされた画像URL:", imageUrl)

      if (imageUrl) {
        setFormData((prev) => ({ ...prev, image_url: imageUrl }))

        // プレースホルダーかどうかをチェック
        if (imageUrl.includes("/placeholder.svg")) {
          toast({
            title: "注意",
            description: "Supabaseへのアップロードに失敗したため、プレースホルダー画像を使用します。",
            variant: "warning",
          })
        } else {
          toast({
            title: "画像をアップロードしました",
            description: "画像が正常にアップロードされました",
          })
        }
      } else {
        // アップロードに失敗した場合、手動入力モードを表示
        setShowManualInput(true)
        toast({
          title: "アップロードに失敗しました",
          description: "画像URLを手動で入力してください。Supabaseのストレージ設定を確認してください。",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("画像のアップロード中にエラーが発生しました:", error)
      setShowManualInput(true)
      toast({
        title: "エラー",
        description: "画像のアップロードに失敗しました。URLを手動で入力してください。",
        variant: "destructive",
      })
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleManualImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualImageUrl(e.target.value)
  }

  const handleManualImageUrlSubmit = () => {
    if (!manualImageUrl) {
      toast({
        title: "エラー",
        description: "画像URLを入力してください",
        variant: "destructive",
      })
      return
    }

    setFormData((prev) => ({ ...prev, image_url: manualImageUrl }))
    setPreviewImage(manualImageUrl)
    toast({
      title: "画像URLを設定しました",
      description: "画像URLが正常に設定されました",
    })
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    setFormData((prev) => ({ ...prev, image_url: "" }))
    setManualImageUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // バリデーション
      if (!formData.title || !formData.category || !formData.content || !formData.date) {
        throw new Error("必須項目を入力してください")
      }

      // サーバーアクションを使用してニュース記事を追加
      const result = await addNewsArticle(formData)

      if (result.success) {
        toast({
          title: "ニュース記事を追加しました",
          description: "記事が正常に追加されました。",
        })

        // ニュース一覧ページにリダイレクト
        router.push("/admin/news")
      } else {
        throw new Error(result.error || "不明なエラーが発生しました")
      }
    } catch (error) {
      console.error("ニュース記事の追加中にエラーが発生しました:", error)

      // エラーメッセージをより詳細に
      let errorMessage = "ニュース記事の追加に失敗しました。もう一度お試しください。"

      if (error instanceof Error) {
        if (error.message.includes("permission denied") || error.message.includes("policy")) {
          errorMessage =
            "データベースへの書き込み権限がありません。環境変数SUPABASE_SERVICE_ROLE_KEYが正しく設定されているか確認してください。"
          setServiceRoleKeyMissing(true)
        } else if (error.message.includes("storage")) {
          errorMessage = "ストレージへのアクセスに失敗しました。環境変数の設定を確認してください。"
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "エラーが発生しました",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#cee6c1] py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wider text-[#2E5A1C] break-words leading-tight max-w-full">
            新規ニュース記事
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 sm:mt-0 rounded-full bg-white/20 text-[#2E5A1C] hover:bg-white/30 hover:text-[#2E5A1C] border-[#2E5A1C]/40 shadow-md"
            onClick={() => router.push("/admin/news")}
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="text-xs md:text-sm">ニュース一覧に戻る</span>
          </Button>
        </div>

        {serviceRoleKeyMissing && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>環境変数の設定が必要です</AlertTitle>
            <AlertDescription>
              <p className="mb-2">データベースへの書き込み権限がありません。以下の環境変数を設定してください：</p>
              <code className="bg-red-100 p-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>
              <p className="mt-2">
                この環境変数はSupabaseのダッシュボードの「Project Settings」→「API」から取得できます。
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-white/90 backdrop-blur shadow-lg border-none overflow-hidden max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-2xl text-[#2E5A1C]">ニュース記事情報</CardTitle>
              <CardDescription>ニュース記事の情報を入力してください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  タイトル<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="記事のタイトルを入力"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  カテゴリー<span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="お知らせ">お知らせ</SelectItem>
                    <SelectItem value="イベント">イベント</SelectItem>
                    <SelectItem value="レッスン">レッスン</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  日付<span className="text-red-500">*</span>
                </Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  概要（一覧表示用）<span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="記事の概要を入力（一覧ページに表示されます）"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_content">詳細内容</Label>
                <Textarea
                  id="full_content"
                  name="full_content"
                  value={formData.full_content}
                  onChange={handleChange}
                  placeholder="記事の詳細内容を入力（詳細ページに表示されます）"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>画像</Label>
                <div className="mt-1 flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLoading}
                    className="flex items-center gap-2"
                  >
                    {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    <span>{uploadLoading ? "アップロード中..." : "画像をアップロード"}</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="flex items-center gap-2"
                  >
                    <span>{showManualInput ? "URLを隠す" : "URLを手動入力"}</span>
                  </Button>
                </div>

                {showManualInput && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="manual_image_url">画像URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="manual_image_url"
                        value={manualImageUrl}
                        onChange={handleManualImageUrlChange}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleManualImageUrlSubmit}>
                        設定
                      </Button>
                    </div>
                  </div>
                )}

                {previewImage && (
                  <div className="relative mt-4 w-full max-w-md">
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-gray-200">
                      <Image
                        src={previewImage || "/placeholder.svg"}
                        alt="プレビュー"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <Alert className="bg-blue-50 border-blue-200 text-blue-800 mt-4">
                  <AlertDescription className="text-sm">
                    画像は5MB以下のJPEG、PNG、GIF形式のファイルをアップロードしてください。
                    アップロードに失敗した場合は、画像URLを手動で入力することもできます。
                  </AlertDescription>
                </Alert>
              </div>

              {formData.image_url && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <AlertTitle className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    画像が設定されています
                  </AlertTitle>
                  <AlertDescription className="text-sm">画像URL: {formData.image_url}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/news")} disabled={loading}>
                キャンセル
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "作成"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
