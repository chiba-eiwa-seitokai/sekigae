# 千葉英和高校 席替えシステム

生徒の希望(前後左右の座席位置、離したい人、隣にしたい人)を考慮して座席を自動生成するアプリ。教室レイアウトの固定、クラス/学年ごとのデータ管理、先生による座席固定・除外設定に対応しています。

データはアプリのサーバーには保存せず、Googleスプレッドシートに直接読み書きします。読み書きは学校のGoogle Workspace管理者の承認を必要としないよう、Googleサービスアカウント経由で行います。先生はアプリ共通の合言葉でログインし、自分のスプレッドシートをサービスアカウントに共有することで接続します。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
```

`.env.local` に以下を設定してください。

- `AUTH_SECRET`: ログインセッションの署名に使うランダムな値(`openssl rand -base64 32` などで生成)
- `TEACHER_ACCESS_CODE`: 先生用ログインの合言葉
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: Google Cloud ConsoleでSheets APIとDrive APIを有効化したサービスアカウントの認証情報

サービスアカウントの作成手順:
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成(または既存のものを使用)
2. 「APIとサービス」→「有効なAPIとサービス」で Google Sheets API / Google Drive API を有効化
3. 「認証情報」→「認証情報を作成」→「サービスアカウント」で作成
4. 作成したサービスアカウントの「キー」タブから JSON形式の鍵を作成・ダウンロード
5. JSON内の `client_email` を `GOOGLE_SERVICE_ACCOUNT_EMAIL` に、`private_key` を `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` に設定(改行を含む値なので、そのままダブルクォートで囲んで貼り付けるか、Vercelの環境変数UIにそのまま貼り付けてください)

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
- `lib/sheets/` — Google スプレッドシートのスキーマ定義とCRUDヘルパー(サービスアカウント経由)
- `lib/session/app-auth.ts` — 先生用ログイン(合言葉+署名付きセッションCookie)
- `app/teacher/` — 先生用画面(教室・クラス・名簿・割当・結果)
- `proxy.ts` — `/teacher/**` を未ログイン時に `/login` へリダイレクトするガード

## デプロイ

Vercelへのデプロイを想定しています。`AUTH_SECRET` / `TEACHER_ACCESS_CODE` / `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` をVercelプロジェクトの環境変数に設定してください。Google OAuthを使わないため、リダイレクトURIの登録やWorkspace管理者による承認は不要です。
