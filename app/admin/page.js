import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getRecipes } from "@/lib/recipes";
import { CATS } from "@/lib/data";
import AdminPanel from "@/components/AdminPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fourchettator - Admin" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) redirect("/");
  const recipes = await getRecipes({ sort: "az" });
  return <AdminPanel recipes={recipes} cats={CATS.slice(1)} />;
}
