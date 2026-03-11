import { getLessonsBasicInfo } from "@/app/actions/lesson-actions"
import LessonsSectionClient from "./lessons-section-client"
import { getDummyLessons } from "@/lib/dummy-data"

export default async function LessonsSection() {
  // サーバーコンポーネントでデータを取得
  let lessons = []

  try {
    // サーバーサイドで基本情報のみを取得（最適化）
    lessons = await getLessonsBasicInfo()
    console.log(`LessonsSection: ${lessons.length}件のレッスン基本情報を取得しました`)

    // データが空の場合はダミーデータを使用
    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
      console.log("LessonsSection: データが空のためダミーデータを使用します")
      lessons = getDummyLessons()
    }
  } catch (error) {
    console.error("LessonsSection: データ取得中に例外が発生しました:", error)
    // エラー時はダミーデータを使用
    lessons = getDummyLessons()
    console.log(`LessonsSection: ダミーデータを使用します (${lessons.length}件)`)
  }

  // 最終チェック - データが確実に配列であることを確認
  if (!Array.isArray(lessons)) {
    console.error("LessonsSection: データが配列ではありません")
    lessons = getDummyLessons()
  }

  // データをクライアントコンポーネントに渡す
  return <LessonsSectionClient initialLessons={lessons} />
}
