import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session/app-auth";

export default async function Home() {
  redirect((await isAuthenticated()) ? "/teacher/classes" : "/login");
}
