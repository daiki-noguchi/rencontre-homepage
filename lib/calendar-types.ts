// カレンダーデータの型定義
export type BusinessDay = {
  id: number
  date: string // ISO形式の日付文字列 "YYYY-MM-DD"
  status: "available" | "closed" | "booked" | "unknown"
  note?: string
  created_at: string
  updated_at?: string
  // リレーション関連
  time_slots?: TimeSlot[]
}

export type TimeSlot = {
  id: number
  calendar_id: number
  start_time: string // "HH:MM:SS"形式
  end_time: string // "HH:MM:SS"形式
  max_capacity: number
  available_capacity: number
  created_at: string
  updated_at?: string
}

// カレンダー操作用の入力型
export type CalendarInput = {
  date: string
  status: "available" | "closed" | "booked" | "unknown"
  note?: string
}

// 複数日付の一括更新用
export type BulkCalendarInput = {
  dates: string[]
  status: "available" | "closed" | "unknown"
  note?: string
}

// 時間枠の入力型
export type TimeSlotInput = {
  calendar_id: number
  start_time: string
  end_time: string
  max_capacity: number
  available_capacity: number
}

// フロントエンド表示用のカレンダーデータ
export type CalendarViewData = {
  date: Date
  status: "available" | "closed" | "booked" | "unknown"
  note?: string
  time_slots?: TimeSlot[]
}

// 月別カレンダーデータ
export type MonthlyCalendarData = {
  year: number
  month: number // 0-11
  days: CalendarViewData[]
}
