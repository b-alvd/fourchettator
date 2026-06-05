import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFavorites } from "@/lib/favorites";
import { getRecipes } from "@/lib/recipes";
import AccountPanel from "@/components/AccountPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fourchettator - Mon compte" };

export default async function ComptePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const [favIds, all] = await Promise.all([getFavorites(user.id), getRecipes()]);
  const favorites = all.filter((r) => favIds.includes(r.id));

  return <AccountPanel user={user} favorites={favorites} />;
}
