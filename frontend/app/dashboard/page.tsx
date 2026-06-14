import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTasks } from "./actions";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; search?: string; sort?: string; order?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/login");
  }

  const params = await searchParams;
  const tasksResponse = await getTasks({
    status: params.status,
    page: params.page ? parseInt(params.page) : 1,
    search: params.search,
    sort: params.sort,
    order: params.order,
  });

  return <DashboardClient initialTasks={tasksResponse} />;
}
