// ミドルウェア（Edge Runtime）からも読み込むため、next/headers に依存しないこと
import { jwtVerify } from "jose"

export const ADMIN_TOKEN_COOKIE = "admin-token"

// 認証情報は環境変数からのみ取得する（未設定の場合はログインできないようにする）
export function getAuthConfig() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  const jwtSecret = process.env.JWT_SECRET

  if (!username || !password || !jwtSecret) {
    console.error("ADMIN_USERNAME / ADMIN_PASSWORD / JWT_SECRET のいずれかが設定されていません")
    return null
  }

  return { username, password, secretKey: new TextEncoder().encode(jwtSecret) }
}

// トークンの検証（ミドルウェアからも利用する）
export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  const config = getAuthConfig()
  if (!config || !token) {
    return false
  }

  try {
    const { payload } = await jwtVerify(token, config.secretKey, {
      algorithms: ["HS256"],
    })

    // ペイロードにusernameとroleが含まれているか確認
    return payload.username === config.username && payload.role === "admin"
  } catch {
    return false
  }
}
