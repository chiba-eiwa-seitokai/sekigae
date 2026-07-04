import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSheetsClient } from "@/lib/sheets/session-client";
import { listClassrooms, upsertClassroom } from "@/lib/sheets/classrooms";
import { getConnectedSpreadsheetId } from "@/lib/session/connection";
import { classroomPresets } from "@/lib/sekigae/presets";

async function createFromTemplate(formData: FormData) {
  "use server";
  const presetId = String(formData.get("presetId") ?? "");
  const preset = classroomPresets().find((p) => p.id === presetId);
  if (!preset) throw new Error("テンプレートが見つかりません");

  const spreadsheetId = await getConnectedSpreadsheetId();
  if (!spreadsheetId) redirect("/teacher/connect");

  const sheets = await requireSheetsClient();
  const id = crypto.randomUUID();
  await upsertClassroom(sheets, spreadsheetId, { ...preset, id });
  redirect(`/teacher/classrooms/${encodeURIComponent(id)}/edit`);
}

export default async function ClassroomsPage() {
  const spreadsheetId = await getConnectedSpreadsheetId();
  if (!spreadsheetId) redirect("/teacher/connect");

  const sheets = await requireSheetsClient();
  const classrooms = await listClassrooms(sheets, spreadsheetId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">教室レイアウト</h1>
      </div>

      <section className="flex flex-col gap-2">
        {classrooms.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            まだ教室が登録されていません。テンプレートから作成してください。
          </p>
        )}
        {classrooms.map((c) => (
          <Link
            key={c.id}
            href={`/teacher/classrooms/${encodeURIComponent(c.id)}/edit`}
            className="rounded-md border border-zinc-200 px-4 py-3 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            {c.name} ({c.rows}×{c.cols})
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-medium">テンプレートから新規作成</h2>
        <div className="flex flex-wrap gap-2">
          {classroomPresets().map((preset) => (
            <form action={createFromTemplate} key={preset.id}>
              <input type="hidden" name="presetId" value={preset.id} />
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                {preset.name}
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
