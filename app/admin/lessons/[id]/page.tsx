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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/upload-helpers"
import Image from "next/image"
import { ImageIcon, Loader2, X, CheckCircle, Plus, Trash2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getLessonById, updateLesson } from "@/app/actions/lesson-actions"
import type { LessonInput } from "@/lib/lesson-types"
import Link from "next/link"

export default function AdminLessonEditPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [images, setImages] = useState<{ image_url: string; is_main: boolean; sort_order: number }[]>([])
  const [plans, setPlans] = useState<{ name: string; price: string; description: string; sort_order: number }[]>([])
  const [features, setFeatures] = useState<{ content: string; sort_order: number }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<Omit<LessonInput, "images" | "plans" | "features">>({
    name_ja: "",
    name_en: "",
    description: "",
    duration: "",
    fee: "",
    capacity: "",
    category: "インテリア",
    has_multiple_plans: false,
    detail_info: "",
    is_order_only: false,
    sort_order: 0,
  })

  // レッスンデータを取得
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setInitialLoading(true)

        // "new"の場合は新規作成モードなので、データ取得をスキップ
        if (params.id === "new") {
          setInitialLoading(false)
          return
        }

        const id = Number(params.id)

        // idがNaNかどうかをチェック
        if (isNaN(id)) {
          toast({
            title: "エラー",
            description: "無効なレッスンIDです。",
            variant: "destructive",
          })
          router.push("/admin/lessons")
          return
        }

        const lesson = await getLessonById(id)

        if (!lesson) {
          toast({
            title: "エラー",
            description: "レッスンが見つかりませんでした。",
            variant: "destructive",
          })
          router.push("/admin/lessons")
          return
        }

        // フォームデータを設定
        setFormData({
          name_ja: lesson.name_ja,
          name_en: lesson.name_en,
          description: lesson.description,
          duration: lesson.duration || "",
          fee: lesson.fee || "",
          capacity: lesson.capacity || "",
          category: lesson.category || "インテリア",
          has_multiple_plans: lesson.has_multiple_plans || false,
          detail_info: lesson.detail_info || "",
          is_order_only: lesson.is_order_only || false,
          sort_order: lesson.sort_order || 0,
        })

        // 画像データを設定
        if (lesson.images && lesson.images.length > 0) {
          setImages(
            lesson.images.map((img) => ({
              image_url: img.image_url,
              is_main: img.is_main,
              sort_order: img.sort_order,
            })),
          )
        }

        // プランデータを設定
        if (lesson.plans && lesson.plans.length > 0) {
          setPlans(
            lesson.plans.map((plan) => ({
              name: plan.name,
              price: plan.price,
              description: plan.description || "",
              sort_order: plan.sort_order,
            })),
          )
        }

        // 特徴データを設定
        if (lesson.features && lesson.features.length > 0) {
          setFeatures(
            lesson.features.map((feature) => ({
              content: feature.content,
              sort_order: feature.sort_order,
            })),
          )
        }
      } catch (error) {
        console.error("レッスンの取得中にエラーが発生しました:", error)
        toast({
          title: "エラー",
          description: "レッスンの読み込みに失敗しました。",
          variant: "destructive",
        })
        router.push("/admin/lessons")
      } finally {
        setInitialLoading(false)
      }
    }

    fetchLesson()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
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

    // 画像ファイルかチェック
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

      // 画像をアップロード
      const imageUrl = await uploadImage(file)

      if (imageUrl) {
        // 新しい画像を追加
        const newImage = {
          image_url: imageUrl,
          is_main: images.length === 0, // 最初の画像をメインに設定
          sort_order: images.length,
        }
        setImages((prev) => [...prev, newImage])

        toast({
          title: "画像をアップロードしました",
          description: "画像が正常にアップロードされました",
        })
      } else {
        toast({
          title: "アップロードに失敗しました",
          description: "画像のアップロードに失敗しました。URLを手動で入力してください。",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("画像のアップロード中にエラーが発生しました:", error)
      toast({
        title: "エラー",
        description: "画像のアップロードに失敗しました。",
        variant: "destructive",
      })
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index)
      // メイン画像が削除された場合、最初の画像をメインに設定
      if (prev[index].is_main && newImages.length > 0) {
        newImages[0].is_main = true
      }
      // sort_orderを更新
      return newImages.map((img, i) => ({ ...img, sort_order: i }))
    })
  }

  const handleSetMainImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_main: i === index,
      })),
    )
  }

  // プラン追加
  const handleAddPlan = () => {
    setPlans((prev) => [
      ...prev,
      {
        name: "",
        price: "",
        description: "",
        sort_order: prev.length,
      },
    ])
  }

  // プラン削除
  const handleRemovePlan = (index: number) => {
    setPlans((prev) => {
      const newPlans = prev.filter((_, i) => i !== index)
      // sort_orderを更新
      return newPlans.map((plan, i) => ({ ...plan, sort_order: i }))
    })
  }

  // プラン更新
  const handlePlanChange = (index: number, field: string, value: string) => {
    setPlans((prev) => prev.map((plan, i) => (i === index ? { ...plan, [field]: value } : plan)))
  }

  // 特徴追加
  const handleAddFeature = () => {
    setFeatures((prev) => [
      ...prev,
      {
        content: "",
        sort_order: prev.length,
      },
    ])
  }

  // 特徴削除
  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => {
      const newFeatures = prev.filter((_, i) => i !== index)
      // sort_orderを更新
      return newFeatures.map((feature, i) => ({ ...feature, sort_order: i }))
    })
  }

  // 特徴更新
  const handleFeatureChange = (index: number, value: string) => {
    setFeatures((prev) => prev.map((feature, i) => (i === index ? { ...feature, content: value } : feature)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // バリデーション
      if (!formData.name_ja || !formData.name_en || !formData.description) {
        throw new Error("必須項目を入力してください")
      }

      if (images.length === 0) {
        throw new Error("少なくとも1つの画像をアップロードしてください")
      }

      // レッスン更新用のデータを準備
      const lessonInput: LessonInput = {
        ...formData,
        images,
        plans: formData.has_multiple_plans ? plans : [],
        features,
      }

      // IDをチェック
      const id = Number(params.id)
      if (isNaN(id)) {
        throw new Error("無効なレッスンIDです")
      }

      // サーバーアクションを使用してレッスンを更新
      const result = await updateLesson(id, lessonInput)

      if (result.success) {
        toast({
          title: "レッスンを更新しました",
          description: "レッスンが正常に更新されました。",
        })

        // レッスン一覧ページにリダイレクト
        router.push("/admin/lessons")
      } else {
        throw new Error(result.error || "不明なエラーが発生しました")
      }
    } catch (error) {
      console.error("レッスンの更新中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "レッスンの更新に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ページタイトルとボタンテキストを設定
  const isNewMode = params.id === "new"
  const pageTitle = isNewMode ? "新規レッスン作成" : "レッスン編集"
  const submitButtonText = isNewMode ? "作成" : "更新"

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-[#cee6c1] py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E5A1C]"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#cee6c1] py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wider text-[#2E5A1C] break-words leading-tight max-w-full">
            {pageTitle}
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 sm:mt-0 rounded-full bg-white/20 text-[#2E5A1C] hover:bg-white/30 hover:text-[#2E5A1C] border-[#2E5A1C]/40 shadow-md"
            asChild
          >
            <Link href="/admin/lessons" className="flex items-center gap-2">
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">レッスン一覧に戻る</span>
            </Link>
          </Button>
        </div>

        <Card className="bg-white/90 backdrop-blur shadow-lg border-none overflow-hidden">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-2xl text-[#2E5A1C]">レッスン情報</CardTitle>
              <CardDescription>レッスンの基本情報を入力してください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name_ja">
                    レッスン名（日本語）<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name_ja"
                    name="name_ja"
                    value={formData.name_ja}
                    onChange={handleChange}
                    placeholder="例：ハーバリウム"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name_en">
                    レッスン名（英語）<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name_en"
                    name="name_en"
                    value={formData.name_en}
                    onChange={handleChange}
                    placeholder="例：Herbarium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  説明<span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="レッスンの説明を入力してください"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">所要時間</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="例：2時間"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee">料金</Label>
                  <Input id="fee" name="fee" value={formData.fee} onChange={handleChange} placeholder="例：3,000円〜" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">定員</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="例：4名まで"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">カテゴリー</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="インテリア">インテリア</SelectItem>
                    <SelectItem value="アレンジメント">アレンジメント</SelectItem>
                    <SelectItem value="アクセサリー">アクセサリー</SelectItem>
                    <SelectItem value="アロマ">アロマ</SelectItem>
                    <SelectItem value="プレミアム">プレミアム</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_order_only"
                  checked={formData.is_order_only}
                  onCheckedChange={(checked) => handleSwitchChange("is_order_only", checked)}
                />
                <Label htmlFor="is_order_only">オーダーのみ（レッスン不可）</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="detail_info">詳細情報（オプション）</Label>
                <Textarea
                  id="detail_info"
                  name="detail_info"
                  value={formData.detail_info || ""}
                  onChange={handleChange}
                  placeholder="詳細情報があれば入力してください"
                  rows={4}
                />
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-[#2E5A1C]">画像</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLoading}
                    className="flex items-center gap-2"
                  >
                    {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    <span>{uploadLoading ? "アップロード中..." : "画像を追加"}</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div
                          className={`relative aspect-square w-full overflow-hidden rounded-md border ${
                            image.is_main ? "ring-2 ring-[#2E5A1C] ring-offset-2" : "border-gray-200"
                          }`}
                        >
                          <Image
                            src={image.image_url || "/placeholder.svg"}
                            alt={`レッスン画像 ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          {image.is_main && (
                            <div className="absolute top-1 left-1 bg-[#2E5A1C] text-white text-xs px-2 py-1 rounded-md">
                              メイン
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {!image.is_main && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => handleSetMainImage(index)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                    <AlertDescription className="text-sm">
                      少なくとも1つの画像をアップロードしてください。最初にアップロードされた画像がメイン画像として設定されます。
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium text-[#2E5A1C]">料金プラン</h3>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="has_multiple_plans"
                        checked={formData.has_multiple_plans}
                        onCheckedChange={(checked) => handleSwitchChange("has_multiple_plans", checked)}
                      />
                      <Label htmlFor="has_multiple_plans">複数プランあり</Label>
                    </div>
                  </div>
                  {formData.has_multiple_plans && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPlan}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>プランを追加</span>
                    </Button>
                  )}
                </div>

                {formData.has_multiple_plans ? (
                  plans.length > 0 ? (
                    <div className="space-y-4">
                      {plans.map((plan, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-4 relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleRemovePlan(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`plan-name-${index}`}>プラン名</Label>
                              <Input
                                id={`plan-name-${index}`}
                                value={plan.name}
                                onChange={(e) => handlePlanChange(index, "name", e.target.value)}
                                placeholder="例：スタンダードプラン"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`plan-price-${index}`}>料金</Label>
                              <Input
                                id={`plan-price-${index}`}
                                value={plan.price}
                                onChange={(e) => handlePlanChange(index, "price", e.target.value)}
                                placeholder="例：3,000円"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2 mt-4">
                            <Label htmlFor={`plan-description-${index}`}>説明</Label>
                            <Input
                              id={`plan-description-${index}`}
                              value={plan.description}
                              onChange={(e) => handlePlanChange(index, "description", e.target.value)}
                              placeholder="例：標準的なサイズのガラスボトルを使用します。"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                      <AlertDescription className="text-sm">
                        「プランを追加」ボタンをクリックして、料��プランを追加してください。
                      </AlertDescription>
                    </Alert>
                  )
                ) : (
                  <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                    <AlertDescription className="text-sm">
                      複数の料金プランがある場合は、「複数プランあり」をオンにしてください。
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-[#2E5A1C]">特徴</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddFeature}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>特徴を追加</span>
                  </Button>
                </div>

                {features.length > 0 ? (
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={feature.content}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder="例：お好きな花材を選べます"
                          className="flex-1"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                    <AlertDescription className="text-sm">
                      「特徴を追加」ボタンをクリックして、レッスンの特徴を追加してください。
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/lessons")} disabled={loading}>
                キャンセル
              </Button>
              <Button type="submit" disabled={loading || images.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  submitButtonText
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}
