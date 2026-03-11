// シンプルなレッスンデータの型定義
export type SimpleLesson = {
  id: number
  name_ja: string
  name_en: string
  description: string
  duration?: string
  fee?: string
  capacity?: string
  category?: string
  is_order_only?: boolean
  image_url?: string // メイン画像のURLを直接持つように変更
}

// ダミーデータ
export const DUMMY_LESSONS: SimpleLesson[] = [
  {
    id: 1,
    name_ja: "ハーバリウム",
    name_en: "Herbarium",
    description: "透明なガラス瓶の中に、色とりどりのドライフラワーとオイルを入れて作る、美しいインテリア雑貨です。",
    duration: "約2時間",
    fee: "3,500円〜",
    capacity: "4名まで",
    category: "インテリア",
    is_order_only: false,
    image_url: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 2,
    name_ja: "フラワーリース",
    name_en: "Flower Wreath",
    description: "季節のドライフラワーを使って、玄関やお部屋を彩るリースを作ります。",
    duration: "約2.5時間",
    fee: "4,500円〜",
    capacity: "4名まで",
    category: "インテリア",
    is_order_only: false,
    image_url: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 3,
    name_ja: "アロマワックスサシェ",
    name_en: "Aroma Wax Sachet",
    description: "アロマオイルを混ぜたソイワックスとドライフラワーで作る、香りのインテリア雑貨です。",
    duration: "約2時間",
    fee: "3,800円〜",
    capacity: "4名まで",
    category: "アロマ",
    is_order_only: false,
    image_url: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 4,
    name_ja: "フラワーアレンジメント",
    name_en: "Flower Arrangement",
    description: "季節の生花を使って、美しいアレンジメントを作ります。初心者の方でも安心して参加いただけます。",
    duration: "約2時間",
    fee: "5,000円〜",
    capacity: "4名まで",
    category: "アレンジメント",
    is_order_only: false,
    image_url: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 5,
    name_ja: "プリザーブドフラワー",
    name_en: "Preserved Flower",
    description: "特殊加工された生花のような美しさと風合いを持つプリザーブドフラワーを使ったアレンジメントを作ります。",
    duration: "約2.5時間",
    fee: "6,000円〜",
    capacity: "4名まで",
    category: "アレンジメント",
    is_order_only: false,
    image_url: "/placeholder.svg?height=400&width=600",
  },
]
