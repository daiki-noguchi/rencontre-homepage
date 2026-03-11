"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Upload, X } from "lucide-react"
import type { PremiumLessonInput, PremiumLessonWithFeatures } from "@/lib/premium-lesson-types"
import { getPremiumLesson, updatePremiumLesson } from "@/app/actions/premium-lesson-actions"
import { useToast } from "@/components/ui/use-toast"
import { uploadImage } from "@/lib/upload-helpers"
import Image from "next/image"

export default function EditPremiumLessonPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lesson, setLesson] = useState<PremiumLessonWithFeatures | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [features, setFeatures] = useState<{ content: string; sort_order: number }[]>([])

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        // IDが数値であることを確認
        const id = Number.parseInt(params.id)
        if (isNaN(id)) {
          toast({
            title: "エラー",
            description: "無効なレッスンIDです",
            variant: "destructive",
          })
          router.push("/admin/premium-lessons")
          return
        }

        const data = await getPremiumLesson(id)
        if (data) {
          setLesson(data)
          setImagePreview(data.image_url)
          setFeatures(
            data.features?.length
              ? data.features.map((f) => ({ content: f.content, sort_order: f.sort_order }))
              : [{ content: "", sort_order: 0 }],
          )
        } else {
          toast({
            title: "エラー",
            description: "プレミアムレッスンが見つかりませんでした",
            variant: "destructive",
          })
          router.push("/admin/premium-lessons")
        }
      } catch (error) {
        console.error("プレミアムレッスンの取得に失敗しました:", error)
        toast({
          title: "エラー",
          description: "プレミアムレッスンの取得に失敗しました",
          variant: "destructive",
        })
        router.push("/admin/premium-lessons")
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [params.id, router, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("image")) {
      toast({
        title: "エラー",
        description: "画像ファイルを選択してください",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAddFeature = () => {
    setFeatures([...features, { content: "", sort_order: features.length }])
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index].content = value
    setFeatures(newFeatures)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const size = formData.get("size") as string
      const price = formData.get("price") as string

      if (!title || !description || !price) {
        toast({
          title: "入力エラー",
          description: "必須項目を入力してください",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      if (!imagePreview) {
        toast({
          title: "画像エラー",
          description: "画像を選択してください",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      // 画像のアップロード処理
      let imageUrl = lesson?.image_url || ""
      if (imageFile) {
        try {
          const uploadResult = await uploadImage(imageFile)
          if (uploadResult.success) {
            imageUrl = uploadResult.url
          } else {
            toast({
              title: "画像アップロードエラー",
              description: uploadResult.error || "画像のアップロードに失敗しました",
              variant: "destructive",
            })
            setSaving(false)
            return
          }
        } catch (error) {
          console.error("画像アップロード中にエラーが発生しました:", error)
          toast({
            title: "画像アップロードエラー",
            description: "画像のアップロード中にエラーが発生しました",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
      } else if (imagePreview.startsWith("data:")) {
        // Base64画像の場合はアップロードが必要
        toast({
          title: "画像エラー",
          description: "画像の保存に失敗しました。再度アップロードしてください",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      // 空の特徴を除外
      const validFeatures = features.filter((f) => f.content.trim() !== "")

      // IDが数値であることを確認
      const id = Number.parseInt(params.id)
      if (isNaN(id)) {
        toast({
          title: "エラー",
          description: "無効なレッスンIDです",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      const premiumLessonData: PremiumLessonInput = {
        title,
        description,
        size: size || undefined,
        price,
        image_url: imageUrl,
        sort_order: lesson?.sort_order || 0,
        features: validFeatures.map((f, i) => ({ content: f.content, sort_order: i })),
      }

      const result = await updatePremiumLesson(id, premiumLessonData)

      if (result.success) {
        toast({
          title: "更新完了",
          description: "プレミアムレッスンが更新されました",
        })
        router.push("/admin/premium-lessons")
      } else {
        toast({
          title: "エラー",
          description: result.error || "プレミアムレッスンの更新に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("プレミアムレッスンの更新中にエラーが発生しました:", error)
      toast({
        title: "エラー",
        description: "プレミアムレッスンの更新中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" asChild className="mr-4">
            <Link href="/admin/premium-lessons">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <h1 className="text-3xl font-light tracking-wider text-[#4A2B82]">プレミアムレッスン編集</h1>
        </div>
        <Card className="bg-white/90 border-none shadow-md animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!lesson) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" asChild className="mr-4">
          <Link href="/admin/premium-lessons">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Link>
        </Button>
        <h1 className="text-3xl font-light tracking-wider text-[#4A2B82]">プレミアムレッスン編集</h1>
      </div>

      <Card className="bg-white/90 border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-[#4A2B82]">プレミアムレッスン情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">
                  タイトル <span className="text-red-500">*</span>
                </Label>
                <Input id="title" name="title" required defaultValue={lesson.title} />
              </div>

              <div>
                <Label htmlFor="description">
                  説明 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  defaultValue={lesson.description}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">サイズ</Label>
                  <Input id="size" name="size" defaultValue={lesson.size || ""} />
                </div>
                <div>
                  <Label htmlFor="price">
                    価格 <span className="text-red-500">*</span>
                  </Label>
                  <Input id="price" name="price" required defaultValue={lesson.price} />
                </div>
              </div>

              <div>
                <Label>
                  画像 <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full h-64 mb-4">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="プレビュー"
                        fill
                        className="object-cover rounded-md"
                        sizes="(max-width: 768px) 100vw, 600px"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">画像をアップロードしてください</p>
                      <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}>
                        画像を選択
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>特徴</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddFeature}>
                    <Plus className="h-4 w-4 mr-1" /> 追加
                  </Button>
                </div>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature.content}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="例: 華やかな色彩が空間を彩ります"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveFeature(index)}
                        disabled={features.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/premium-lessons">キャンセル</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
