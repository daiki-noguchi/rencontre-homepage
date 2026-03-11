// プレミアムレッスンデータの型定義
export type PremiumLesson = {
  id: number
  title: string
  description: string
  size?: string
  price: string
  image_url: string
  sort_order?: number
  created_at: string
  updated_at?: string
  // リレーション関連
  features?: PremiumLessonFeature[]
}

export type PremiumLessonFeature = {
  id: number
  premium_lesson_id: number
  content: string
  sort_order: number
  created_at: string
}

// フロントエンド表示用にまとめたプレミアムレッスンタイプ
export type PremiumLessonWithFeatures = PremiumLesson & {
  features: PremiumLessonFeature[]
}

// プレミアムレッスン作成・更新用の入力データ型
export type PremiumLessonInput = Omit<PremiumLesson, "id" | "created_at" | "updated_at" | "features"> & {
  features?: Omit<PremiumLessonFeature, "id" | "premium_lesson_id" | "created_at">[]
}
