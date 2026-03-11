"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Trash2, RefreshCw, Calendar, Check, X, Edit, Plus } from "lucide-react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import {
  listCalendarImages,
  uploadCalendarImage,
  addCalendarImage,
  updateCalendarImage,
  deleteCalendarImage,
  deleteCalendarImageFromStorage,
} from "@/app/actions/calendar-image-actions"
import type { CalendarImage } from "@/lib/calendar-image-types"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CalendarAdminClient() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [calendarImages, setCalendarImages] = useState<CalendarImage[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("list")

  // 新規カレンダー画像のフォーム状態
  const [newImage, setNewImage] = useState({
    title: "",
    image_url: "",
    display_from: format(new Date(), "yyyy-MM-dd"),
    display_until: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
    is_active: true,
  })

  // 編集用の状態
  const [editingImage, setEditingImage] = useState<CalendarImage | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // カレンダー画像の一覧を取得
  const fetchCalendarImages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await listCalendarImages()

      if (result.success) {
        setCalendarImages(result.data)
      } else {
        setError(result.error || "カレンダー画像の取得に失敗しました")
        toast({
          title: "エラーが発生しました",
          description: result.error || "カレンダー画像の取得に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("カレンダー画像の取得中にエラーが発生しました:", error)
      setError("カレンダー画像の取得に失敗しました")
      toast({
        title: "エラーが発生しました",
        description: "カレンダー画像の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // 初回マウント時にカレンダー画像を取得
  useEffect(() => {
    fetchCalendarImages()
  }, [fetchCalendarImages])

  // ファイル選択時の処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      // プレビュー用のURLを作成（安全な方法で）
      try {
        // 既存のBlobURLをクリーンアップ
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl)
        }

        // 新しいBlobURLを作成
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)

        // コンポーネントがアンマウントされたときにBlobURLをクリーンアップ
        return () => {
          if (objectUrl && objectUrl.startsWith("blob:")) {
            URL.revokeObjectURL(objectUrl)
          }
        }
      } catch (error) {
        console.error("プレビュー作成エラー:", error)
        setPreviewUrl(null)
      }
    }
  }

  // 新規カレンダー画像の保存（画像アップロードと情報保存を一括で行う）
  const handleSaveNewImage = async () => {
    if (!selectedFile) {
      toast({
        title: "ファイルが選択されていません",
        description: "アップロードするファイルを選択してください",
        variant: "destructive",
      })
      return
    }

    if (!newImage.title || !newImage.display_from || !newImage.display_until) {
      toast({
        title: "入力エラー",
        description: "すべての必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      setError(null)

      // 1. まず画像をアップロード
      const formData = new FormData()
      formData.append("file", selectedFile)

      const uploadResult = await uploadCalendarImage(formData)

      if (!uploadResult.success) {
        setError(uploadResult.error || "画像のアップロードに失敗しました")
        toast({
          title: "エラーが発生しました",
          description: uploadResult.error || "画像のアップロードに失敗しました",
          variant: "destructive",
        })
        return
      }

      // 2. アップロードが成功したら、カレンダー情報を保存
      const imageData = {
        ...newImage,
        image_url: uploadResult.data.publicUrl,
      }

      const saveResult = await addCalendarImage(imageData)

      if (saveResult.success) {
        toast({
          title: "保存成功",
          description: "カレンダー画像が保存されました",
        })

        // BlobURLをクリーンアップ
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl)
        }

        // フォームをリセット
        setNewImage({
          title: "",
          image_url: "",
          display_from: format(new Date(), "yyyy-MM-dd"),
          display_until: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
          is_active: true,
        })

        // プレビューをクリア
        setPreviewUrl(null)
        setSelectedFile(null)

        // 一覧を更新
        fetchCalendarImages()

        // タブを切り替え
        setActiveTab("list")
      } else {
        setError(saveResult.error || "保存に失敗しました")
        toast({
          title: "エラーが発生しました",
          description: saveResult.error || "保存に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error)
      setError("保存に失敗しました")
      toast({
        title: "エラーが発生しました",
        description: "保存に失敗しました",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // コンポーネントのアンマウント時にBlobURLをクリーンアップ
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // カレンダー画像の削除
  const handleDeleteImage = async (id: number, imageUrl: string) => {
    if (!confirm("このカレンダー画像を削除してもよろしいですか？")) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      // データベースからカレンダー画像を削除
      const result = await deleteCalendarImage(id)

      if (result.success) {
        // 画像URLからパスを抽出
        const path = imageUrl.split("/").pop()

        if (path) {
          // ストレージからも画像を削除
          await deleteCalendarImageFromStorage(path)
        }

        toast({
          title: "削除成功",
          description: "カレンダー画像が削除されました",
        })

        // 一覧を更新
        fetchCalendarImages()
      } else {
        setError(result.error || "削除に失敗しました")
        toast({
          title: "エラーが発生しました",
          description: result.error || "削除に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("削除中にエラーが発生しました:", error)
      setError("削除に失敗しました")
      toast({
        title: "エラーが発生しました",
        description: "削除に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // カレンダー画像の編集ダイアログを開く
  const handleOpenEditDialog = (image: CalendarImage) => {
    setEditingImage(image)
    setShowEditDialog(true)
  }

  // カレンダー画像の更新
  const handleUpdateImage = async () => {
    if (!editingImage) return

    try {
      setSaving(true)
      setError(null)

      const result = await updateCalendarImage(editingImage.id, {
        title: editingImage.title,
        image_url: editingImage.image_url,
        display_from: editingImage.display_from,
        display_until: editingImage.display_until,
        is_active: editingImage.is_active,
      })

      if (result.success) {
        toast({
          title: "更新成功",
          description: "カレンダー画像が更新されました",
        })

        // 一覧を更新
        fetchCalendarImages()

        // ダイアログを閉じる
        setShowEditDialog(false)
        setEditingImage(null)
      } else {
        setError(result.error || "更新に失敗しました")
        toast({
          title: "エラーが発生しました",
          description: result.error || "更新に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("更新中にエラーが発生しました:", error)
      setError("更新に失敗しました")
      toast({
        title: "エラーが発生しました",
        description: "更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // アクティブ状態の切り替え
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      setLoading(true)

      const result = await updateCalendarImage(id, {
        is_active: !currentStatus,
      })

      if (result.success) {
        toast({
          title: "更新成功",
          description: `カレンダー画像が${!currentStatus ? "有効" : "無効"}になりました`,
        })

        // 一覧を更新
        fetchCalendarImages()
      } else {
        toast({
          title: "エラーが発生しました",
          description: result.error || "更新に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("更新中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#cee6c1] py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wider text-[#2E5A1C] break-words leading-tight max-w-full">
            カレンダー画像管理
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-white/20 text-[#2E5A1C] hover:bg-white/30 hover:text-[#2E5A1C] border-[#2E5A1C]/40 shadow-md"
            asChild
          >
            <Link href="/admin" className="flex items-center gap-2" scroll={false}>
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">管理トップに戻る</span>
            </Link>
          </Button>
        </div>

        {/* エラーメッセージ表示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle className="flex items-center">
              <X className="h-4 w-4 mr-2" />
              エラーが発生しました
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="list">カレンダー一覧</TabsTrigger>
            <TabsTrigger value="add">新規追加</TabsTrigger>
          </TabsList>

          {/* カレンダー画像一覧 */}
          <TabsContent value="list">
            <Card className="bg-white/90 backdrop-blur shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xl text-[#2E5A1C]">カレンダー画像一覧</CardTitle>
                <CardDescription>登録されているカレンダー画像の一覧です</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-[#2E5A1C]" />
                  </div>
                ) : calendarImages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    カレンダー画像がありません。新規追加してください。
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {calendarImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="aspect-video relative overflow-hidden bg-gray-100 flex items-center justify-center">
                            {/* 通常のimgタグを使用 */}
                            <img
                              src={image.image_url || "/placeholder.svg"}
                              alt={image.title}
                              className="object-contain w-full h-full"
                              loading="lazy"
                            />
                          </div>
                          <div className="md:col-span-2 p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium">{image.title}</h3>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {format(parseISO(image.display_from), "yyyy年MM月dd日", { locale: ja })} 〜{" "}
                                    {format(parseISO(image.display_until), "yyyy年MM月dd日", { locale: ja })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={image.is_active}
                                    onCheckedChange={() => handleToggleActive(image.id, image.is_active)}
                                    disabled={loading}
                                  />
                                  <span className={image.is_active ? "text-green-600" : "text-gray-400"}>
                                    {image.is_active ? "有効" : "無効"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEditDialog(image)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-4 w-4" />
                                編集
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteImage(image.id, image.image_url)}
                                className="flex items-center gap-1"
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                                削除
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end border-t border-gray-100 pt-4">
                <Button
                  onClick={fetchCalendarImages}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  更新
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 新規追加 */}
          <TabsContent value="add">
            <Card className="bg-white/90 backdrop-blur shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xl text-[#2E5A1C]">カレンダー画像新規追加</CardTitle>
                <CardDescription>カレンダー画像をアップロードして情報を入力します</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="file">カレンダー画像</Label>
                    <Input id="file" type="file" accept="image/*" onChange={handleFileChange} disabled={saving} />
                    <p className="text-xs text-gray-500">JPG、PNG、GIF形式の画像をアップロードできます（最大10MB）</p>
                  </div>

                  {previewUrl && (
                    <div className="mt-4">
                      <Label>プレビュー</Label>
                      <div className="mt-2 aspect-video relative overflow-hidden bg-gray-100 rounded-md flex items-center justify-center">
                        {/* 通常のimgタグを使用 */}
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="プレビュー"
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">タイトル</Label>
                    <Input
                      id="title"
                      value={newImage.title}
                      onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                      placeholder="2023年6月カレンダー"
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_from">表示開始日</Label>
                      <Input
                        id="display_from"
                        type="date"
                        value={newImage.display_from}
                        onChange={(e) => setNewImage({ ...newImage, display_from: e.target.value })}
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="display_until">表示終了日</Label>
                      <Input
                        id="display_until"
                        type="date"
                        value={newImage.display_until}
                        onChange={(e) => setNewImage({ ...newImage, display_until: e.target.value })}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={newImage.is_active}
                      onCheckedChange={(checked) => setNewImage({ ...newImage, is_active: checked })}
                      disabled={saving}
                    />
                    <Label htmlFor="is_active">有効にする</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-gray-100 pt-4">
                <Button
                  onClick={handleSaveNewImage}
                  disabled={
                    !selectedFile || !newImage.title || !newImage.display_from || !newImage.display_until || saving
                  }
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      登録する
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 編集ダイアログ */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>カレンダー画像の編集</DialogTitle>
              <DialogDescription>カレンダー画像の情報を編集します</DialogDescription>
            </DialogHeader>
            {editingImage && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">タイトル</Label>
                  <Input
                    id="edit-title"
                    value={editingImage.title}
                    onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                    placeholder="2023年6月カレンダー"
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-display-from">表示開始日</Label>
                    <Input
                      id="edit-display-from"
                      type="date"
                      value={editingImage.display_from}
                      onChange={(e) => setEditingImage({ ...editingImage, display_from: e.target.value })}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-display-until">表示終了日</Label>
                    <Input
                      id="edit-display-until"
                      type="date"
                      value={editingImage.display_until}
                      onChange={(e) => setEditingImage({ ...editingImage, display_until: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is-active"
                    checked={editingImage.is_active}
                    onCheckedChange={(checked) => setEditingImage({ ...editingImage, is_active: checked })}
                    disabled={saving}
                  />
                  <Label htmlFor="edit-is-active">有効にする</Label>
                </div>

                <div className="mt-4">
                  <Label>プレビュー</Label>
                  <div className="mt-2 aspect-video relative overflow-hidden bg-gray-100 rounded-md flex items-center justify-center">
                    {/* 通常のimgタグを使用 */}
                    <img
                      src={editingImage.image_url || "/placeholder.svg"}
                      alt={editingImage.title}
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={saving}>
                キャンセル
              </Button>
              <Button onClick={handleUpdateImage} disabled={saving} className="flex items-center gap-2">
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    更新する
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
