import { notFound, redirect } from "next/navigation";
import { requireSheetsClient } from "@/lib/sheets/session-client";
import { listClassrooms, upsertClassroom } from "@/lib/sheets/classrooms";
import { getConnectedSpreadsheetId } from "@/lib/session/connection";
import { ClassroomEditor } from "@/components/ClassroomEditor";
import type { Classroom } from "@/lib/sekigae/types";

export default async function EditClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spreadsheetId = await getConnectedSpreadsheetId();
  if (!spreadsheetId) redirect("/teacher/connect");

  const sheets = await requireSheetsClient();
  const classrooms = await listClassrooms(sheets, spreadsheetId);
  const classroom = classrooms.find((c) => c.id === id);
  if (!classroom) notFound();

  async function save(updated: Classroom) {
    "use server";
    const spreadsheetId = await getConnectedSpreadsheetId();
    if (!spreadsheetId) redirect("/teacher/connect");
    const sheets = await requireSheetsClient();
    await upsertClassroom(sheets, spreadsheetId, updated);
    redirect("/teacher/classrooms");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-lg font-semibold">教室レイアウト編集</h1>
      <ClassroomEditor initial={classroom} onSave={save} />
    </div>
  );
}
