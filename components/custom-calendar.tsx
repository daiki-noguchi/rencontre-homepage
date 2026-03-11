"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  isSameDay,
  isSameMonth,
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns"
import { ja } from "date-fns/locale"

interface CustomCalendarProps {
  onSelectDate: (date: Date | undefined) => void
  availableDates: Date[]
  closedDates: Date[]
  unknownDates?: Date[] // 未定の日付を追加
  selectedDate?: Date
  initialMonth?: Date
  hideNavigation?: boolean
  selectedDates?: Date[] // 一括モード用
  bulkMode?: boolean // 一括モード用
}

export function CustomCalendar({
  onSelectDate,
  availableDates,
  closedDates,
  unknownDates = [],
  selectedDate,
  initialMonth = new Date(),
  hideNavigation = false,
  selectedDates = [],
  bulkMode = false,
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [calendarDays, setCalendarDays] = useState<Date[]>([])

  // 月が変わったときにカレンダーの日付を再計算
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = monthStart
    const endDate = monthEnd

    // 月の全日を取得
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    setCalendarDays(days)
  }, [currentMonth])

  // 初期月が変更されたときに現在の月を更新
  useEffect(() => {
    setCurrentMonth(initialMonth)
  }, [initialMonth])

  // 前月へ
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // 翌月へ
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // 日付が営業日かどうかを判定
  const isAvailable = (date: Date) => {
    return availableDates.some((availableDate) => isSameDay(availableDate, date))
  }

  // 日付が休業日かどうかを判定
  const isClosed = (date: Date) => {
    return closedDates.some((closedDate) => isSameDay(closedDate, date))
  }

  // 日付が未定かどうかを判定
  const isUnknown = (date: Date) => {
    return unknownDates.some((unknownDate) => isSameDay(unknownDate, date))
  }

  // 日付が選択されているかどうかを判定（一括モード用）
  const isSelected = (date: Date) => {
    return selectedDates.some((selectedDate) => isSameDay(selectedDate, date))
  }

  // 曜日の配列（日本語）
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"]

  return (
    <div className="w-full max-w-sm mx-auto">
      {!hideNavigation && (
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">前月</span>
          </Button>
          <h2 className="text-lg font-medium">{format(currentMonth, "yyyy年MM月", { locale: ja })}</h2>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">翌月</span>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((day, index) => (
          <div
            key={index}
            className={`text-center text-sm font-medium py-1 ${
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* 月初めの空白を埋める */}
        {Array.from({ length: getDay(startOfMonth(currentMonth)) }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-10"></div>
        ))}

        {/* カレンダーの日付 */}
        {calendarDays.map((day, index) => {
          const isToday = isSameDay(day, new Date())
          const isSelectedDay = selectedDate ? isSameDay(day, selectedDate) : false
          const isSelectedInBulk = isSelected(day)
          const dayAvailable = isAvailable(day)
          const dayClosed = isClosed(day)
          const dayUnknown = isUnknown(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)

          // 曜日（0: 日曜日, 6: 土曜日）
          const dayOfWeek = getDay(day)
          const isSunday = dayOfWeek === 0
          const isSaturday = dayOfWeek === 6

          return (
            <button
              key={index}
              onClick={() => onSelectDate(day)}
              className={`
                h-10 w-full flex items-center justify-center rounded-md relative
                ${!isCurrentMonth ? "opacity-50" : ""}
                ${isToday ? "font-bold" : ""}
                ${
                  dayAvailable
                    ? "bg-[#60A5FA] text-white hover:bg-blue-600"
                    : dayClosed
                      ? "bg-[#EF4444] text-white hover:bg-red-600"
                      : dayUnknown
                        ? "bg-[#1F2937] text-white hover:bg-gray-800"
                        : "bg-white hover:bg-gray-100"
                }
                ${
                  (isSelectedDay && !bulkMode) || (isSelectedInBulk && bulkMode)
                    ? "ring-2 ring-offset-1 ring-blue-500"
                    : ""
                }
                ${isSunday ? "text-red-500" : isSaturday ? "text-blue-500" : ""}
              `}
              disabled={false}
            >
              {day.getDate()}
            </button>
          )
        })}

        {/* 月末の空白を埋める */}
        {Array.from({
          length: 6 - getDay(endOfMonth(currentMonth)),
        }).map((_, index) => (
          <div key={`empty-end-${index}`} className="h-10"></div>
        ))}
      </div>
    </div>
  )
}
