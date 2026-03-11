"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Upload, X } from "lucide-react"
import type { PremiumLessonInput } from "@/lib/premium-lesson-types"
import { createPremiumLesson } from "@/app/actions/premium-lesson-actions"
import { useToast } from "@/components/ui/use-toast"
import { uploadImage } from "@/lib/upload-helpers"
import Image from "next/image"

export default function NewPremiumLessonPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [features, setFeatures] = useState<{ content: string; sort_order: number }[]>([{ content: "", sort_order: 0 }])

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
    setLoading(true)

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
        setLoading(false)
        return
      }

      if (!imageFile) {
        toast({
          title: "画像エラー",
          description: "画像を選択してください",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // 画像のアップロード処理
      let imageUrl = ""
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
          setLoading(false)
          return
        }
      } catch (error) {
        console.error("画像アップロード中にエラーが発生しました:", error)
        toast({
          title: "画像アップロードエラー",
          description: "画像のアップロード中にエラーが発生しました",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // 空の特徴を除外
      const validFeatures = features.filter((f) => f.content.trim() !== "")

      const premiumLessonData: PremiumLessonInput = {
        title,
        description,
        size: size || undefined,
        price,
        image_url: imageUrl,
        features: validFeatures.map((f, i) => ({ content: f.content, sort_order: i })),
      }

      const result = await createPremiumLesson(premiumLessonData)

      if (result.success) {
        toast({
          title: "作成完了",
          description: "プレミアムレッスンが作成されました",
        })
        router.push("/admin/premium-lessons")
      } else {
        toast({
          title: "エラー",
          description: result.error || "プレミアムレッスンの作成に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("プレミアムレッスンの作成中にエラーが発生しました:", error)
      toast({
        title: "エラー",
        description: "プレミアムレッスンの作成中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" asChild className="mr-4">
          <Link href="/admin/premium-lessons">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Link>
        </Button>
        <h1 className="text-3xl font-light tracking-wider text-[#4A2B82]">新規プレミアムレッスン作成</h1>
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
                <Input id="title" name="title" required placeholder="例: 丸リース" />
              </div>

              <div>
                <Label htmlFor="description">
                  説明 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  placeholder="例: 鮮やかなピンク、パープル、ブルーのグラデーションが特徴的な丸型リース。"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">サイズ</Label>
                  <Input id="size" name="size" placeholder="例: 直径20cm〜30cm" />
                </div>
                <div>
                  <Label htmlFor="price">
                    価格 <span className="text-red-500">*</span>
                  </Label>
                  <Input id="price" name="price" required placeholder="例: 6,000円〜8,000円" />
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
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
