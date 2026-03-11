"use server"

import { createClient } from "@supabase/supabase-js"
import type {
  BusinessDay,
  CalendarInput,
  BulkCalendarInput,
  TimeSlotInput,
  MonthlyCalendarData,
  CalendarViewData,
} from "@/lib/calendar-types"
import { revalidatePath } from "next/cache"
import type { TimeSlot } from "@/lib/calendar-types"
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env"

// デバッグログ用の関数
function logDebug(message: string, data?: any) {
  console.log(`[Calendar Action] ${message}`, data ? data : "")
}

// サービスロールクライアントのシングルトンインスタンス
let serviceRoleClient: ReturnType<typeof createClient> | null = null

// サーバーアクション用のSupabaseクライアントを作成
const createCalendarActionClient = (useServiceRole = false) => {
  // 既存のクライアントがあれば再利用
  if (serviceRoleClient) {
    console.log("既存のサービスロールクライアントを再利用します")
    return serviceRoleClient
  }

  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseAnonKey()

    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("カレンダーアクション用クライアントの作成に失敗しました:", error)
    return null
  }
}

// 特定の月のカレンダーデータを取得する
export async function getMonthlyCalendar(year: number, month: number): Promise<MonthlyCalendarData> {
  try {
    logDebug(`${year}年${month + 1}月のカレンダーデータを取得します`)

    // カレンダー専用のSupabaseクライアントを作成
    const supabase = createCalendarActionClient(true) // サービスロールを使用
    if (!supabase) {
      throw new Error("カレンダー用Supabaseクライアントの作成に失敗しました")
    }

    // 月の最初の日と最後の日を計算
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // ISO形式の日付文字列に変換（タイムゾーンの問題を避けるため、直接文字列を構築）
    const startDate = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}-${String(firstDay.getDate()).padStart(2, "0")}`
    const endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`

    logDebug(`期間: ${startDate} から ${endDate}`)

    // データベースからその月のデータを取得
    const { data, error } = await supabase
      .from("business_calendar")
      .select("*, time_slots(*)")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    if (error) {
      logDebug("カレンダーデータの取得に失敗しました:", error)
      throw error
    }

    logDebug(`取得したデータ: ${data?.length || 0}件`)

    // 月の全日を生成し、データベースからのデータと結合
    const daysInMonth = lastDay.getDate()
    const calendarDays: CalendarViewData[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      // タイムゾーンの問題を避けるため、直接文字列を構築
      const isoDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`

      // データベースにある日付かどうかを確認
      const dayData = data?.find((d) => d.date === isoDate)

      if (dayData) {
        calendarDays.push({
          date: currentDate,
          status: dayData.status,
          note: dayData.note,
          time_slots: dayData.time_slots,
        })
      } else {
        // データベースにない場合はunknownステータスで追加
        calendarDays.push({
          date: currentDate,
          status: "unknown",
        })
      }
    }

    return {
      year,
      month,
      days: calendarDays,
    }
  } catch (error) {
    logDebug("月別カレンダーデータの取得中にエラーが発生しました:", error)
    // エラー時は空のデータを返す
    return {
      year,
      month,
      days: [],
    }
  }
}

// 特定の日付の営業状態を設定する
export async function setBusinessDay(
  input: CalendarInput,
): Promise<{ success: boolean; error?: string; data?: BusinessDay }> {
  try {
    logDebug(`${input.date}の営業状態を設定します`, input)

    // カレンダー専用のSupabaseクライアントを作成
    const supabase = createCalendarActionClient(true) // サービスロールを使用
    if (!supabase) {
      logDebug("カレンダー用Supabaseクライアントの作成に失敗しました")
      return { success: false, error: "カレンダー用Supabaseクライアントの作成に失敗しました" }
    }

    // 入力データのバリデーション
    if (!input.date || !input.status) {
      logDebug("バリデーションエラー: 日付とステータスは必須です")
      return { success: false, error: "日付とステータスは必須です" }
    }

    // 既存データを確認
    const { data: existingData, error: checkError } = await supabase
      .from("business_calendar")
      .select("id")
      .eq("date", input.date)
      .maybeSingle()

    if (checkError) {
      logDebug("既存データの確認中にエラーが発生しました:", checkError)
      return { success: false, error: checkError.message }
    }

    logDebug("既存データ確認結果:", existingData)

    let result

    if (existingData) {
      // 既存データの更新
      logDebug(`ID: ${existingData.id}のデータを更新します`)
      const { data, error } = await supabase
        .from("business_calendar")
        .update({
          status: input.status,
          note: input.note || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingData.id)
        .select("*")
        .single()

      if (error) {
        logDebug("営業日の更新に失敗しました:", error)
        return { success: false, error: error.message }
      }

      result = data
      logDebug("更新結果:", result)
    } else {
      // 新規データの挿入
      logDebug("新規データを挿入します")
      const { data, error } = await supabase
        .from("business_calendar")
        .insert({
          date: input.date,
          status: input.status,
          note: input.note || null,
        })
        .select("*")
        .single()

      if (error) {
        logDebug("営業日の追加に失敗しました:", error)
        return { success: false, error: error.message }
      }

      result = data
      logDebug("挿入結果:", result)
    }

    // キャッシュを更新
    logDebug("キャッシュを更新します")
    revalidatePath("/reservation")
    revalidatePath("/admin/calendar")

    return { success: true, data: result }
  } catch (error) {
    logDebug("営業日の設定中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// 複数の日付の営業状態を一括設定する
export async function setBulkBusinessDays(
  input: BulkCalendarInput,
): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    logDebug(`${input.dates.length}件の日付の営業状態を一括設定します`, input)

    // カレンダー専用のSupabaseクライアントを作成
    const supabase = createCalendarActionClient(true) // サービスロールを使用
    if (!supabase) {
      logDebug("カレンダー用Supabaseクライアントの作成に失敗しました")
      return { success: false, error: "カレンダー用Supabaseクライアントの作成に失敗しました" }
    }

    // 入力データのバリデーション
    if (!input.dates || !input.dates.length || !input.status) {
      logDebug("バリデーションエラー: 日付とステータスは必須です")
      return { success: false, error: "日付とステータスは必須です" }
    }

    // 一括処理用のデータを準備
    const bulkData = input.dates.map((date) => ({
      date,
      status: input.status,
      note: input.note || null,
      updated_at: new Date().toISOString(),
    }))

    logDebug("一括処理データ:", bulkData)

    // upsert操作（存在すれば更新、なければ挿入）
    const { data, error } = await supabase
      .from("business_calendar")
      .upsert(bulkData, {
        onConflict: "date",
        ignoreDuplicates: false,
      })
      .select("id")

    if (error) {
      logDebug("営業日の一括設定に失敗しました:", error)
      return { success: false, error: error.message }
    }

    logDebug("一括設定結果:", data)

    // キャッシュを更新
    logDebug("キャッシュを更新します")
    revalidatePath("/reservation")
    revalidatePath("/admin/calendar")

    return { success: true, count: data.length }
  } catch (error) {
    logDebug("営業日の一括設定中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// 時間枠を追加する
export async function addTimeSlot(
  input: TimeSlotInput,
): Promise<{ success: boolean; error?: string; data?: TimeSlot }> {
  try {
    logDebug(`カレンダーID ${input.calendar_id} に時間枠を追加します`, input)

    // カレンダー専用のSupabaseクライアントを作成
    const supabase = createCalendarActionClient(true) // サービスロールを使用
    if (!supabase) {
      return { success: false, error: "カレンダー用Supabaseクライアントの作成に失敗しました" }
    }

    // 入力データのバリデーション
    if (!input.calendar_id || !input.start_time || !input.end_time) {
      return { success: false, error: "カレンダーIDと開始・終了時間は必須です" }
    }

    // 時間枠を追加
    const { data, error } = await supabase
      .from("time_slots")
      .insert({
        calendar_id: input.calendar_id,
        start_time: input.start_time,
        end_time: input.end_time,
        max_capacity: input.max_capacity || 4,
        available_capacity: input.available_capacity || input.max_capacity || 4,
      })
      .select("*")
      .single()

    if (error) {
      logDebug("時間枠の追加に失敗しました:", error)
      return { success: false, error: error.message }
    }

    // キャッシュを更新
    revalidatePath("/reservation")
    revalidatePath("/admin/calendar")

    return { success: true, data }
  } catch (error) {
    logDebug("時間枠の追加中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// 時間枠を削除する
export async function deleteTimeSlot(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    logDebug(`時間枠ID ${id} を削除します`)

    // カレンダー専用のSupabaseクライアントを作成
    const supabase = createCalendarActionClient(true) // サービスロールを使用
    if (!supabase) {
      return { success: false, error: "カレンダー用Supabaseクライアントの作成に失敗しました" }
    }

    // 時間枠を削除
    const { error } = await supabase.from("time_slots").delete().eq("id", id)

    if (error) {
      logDebug("時間枠の削除に失敗しました:", error)
      return { success: false, error: error.message }
    }

    // キャッシュを更新
    revalidatePath("/reservation")
    revalidatePath("/admin/calendar")

    return { success: true }
  } catch (error) {
    logDebug("時間枠の削除中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
    }
  }
}

// 公開用のカレンダーデータを取得する（ユーザー向け予約ページ用）
export async function getPublicCalendar(year: number, month: number): Promise<CalendarViewData[]> {
  try {
    logDebug(`${year}年${month + 1}月の公開カレンダーデータを取得します`)

    // カレンダー専用のSupabaseクライアントを作成（匿名キーを使用）
    const supabase = createCalendarActionClient(false) // 匿名キーを使用
    if (!supabase) {
      throw new Error("カレンダー用Supabaseクライアントの作成に失敗しました")
    }

    // 月の最初の日と最後の日を計算
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // ISO形式の日付文字列に変換（タイムゾーンの問題を避けるため、直接文字列を構築）
    const startDate = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}-${String(firstDay.getDate()).padStart(2, "0")}`
    const endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`

    // キャッシュを無効化するためのタイムスタンプパラメータを追加
    const timestamp = new Date().getTime()

    // データベースからその月のデータを取得
    const { data, error } = await supabase
      .from("business_calendar")
      .select("date, status, note")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .headers({ "Cache-Control": "no-cache", Pragma: "no-cache", "X-Timestamp": timestamp.toString() })

    if (error) {
      logDebug("公開カレンダーデータの取得に失敗しました:", error)
      throw error
    }

    logDebug(`公開カレンダーデータ取得結果: ${data?.length || 0}件`)

    // 日付オブジェクトに変換
    return (data || []).map((item) => {
      // 日付文字列をパースして新しいDateオブジェクトを作成（タイムゾーンの問題を避けるため）
      const dateParts = item.date.split("-").map(Number)
      const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])

      return {
        date,
        status: item.status,
        note: item.note,
      }
    })
  } catch (error) {
    logDebug("公開カレンダーデータの取得中にエラーが発生しました:", error)
    return []
  }
}
