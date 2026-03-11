export interface CalendarImage {
  id: number
  title: string
  image_url: string
  display_from: string
  display_until: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CalendarImageInput {
  title: string
  image_url: string
  display_from: string
  display_until: string
  is_active?: boolean
}
