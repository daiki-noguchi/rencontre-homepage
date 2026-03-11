"use client"

import { Suspense } from "react"
import CalendarAdminClient from "./calendar-admin-client"

export default function AdminCalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#cee6c1] py-12 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex justify-center items-center h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E5A1C]"></div>
            </div>
          </div>
        </div>
      }
    >
      <CalendarAdminClient />
    </Suspense>
  )
}
