import type { Classroom } from "@/lib/sekigae/types";

export function AssignmentControls({
  classrooms,
  selectedClassroomId,
  onSelectClassroom,
  onRunAssignment,
}: {
  classrooms: Classroom[];
  selectedClassroomId?: string;
  onSelectClassroom: (formData: FormData) => Promise<void>;
  onRunAssignment: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action={onSelectClassroom} className="flex items-center gap-2">
        <select
          name="classroomId"
          defaultValue={selectedClassroomId}
          className="rounded-md border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">教室を選択</option>
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700">
          教室を設定
        </button>
      </form>

      {selectedClassroomId && (
        <form action={onRunAssignment}>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
          >
            座席割当を実行
          </button>
        </form>
      )}
    </div>
  );
}
