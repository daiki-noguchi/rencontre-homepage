-- 匿名キー（ブラウザに公開される鍵）では読み取りのみ可能にし、
-- 書き込みはサーバー側のサービスロールキー（RLSをバイパス）経由に限定する。
-- Supabaseダッシュボードの SQL Editor で実行する。何度実行しても同じ結果になる。

begin;

-- 1. 公開テーブル: anon/authenticated は SELECT のみ
do $$
declare
  t text;
  p record;
begin
  foreach t in array array[
    'news', 'lessons', 'lesson_images', 'lesson_plans', 'lesson_features',
    'premium_lessons', 'premium_lesson_features',
    'business_calendar', 'time_slots', 'calendar_images'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    execute format('create policy public_read on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

-- 2. users: anon/authenticated からは一切アクセス不可
alter table public.users enable row level security;
do $$
declare
  p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'users' loop
    execute format('drop policy %I on public.users', p.policyname);
  end loop;
end $$;

-- 3. 念のためテーブル権限でも書き込みを剥奪
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
revoke all on table public.users from anon, authenticated;

-- 4. 書き込み系RPC（アプリからは未使用）を anon/authenticated から実行不可に
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('create_lesson', 'add_lesson_images', 'add_lesson_plans', 'add_lesson_features')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
  end loop;
end $$;

-- 5. Storage: 書き込み系ポリシーを削除し、images バケットの読み取りのみ許可
do $$
declare
  p record;
begin
  for p in
    select tablename, policyname from pg_policies
    where schemaname = 'storage' and tablename in ('objects', 'buckets') and cmd <> 'SELECT'
  loop
    execute format('drop policy %I on storage.%I', p.policyname, p.tablename);
  end loop;
end $$;

drop policy if exists images_public_read on storage.objects;
create policy images_public_read on storage.objects for select to anon, authenticated using (bucket_id = 'images');

commit;

-- 確認用: 残っているポリシーの一覧
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;
