import Browse from "@/components/Browse";
import { getRecipes } from "@/lib/recipes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recettes — Fourchettator" };

export default async function RecettesPage({ searchParams }) {
  const initialCat = searchParams?.cat || "Tous";
  const initialRecipes = await getRecipes({ cat: initialCat, sort: "pop" });
  return <Browse initialCat={initialCat} initialRecipes={initialRecipes} />;
}
