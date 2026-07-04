import type { Student } from "@/lib/sekigae/types";

const DIRECTIONS: { value: Student["prefs"]["direction"]; label: string }[] = [
  { value: "none", label: "指定なし" },
  { value: "front", label: "前" },
  { value: "rear", label: "後ろ" },
  { value: "left", label: "左" },
  { value: "right", label: "右" },
];

export function StudentPreferenceForm({
  student,
  action,
  onDelete,
}: {
  student: Student;
  action: (formData: FormData) => Promise<void>;
  onDelete?: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="grid grid-cols-12 items-center gap-2 border-b border-zinc-200 py-2 text-sm dark:border-zinc-800">
      <input type="hidden" name="studentId" value={student.studentId} />
      <input
        name="name"
        defaultValue={student.name ?? ""}
        placeholder="氏名"
        className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        name="furigana"
        defaultValue={student.furigana ?? ""}
        placeholder="ふりがな"
        className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <select
        name="direction"
        defaultValue={student.prefs.direction}
        className="col-span-1 rounded-md border border-zinc-300 px-1 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      >
        {DIRECTIONS.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
      <input
        name="distantStudentIds"
        defaultValue={student.prefs.distantStudentIds.join(",")}
        placeholder="離したい人(ID,カンマ区切り)"
        className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        name="pairStudentId"
        defaultValue={student.prefs.pairStudentId ?? ""}
        placeholder="隣にしたい人ID"
        className="col-span-2 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <label className="col-span-1 flex items-center gap-1">
        <input type="checkbox" name="excluded" defaultChecked={student.excluded} />
        除外
      </label>
      <div className="col-span-2 flex justify-end gap-2">
        <button type="submit" className="rounded-md bg-zinc-900 px-3 py-1 text-white dark:bg-white dark:text-zinc-900">
          保存
        </button>
        {onDelete && (
          <button
            formAction={onDelete}
            className="rounded-md border border-red-300 px-3 py-1 text-red-700 dark:border-red-800 dark:text-red-400"
          >
            削除
          </button>
        )}
      </div>
    </form>
  );
}
