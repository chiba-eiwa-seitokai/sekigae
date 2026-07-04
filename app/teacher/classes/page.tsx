import { redirect } from "next/navigation";
import { requireSheetsClient } from "@/lib/sheets/session-client";
import { ensureClassSchema, listClassNames } from "@/lib/sheets/spreadsheet";
import { getConnectedSpreadsheetId, setActiveClassName } from "@/lib/session/connection";

async function createClass(formData: FormData) {
  "use server";
  const className = String(formData.get("className") ?? "").trim();
  if (!className) throw new Error("クラス名を入力してください");
  const spreadsheetId = await getConnectedSpreadsheetId();
  if (!spreadsheetId) redirect("/teacher/connect");
  const sheets = await requireSheetsClient();
  await ensureClassSchema(sheets, spreadsheetId, className);
  await setActiveClassName(className);
  redirect(`/teacher/classes/${encodeURIComponent(className)}/roster`);
}

async function selectClass(formData: FormData) {
  "use server";
  const className = String(formData.get("className") ?? "");
  await setActiveClassName(className);
  redirect(`/teacher/classes/${encodeURIComponent(className)}/roster`);
}

export default async function ClassesPage() {
  const spreadsheetId = await getConnectedSpreadsheetId();
  if (!spreadsheetId) redirect("/teacher/connect");

  const sheets = await requireSheetsClient();
  const classNames = await listClassNames(sheets, spreadsheetId);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <h1 className="text-lg font-semibold">クラス選択</h1>

      <section className="flex flex-col gap-2">
        {classNames.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            まだクラスが登録されていません。下から新規作成してください。
          </p>
        )}
        {classNames.map((className) => (
          <form action={selectClass} key={className}>
            <input type="hidden" name="className" value={className} />
            <button
              type="submit"
              className="w-full rounded-md border border-zinc-200 px-4 py-3 text-left text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              {className}
            </button>
          </form>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-medium">新しいクラスを追加</h2>
        <form action={createClass} className="flex gap-2">
          <input
            name="className"
            required
            placeholder="例: 1A"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
            追加
          </button>
        </form>
      </section>
    </div>
  );
}
