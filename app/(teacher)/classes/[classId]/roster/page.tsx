import { redirect } from "next/navigation";
import { requireSheetsClient } from "@/lib/sheets/session-client";
import { listStudents, upsertStudent, bulkImportStudents } from "@/lib/sheets/students";
import { listClassrooms } from "@/lib/sheets/classrooms";
import { getClassClassroomId } from "@/lib/sheets/config";
import { getConnectedSpreadsheetId, setActiveClassName } from "@/lib/session/connection";
import { StudentPreferenceForm } from "@/components/StudentPreferenceForm";
import { FixedSeatPicker } from "@/components/FixedSeatPicker";
import type { Student } from "@/lib/sekigae/types";

function parseCsv(text: string): Student[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const [, ...rows] = lines; // first line is a header, skipped
  return rows.map((line) => {
    const [studentId, name, furigana, direction, distantStudentIds, pairStudentId] =
      line.split(",").map((cell) => cell.trim());
    return {
      studentId,
      name: name || undefined,
      furigana: furigana || undefined,
      prefs: {
        direction: (["front", "rear", "left", "right"].includes(direction)
          ? direction
          : "none") as Student["prefs"]["direction"],
        distantStudentIds: distantStudentIds ? distantStudentIds.split(";").filter(Boolean) : [],
        pairStudentId: pairStudentId || undefined,
      },
    };
  });
}

export default async function RosterPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId: className } = await params;
  const spreadsheetId = await getConnectedSpreadsheetId();
  if (!spreadsheetId) redirect("/teacher/connect");
  await setActiveClassName(className);

  const sheets = await requireSheetsClient();
  const [students, classroomId, classrooms] = await Promise.all([
    listStudents(sheets, spreadsheetId, className),
    getClassClassroomId(sheets, spreadsheetId, className),
    listClassrooms(sheets, spreadsheetId),
  ]);
  const classroom = classrooms.find((c) => c.id === classroomId);

  async function saveStudent(formData: FormData) {
    "use server";
    const spreadsheetId = await getConnectedSpreadsheetId();
    if (!spreadsheetId) redirect("/teacher/connect");
    const sheets = await requireSheetsClient();

    const direction = String(formData.get("direction") ?? "none") as Student["prefs"]["direction"];
    const distantRaw = String(formData.get("distantStudentIds") ?? "");
    const student: Student = {
      studentId: String(formData.get("studentId")),
      name: String(formData.get("name") ?? "") || undefined,
      furigana: String(formData.get("furigana") ?? "") || undefined,
      excluded: formData.get("excluded") === "on",
      prefs: {
        direction,
        distantStudentIds: distantRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        pairStudentId: String(formData.get("pairStudentId") ?? "") || undefined,
      },
    };

    // Preserve any previously-set fixed seat; this form doesn't edit it.
    const existing = await listStudents(sheets, spreadsheetId, className);
    const prior = existing.find((s) => s.studentId === student.studentId);
    student.fixedSeat = prior?.fixedSeat;

    await upsertStudent(sheets, spreadsheetId, className, student);
  }

  async function deleteStudent(formData: FormData) {
    "use server";
    const spreadsheetId = await getConnectedSpreadsheetId();
    if (!spreadsheetId) redirect("/teacher/connect");
    const sheets = await requireSheetsClient();
    const studentId = String(formData.get("studentId"));
    const existing = await listStudents(sheets, spreadsheetId, className);
    await bulkImportStudents(
      sheets,
      spreadsheetId,
      className,
      existing.filter((s) => s.studentId !== studentId)
    );
  }

  async function addStudent(formData: FormData) {
    "use server";
    const spreadsheetId = await getConnectedSpreadsheetId();
    if (!spreadsheetId) redirect("/teacher/connect");
    const studentId = String(formData.get("newStudentId") ?? "").trim();
    if (!studentId) return;
    const sheets = await requireSheetsClient();
    await upsertStudent(sheets, spreadsheetId, className, {
      studentId,
      prefs: { direction: "none", distantStudentIds: [] },
    });
  }

  async function importCsv(formData: FormData) {
    "use server";
    const spreadsheetId = await getConnectedSpreadsheetId();
    if (!spreadsheetId) redirect("/teacher/connect");
    const text = String(formData.get("csv") ?? "");
    if (!text.trim()) return;
    const sheets = await requireSheetsClient();
    await bulkImportStudents(sheets, spreadsheetId, className, parseCsv(text));
  }

  async function setFixedSeat(studentId: string, row: number, col: number) {
    "use server";
    const spreadsheetId = await getConnectedSpreadsheetId();
    if (!spreadsheetId) redirect("/teacher/connect");
    const sheets = await requireSheetsClient();
    const existing = await listStudents(sheets, spreadsheetId, className);
    const student = existing.find((s) => s.studentId === studentId);
    if (!student) return;
    student.fixedSeat = { row, col };
    await upsertStudent(sheets, spreadsheetId, className, student);
  }

  async function clearFixedSeat(studentId: string) {
    "use server";
    const spreadsheetId = await getConnectedSpreadsheetId();
    if (!spreadsheetId) redirect("/teacher/connect");
    const sheets = await requireSheetsClient();
    const existing = await listStudents(sheets, spreadsheetId, className);
    const student = existing.find((s) => s.studentId === studentId);
    if (!student) return;
    student.fixedSeat = undefined;
    await upsertStudent(sheets, spreadsheetId, className, student);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <h1 className="text-lg font-semibold">{className} 名簿・希望</h1>

      <section className="flex flex-col gap-2">
        {students.map((s) => (
          <StudentPreferenceForm
            key={s.studentId}
            student={s}
            action={saveStudent}
            onDelete={deleteStudent}
          />
        ))}
      </section>

      <form action={addStudent} className="flex gap-2">
        <input
          name="newStudentId"
          required
          placeholder="生徒番号(ID)"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
          生徒を追加
        </button>
      </form>

      <section className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-medium">CSV一括取込</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          1行目はヘッダー。列: studentId,name,furigana,direction(front/rear/left/right/none),distantStudentIds(;区切り),pairStudentId
        </p>
        <form action={importCsv} className="flex flex-col gap-2">
          <textarea
            name="csv"
            rows={6}
            className="rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button type="submit" className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
            取込(既存データを置き換え)
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-medium">座席固定</h2>
        {classroom ? (
          <FixedSeatPicker
            classroom={classroom}
            students={students}
            onSetFixedSeat={setFixedSeat}
            onClearFixedSeat={clearFixedSeat}
          />
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            このクラスにはまだ教室が設定されていません。座席割当ページで教室を選択してください。
          </p>
        )}
      </section>
    </div>
  );
}
