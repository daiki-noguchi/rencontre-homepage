import { cookies } from "next/headers"
import { SignJWT } from "jose"
import { ADMIN_TOKEN_COOKIE, getAuthConfig, verifyAdminToken } from "./admin-token"

export { ADMIN_TOKEN_COOKIE, verifyAdminToken }

// ログイン処理
export async function login(username: string, password: string): Promise<boolean> {
  const config = getAuthConfig()
  if (!config) {
    return false
  }

  // ユーザー名とパスワードの検証
  if (username !== config.username || password !== config.password) {
    return false
  }

  // JWTトークンの生成
  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h") // 8時間の有効期限
    .sign(config.secretKey)

  // クッキーにトークンを保存
  cookies().set(ADMIN_TOKEN_COOKIE, token, {
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
  cookies().delete(ADMIN_TOKEN_COOKIE)
}

// 認証状態の確認
export async function isAuthenticated(): Promise<boolean> {
  return verifyAdminToken(cookies().get(ADMIN_TOKEN_COOKIE)?.value)
}

// 管理者専用のサーバーアクション・APIルートの先頭で呼び出す
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("管理者としてログインしていません。再度ログインしてください。")
  }
}

// クライアントサイドでの認証チェック用
export async function checkAuth(): Promise<{ authenticated: boolean }> {
  return { authenticated: await isAuthenticated() }
}
