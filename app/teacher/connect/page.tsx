import { redirect } from "next/navigation";
import { requireDriveClient, requireSheetsClient } from "@/lib/sheets/session-client";
import { getServiceAccountEmail } from "@/lib/sheets/client";
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
  // Validates access by attempting to read the tab list; throws if inaccessible
  // (e.g. the sheet hasn't been shared with the service account yet).
  await listClassNames(sheets, spreadsheetId);
  await setConnectedSpreadsheetId(spreadsheetId);
  redirect("/teacher/classes");
}

async function createNew(formData: FormData) {
  "use server";
  const gradeName = String(formData.get("gradeName") ?? "").trim();
  const teacherEmail = String(formData.get("teacherEmail") ?? "").trim();
  if (!gradeName || !teacherEmail) throw new Error("学年名とメールアドレスを入力してください");
  const sheets = await requireSheetsClient();
  const drive = await requireDriveClient();
  const spreadsheetId = await createSekigaeSpreadsheet(sheets, drive, gradeName, teacherEmail);
  await setConnectedSpreadsheetId(spreadsheetId);
  redirect("/teacher/classes");
}

export default async function ConnectPage() {
  const currentId = await getConnectedSpreadsheetId();
  const serviceAccountEmail = getServiceAccountEmail();

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
          学年用スプレッドシートを、下のメールアドレスに「編集者」として共有してから、URLまたはIDを貼り付けてください。
        </p>
        <p className="rounded-md bg-zinc-100 px-3 py-2 font-mono text-xs dark:bg-zinc-900">
          {serviceAccountEmail}
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
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          作成後、あなたのメールアドレスに編集者権限で共有されます。
        </p>
        <form action={createNew} className="flex flex-col gap-2">
          <input
            name="gradeName"
            required
            placeholder="例: 1年"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            name="teacherEmail"
            type="email"
            required
            placeholder="あなたのメールアドレス"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button type="submit" className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
            作成
          </button>
        </form>
      </section>
    </div>
  );
}
