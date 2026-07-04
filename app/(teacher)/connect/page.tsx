import { redirect } from "next/navigation";
import { requireSheetsClient } from "@/lib/sheets/session-client";
import { createSekigaeSpreadsheet, listClassNames } from "@/lib/sheets/spreadsheet";
import { getConnectedSpreadsheetId, setConnectedSpreadsheetId } from "@/lib/session/connection";

function extractSpreadsheetId(input: string): string {
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input.trim();
}

async function connectExisting(formData: FormData) {
  "use server";
  const raw = String(formData.get("spreadsheetInput") ?? "");
  const spreadsheetId = extractSpreadsheetId(raw);
  const sheets = await requireSheetsClient();
  // Validates access by attempting to read the tab list; throws if inaccessible.
  await listClassNames(sheets, spreadsheetId);
  await setConnectedSpreadsheetId(spreadsheetId);
  redirect("/teacher/classes");
}

async function createNew(formData: FormData) {
  "use server";
  const gradeName = String(formData.get("gradeName") ?? "").trim();
  if (!gradeName) throw new Error("学年名を入力してください");
  const sheets = await requireSheetsClient();
  const spreadsheetId = await createSekigaeSpreadsheet(sheets, gradeName);
  await setConnectedSpreadsheetId(spreadsheetId);
  redirect("/teacher/classes");
}

export default async function ConnectPage() {
  const currentId = await getConnectedSpreadsheetId();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <h1 className="text-lg font-semibold">スプレッドシート接続</h1>

      {currentId && (
        <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-900">
          現在接続中: <a className="underline" href={`https://docs.google.com/spreadsheets/d/${currentId}`} target="_blank" rel="noreferrer">{currentId}</a>
        </p>
      )}

      <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-medium">既存のスプレッドシートに接続する</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          学年用スプレッドシートのURLまたはIDを貼り付けてください。あなたのGoogleアカウントで閲覧・編集できるシートである必要があります。
        </p>
        <form action={connectExisting} className="flex gap-2">
          <input
            name="spreadsheetInput"
            required
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
            接続
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-medium">新しい学年用スプレッドシートを作成する</h2>
        <form action={createNew} className="flex gap-2">
          <input
            name="gradeName"
            required
            placeholder="例: 1年"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
            作成
          </button>
        </form>
      </section>
    </div>
  );
}
