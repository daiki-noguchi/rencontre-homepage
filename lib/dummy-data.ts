import type { LessonWithRelations } from "@/lib/lesson-types"
import type { NewsArticle } from "./supabase"

// ダミーレッスンデータを取得する関数
export function getDummyLessons(): LessonWithRelations[] {
  return [
    {
      id: 1,
      name_ja: "ハーバリウム",
      name_en: "Herbarium",
      description: "透明なガラス瓶の中に、色とりどりのドライフラワーとオイルを入れて作る、美しいインテリア雑貨です。",
      duration: "約2時間",
      fee: "3,500円〜",
      capacity: "4名まで",
      category: "インテリア",
      has_multiple_plans: false,
      is_order_only: false,
      created_at: "2025-01-01T00:00:00Z",
      images: [
        {
          id: 1,
          lesson_id: 1,
          image_url: "/placeholder.svg?height=400&width=600",
          is_main: true,
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
      plans: [],
      features: [
        {
          id: 1,
          lesson_id: 1,
          content: "初心者でも簡単に作れます",
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 2,
          lesson_id: 1,
          content: "お好きな色や花材を選べます",
          sort_order: 1,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
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
      has_multiple_plans: false,
      is_order_only: false,
      created_at: "2025-01-01T00:00:00Z",
      images: [
        {
          id: 3,
          lesson_id: 2,
          image_url: "/placeholder.svg?height=400&width=600",
          is_main: true,
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
      plans: [],
      features: [
        {
          id: 3,
          lesson_id: 2,
          content: "季節に合わせたデザインが選べます",
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
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
      has_multiple_plans: false,
      is_order_only: false,
      created_at: "2025-01-01T00:00:00Z",
      images: [
        {
          id: 5,
          lesson_id: 3,
          image_url: "/placeholder.svg?height=400&width=600",
          is_main: true,
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
      plans: [],
      features: [
        {
          id: 5,
          lesson_id: 3,
          content: "お好きな香りを選べます",
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
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
      has_multiple_plans: false,
      is_order_only: false,
      created_at: "2025-01-01T00:00:00Z",
      images: [
        {
          id: 7,
          lesson_id: 4,
          image_url: "/placeholder.svg?height=400&width=600",
          is_main: true,
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
      plans: [],
      features: [
        {
          id: 7,
          lesson_id: 4,
          content: "季節の花材を使用します",
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
    },
    {
      id: 5,
      name_ja: "プリザーブドフラワー",
      name_en: "Preserved Flower",
      description:
        "特殊加工された生花のような美しさと風合いを持つプリザーブドフラワーを使ったアレンジメントを作ります。",
      duration: "約2.5時間",
      fee: "6,000円〜",
      capacity: "4名まで",
      category: "アレンジメント",
      has_multiple_plans: false,
      is_order_only: false,
      created_at: "2025-01-01T00:00:00Z",
      images: [
        {
          id: 9,
          lesson_id: 5,
          image_url: "/placeholder.svg?height=400&width=600",
          is_main: true,
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
      plans: [],
      features: [
        {
          id: 9,
          lesson_id: 5,
          content: "長期間美しさを保ちます",
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
    },
    {
      id: 6,
      name_ja: "フラワーボックス",
      name_en: "Flower Box",
      description: "おしゃれなボックスに詰めたフラワーアレンジメント。贈り物にも最適です。",
      duration: "約2時間",
      fee: "5,500円〜",
      capacity: "4名まで",
      category: "アレンジメント",
      has_multiple_plans: false,
      is_order_only: false,
      created_at: "2025-01-01T00:00:00Z",
      images: [
        {
          id: 11,
          lesson_id: 6,
          image_url: "/placeholder.svg?height=400&width=600",
          is_main: true,
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
      plans: [],
      features: [
        {
          id: 11,
          lesson_id: 6,
          content: "ギフトにも最適です",
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
    },
    {
      id: 7,
      name_ja: "七色星花アレンジメント",
      name_en: "Seven-Color Star Flower Arrangement",
      description: "七色の花材を使った特別なアレンジメント。takako先生認定の特別レッスンです。",
      duration: "約3時間",
      fee: "8,000円〜",
      capacity: "4名まで",
      category: "プレミアム",
      has_multiple_plans: false,
      is_order_only: false,
      created_at: "2025-01-01T00:00:00Z",
      images: [
        {
          id: 13,
          lesson_id: 7,
          image_url: "/placeholder.svg?height=400&width=600",
          is_main: true,
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
      plans: [],
      features: [
        {
          id: 13,
          lesson_id: 7,
          content: "takako先生認定の特別レッスン",
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
    },
    {
      id: 8,
      name_ja: "インアリウム",
      name_en: "Inarium",
      description:
        "特殊な技法で作る、生花のような美しさを長期間保つことができる新しいタイプのフラワーアレンジメントです。",
      duration: "要相談",
      fee: "10,000円〜",
      capacity: "2名まで",
      category: "プレミアム",
      has_multiple_plans: false,
      is_order_only: true,
      detail_info:
        "インアリウムは、特殊な技法と素材を使用して作られる新しいタイプのフラワーアレンジメントです。生花のような美しさと立体感を保ちながら、長期間（約1年）その美しさを楽しむことができます。\n\n通常のドライフラワーやプリザーブドフラワーとは異なり、特殊な加工技術により、花の色彩や形状を最大限に保存します。一つ一つ丁寧に手作業で作られるため、世界に一つだけの作品となります。\n\n結婚式の思い出や特別な記念日の花を保存したい方、長く美しい花を楽しみたい方におすすめです。",
      created_at: "2025-01-01T00:00:00Z",
      images: [
        {
          id: 15,
          lesson_id: 8,
          image_url: "/placeholder.svg?height=400&width=600",
          is_main: true,
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 16,
          lesson_id: 8,
          image_url: "/placeholder.svg?height=400&width=600",
          is_main: false,
          sort_order: 1,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 17,
          lesson_id: 8,
          image_url: "/placeholder.svg?height=400&width=600",
          is_main: false,
          sort_order: 2,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
      plans: [],
      features: [
        {
          id: 15,
          lesson_id: 8,
          content: "約1年間美しさを保ちます",
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 16,
          lesson_id: 8,
          content: "特殊な技法で作られます",
          sort_order: 1,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 17,
          lesson_id: 8,
          content: "世界に一つだけの作品になります",
          sort_order: 2,
          created_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 18,
          lesson_id: 8,
          content: "記念日の花を保存するのに最適です",
          sort_order: 3,
          created_at: "2025-01-01T00:00:00Z",
        },
      ],
    },
  ]
}

// ダミーニュースデータを取得する関数
export function getDummyNews(): NewsArticle[] {
  return [
    {
      id: 1,
      title: "春のフラワーアレンジメント特別レッスン開催",
      date: "2025-04-15",
      category: "イベント",
      content:
        "春の花材を使った特別レッスンを開催します。桜やチューリップなど、春ならではの花材を使ったアレンジメントを学びましょう。",
      created_at: "2025-03-01T00:00:00Z",
      full_content:
        "春の花材を使った特別レッスンを開催します。桜やチューリップなど、春ならではの花材を使ったアレンジメントを学びましょう。\n\n参加者には、特製の花器をプレゼントいたします。初心者の方も安心してご参加いただけます。",
      event_details: {
        dates: "2025年4月15日（火）",
        time: "14:00〜16:00",
        location: "森の音スタジオ",
        fee: "5,000円（材料費込み）",
        contact: "info@morinooto.jp",
      },
    },
    {
      id: 2,
      title: "新しいレッスンメニュー「七色星花アレンジメント」が登場",
      date: "2025-03-10",
      category: "お知らせ",
      content: "takako先生認定の特別レッスンメニュー「七色星花アレンジメント」が新しく登場しました。",
      created_at: "2025-03-01T00:00:00Z",
      full_content:
        "takako先生認定の特別レッスンメニュー「七色星花アレンジメント」が新しく登場しました。\n\n七色の花材を使用し、星型に配置する独自のアレンジメント技法です。季節ごとに異なる花材を使用するため、一年を通して楽しめるレッスンとなっています。",
    },
    {
      id: 3,
      title: "GW期間中の営業について",
      date: "2025-04-20",
      category: "お知らせ",
      content: "ゴールデンウィーク期間中は通常通り営業いたします。",
      created_at: "2025-03-01T00:00:00Z",
      full_content:
        "ゴールデンウィーク期間中（2025年4月29日〜5月5日）は通常通り営業いたします。\n\n期間中は特別レッスンも開催予定ですので、ぜひお越しください。詳細は後日お知らせいたします。",
    },
  ]
}

// カテゴリーでフィルタリングしたダミーニュースデータを取得する関数
export function getDummyNewsByCategory(category: string): NewsArticle[] {
  return getDummyNews().filter((news) => news.category === category)
}

// IDでダミーニュース記事を取得する関数
export function getDummyNewsById(id: number): NewsArticle | null {
  return getDummyNews().find((news) => news.id === id) || null
}
