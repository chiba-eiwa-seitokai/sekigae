import { redirect } from "next/navigation";
import { requireSheetsClient } from "@/lib/sheets/session-client";
import { listStudents } from "@/lib/sheets/students";
import { listClassrooms } from "@/lib/sheets/classrooms";
import { getClassClassroomId, setClassClassroomId } from "@/lib/sheets/config";
import { writeAssignment } from "@/lib/sheets/assignments";
import { getConnectedSpreadsheetId } from "@/lib/session/connection";
import { AssignmentControls } from "@/components/AssignmentControls";
import { SeatGrid } from "@/components/SeatGrid";
import { assignSeats } from "@/lib/sekigae/assign";
import { doPostSeatAdjustment } from "@/lib/sekigae/adjust";
import { seatKey } from "@/lib/sekigae/grid";

export default async function AssignPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId: className } = await params;
  const spreadsheetId = await getConnectedSpreadsheetId();
  if (!spreadsheetId) redirect("/teacher/connect");

  const sheets = await requireSheetsClient();
  const [classrooms, classroomId, students] = await Promise.all([
    listClassrooms(sheets, spreadsheetId),
    getClassClassroomId(sheets, spreadsheetId, className),
    listStudents(sheets, spreadsheetId, className),
  ]);
  const classroom = classrooms.find((c) => c.id === classroomId);

  async function selectClassroom(formData: FormData) {
    "use server";
    const spreadsheetId = await getConnectedSpreadsheetId();
    if (!spreadsheetId) redirect("/teacher/connect");
    const sheets = await requireSheetsClient();
    const classroomId = String(formData.get("classroomId") ?? "");
    if (!classroomId) return;
    await setClassClassroomId(sheets, spreadsheetId, className, classroomId);
  }

  async function runAssignment() {
    "use server";
    const spreadsheetId = await getConnectedSpreadsheetId();
    if (!spreadsheetId) redirect("/teacher/connect");
    const sheets = await requireSheetsClient();
    const [classrooms, classroomId, students] = await Promise.all([
      listClassrooms(sheets, spreadsheetId),
      getClassClassroomId(sheets, spreadsheetId, className),
      listStudents(sheets, spreadsheetId, className),
    ]);
    const classroom = classrooms.find((c) => c.id === classroomId);
    if (!classroom) return;

    const { assignment } = assignSeats(students, classroom);
    const adjusted = doPostSeatAdjustment(assignment, students);
    await writeAssignment(sheets, spreadsheetId, className, adjusted, classroom);
    redirect(`/teacher/classes/${encodeURIComponent(className)}/result`);
  }

  const labels: Record<string, string> = {};
  for (const s of students) {
    if (s.fixedSeat) labels[seatKey(s.fixedSeat)] = `${s.name ?? s.studentId}(固定)`;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-lg font-semibold">{className} 座席割当</h1>

      <AssignmentControls
        classrooms={classrooms}
        selectedClassroomId={classroom?.id}
        onSelectClassroom={selectClassroom}
        onRunAssignment={runAssignment}
      />

      {classroom && (
        <div>
          <h2 className="mb-2 text-sm font-medium">教室レイアウト(固定席を表示)</h2>
          <SeatGrid classroom={classroom} labels={labels} />
        </div>
      )}
    </div>
  );
}
