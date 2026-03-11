export interface LessonImage {
  id?: number
  lesson_id?: number
  image_url: string
  is_main: boolean
  sort_order: number
}

export interface LessonPlan {
  id?: number
  lesson_id?: number
  name: string
  price: string
  description?: string
  sort_order: number
}

export interface LessonFeature {
  id?: number
  lesson_id?: number
  content: string
  sort_order: number
}

export interface Lesson {
  id: number
  name_ja: string
  name_en: string
  description: string
  duration?: string
  fee?: string
  capacity?: string
  category?: string
  has_multiple_plans?: boolean
  detail_info?: string
  is_order_only?: boolean
  sort_order: number
  created_at: string
  images?: LessonImage[]
  plans?: LessonPlan[]
  features?: LessonFeature[]
}

export interface LessonInput {
  name_ja: string
  name_en: string
  description: string
  duration?: string
  fee?: string
  capacity?: string
  category?: string
  has_multiple_plans?: boolean
  detail_info?: string
  is_order_only?: boolean
  sort_order: number
  images: {
    image_url: string
    is_main: boolean
    sort_order: number
  }[]
  plans: {
    name: string
    price: string
    description?: string
    sort_order: number
  }[]
  features: {
    content: string
    sort_order: number
  }[]
}

export interface NewsArticle {
  id: number
  title: string
  date: string
  category: string
  content: string
  full_content?: string
  image_url?: string
  event_details?: {
    dates?: string
    time?: string
    location?: string
    organizer?: string
    address?: string
    access?: string
    fee?: string
    contact?: string
  }
  related_links?: {
    title: string
    url: string
  }[]
  created_at: string
}

export interface NewsInput {
  title: string
  content: string
  full_content?: string
  image_url?: string
  category?: string
  date?: string
  published_at?: string
}

export interface SimpleLessonInput {
  name: string
  description: string
  image_url: string
  sort_order: number
}

export interface SimpleLesson {
  id: number
  name: string
  description: string
  image_url: string
  sort_order: number
  created_at: string
}

export type LessonWithRelations = Lesson & {
  images: LessonImage[]
  plans: LessonPlan[]
  features: LessonFeature[]
}

export type News = {
  id: number
  title: string
  date: string
  category: string
  content: string
  full_content?: string
  image_url?: string
  created_at: string
}
