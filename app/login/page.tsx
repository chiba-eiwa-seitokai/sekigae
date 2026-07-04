import { redirect } from "next/navigation";
import { createSession, verifyAccessCode } from "@/lib/session/app-auth";

async function login(formData: FormData) {
  "use server";
  const code = String(formData.get("accessCode") ?? "");
  if (!verifyAccessCode(code)) {
    redirect("/login?error=1");
  }
  await createSession();
  redirect("/teacher/connect");
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold">先生用ログイン</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          共有された合言葉を入力してください。
        </p>
        <LoginError searchParams={searchParams} />
        <form action={login} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            name="accessCode"
            required
            placeholder="合言葉"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}

async function LoginError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
      合言葉が正しくありません。
    </p>
  );
}
