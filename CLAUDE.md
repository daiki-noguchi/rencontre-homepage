# Rencontre Homepage

## Supabase

- Supabaseは無料プランを使用しており、一定期間無操作でプロジェクトが一時停止（paused）される。fetchエラーが発生した場合、コード修正の前にまずSupabaseダッシュボードでプロジェクトが一時停止になっていないか確認すること。

## 管理画面の認証・DB権限

- 管理画面のログイン情報はVercelの環境変数 `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `JWT_SECRET` で管理する（未設定だとログイン不可）。コードやクライアントに認証情報を書かないこと。
- Supabaseの匿名キーは読み取り専用（RLSでSELECTのみ許可）。書き込みは必ずサーバーアクション内で `requireAdmin()` を呼んだうえでサービスロールキー（`createServiceRoleClient()`）を使う。
- テーブルを追加したら RLS を有効化し、`supabase/2026-10-10_lockdown_permissions.sql` と同様の権限設定を行うこと。
