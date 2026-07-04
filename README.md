# 千葉英和高校 席替えシステム

生徒の希望(前後左右の座席位置、離したい人、隣にしたい人)を考慮して座席を自動生成するアプリ。教室レイアウトの固定、クラス/学年ごとのデータ管理、先生による座席固定・除外設定に対応しています。

データはアプリのサーバーには保存せず、先生がGoogleアカウントでログインして選択/作成した Google スプレッドシートに直接読み書きします。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
```

`.env.local` に以下を設定してください。

- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`: Google Cloud ConsoleでOAuthクライアントを作成し、リダイレクトURIに `http://localhost:3000/api/auth/callback/google` を登録して発行したもの
- `AUTH_SECRET`: `npx auth secret` などで生成したランダムな値
- `GOOGLE_WORKSPACE_DOMAIN`: 学校のGoogle Workspaceドメイン(未設定の場合、本番ビルドでは全アカウントのログインを拒否します)
- `ALLOWED_TEST_EMAILS`: ドメイン制限をバイパスするテスト用アカウント(ローカル開発時のみ推奨)

```bash
npm run dev
```

## テスト

座席割当アルゴリズムとスプレッドシートのスキーマ変換はGoogleに依存しない純粋関数としてテストできます。

```bash
npm test
```

## 主要ディレクトリ

- `lib/sekigae/` — 座席割当アルゴリズム(型定義・割当・後処理・グリッド操作)
- `lib/sheets/` — Google スプレッドシートのスキーマ定義とCRUDヘルパー
- `lib/auth.ts` — Google OAuth設定(Auth.js)、Workspaceドメイン制限
- `app/(teacher)/` — 先生用画面(教室・クラス・名簿・割当・結果)

## デプロイ

Vercelへのデプロイを想定しています。Google OAuthのリダイレクトURIは完全一致が必要なため、本番用の固定ドメインを用意し、Google Cloud Console側のリダイレクトURIと `AUTH_URL` を本番URLに合わせて設定してください。
