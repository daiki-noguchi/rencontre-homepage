import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"

// 環境変数から取得するか、ハードコードされた値を使���
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password"

// JWTの署名と検証に使用するシークレットキー
const secretKey = new TextEncoder().encode(JWT_SECRET)

// ログイン処理
export async function login(username: string, password: string): Promise<boolean> {
  // ユーザー名とパスワードの検証
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return false
  }

  // JWTトークンの生成
  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h") // 8時間の有効期限
    .sign(secretKey)

  // クッキーにトークンを保存
  cookies().set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60, // 8時間（秒単位）
    path: "/",
    sameSite: "strict",
  })

  return true
}

// ログアウト処理
export function logout() {
  cookies().delete("admin-token")
}

// 認証状態の確認
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = cookies().get("admin-token")?.value

    if (!token) {
      return false
    }

    // トークンの検証
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    })

    // ペイロードにusernameとroleが含まれているか確認
    return payload.username === ADMIN_USERNAME && payload.role === "admin"
  } catch (error) {
    console.error("認証エラー:", error)
    return false
  }
}

// クライアントサイドでの認証チェック用
export async function checkAuth(): Promise<{ authenticated: boolean }> {
  return { authenticated: await isAuthenticated() }
}
