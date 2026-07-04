import { redirect } from "next/navigation";
import { requireSheetsClient } from "@/lib/sheets/session-client";
import { listStudents } from "@/lib/sheets/students";
import { listClassrooms } from "@/lib/sheets/classrooms";
import { getClassClassroomId } from "@/lib/sheets/config";
import { readAssignment, swapAssignedSeats } from "@/lib/sheets/assignments";
import { getConnectedSpreadsheetId } from "@/lib/session/connection";
import { ManualSeatEditor } from "@/components/ManualSeatEditor";
import type { SeatPos } from "@/lib/sekigae/types";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId: className } = await params;
  const spreadsheetId = await getConnectedSpreadsheetId();
  if (!spreadsheetId) redirect("/teacher/connect");

  const sheets = await requireSheetsClient();
  const [classrooms, classroomId, students, assignmentRows] = await Promise.all([
    listClassrooms(sheets, spreadsheetId),
    getClassClassroomId(sheets, spreadsheetId, className),
    listStudents(sheets, spreadsheetId, className),
    readAssignment(sheets, spreadsheetId, className),
  ]);
  const classroom = classrooms.find((c) => c.id === classroomId);
  const studentById = new Map(students.map((s) => [s.studentId, s]));

  const labels: Record<string, string> = {};
  for (const row of assignmentRows) {
    const student = studentById.get(row.studentId);
    labels[`${row.row}:${row.col}`] = student?.name || row.studentId;
  }

  const csvLines = [
    "studentId,name,row,col,seatNumber",
    ...assignmentRows.map((r) => {
      const student = studentById.get(r.studentId);
      return `${r.studentId},${student?.name ?? ""},${r.row},${r.col},${r.seatNumber}`;
    }),
  ];
  const csvDataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvLines.join("\n"))}`;

  async function swapSeats(from: SeatPos, to: SeatPos) {
    "use server";
    const spreadsheetId = await getConnectedSpreadsheetId();
    if (!spreadsheetId) redirect("/teacher/connect");
    if (!classroom) return;
    const sheets = await requireSheetsClient();
    await swapAssignedSeats(sheets, spreadsheetId, className, from, to, classroom);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{className} 座席表</h1>
        <a
          href={csvDataUrl}
          download={`${className}_seating.csv`}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
        >
          CSVエクスポート
        </a>
      </div>

      {!classroom && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          教室が設定されていません。座席割当ページで設定してください。
        </p>
      )}
      {classroom && assignmentRows.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          まだ座席割当が実行されていません。
        </p>
      )}
      {classroom && assignmentRows.length > 0 && (
        <ManualSeatEditor classroom={classroom} labels={labels} onSwap={swapSeats} />
      )}
    </div>
  );
}
