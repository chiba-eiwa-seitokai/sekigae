import Link from "next/link";
import { redirect } from "next/navigation";
import { destroySession } from "@/lib/session/app-auth";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  async function logout() {
    "use server";
    await destroySession();
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/teacher/classes">クラス</Link>
          <Link href="/teacher/classrooms">教室レイアウト</Link>
          <Link href="/teacher/connect">スプレッドシート接続</Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-sm text-zinc-600 underline dark:text-zinc-400">
            ログアウト
          </button>
        </form>
      </header>
      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
