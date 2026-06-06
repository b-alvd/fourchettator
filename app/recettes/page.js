import { Suspense } from "react";
import Browse from "@/components/Browse";
import { getRecipes } from "@/lib/recipes";

export const revalidate = 60;
export const metadata = { title: "Recettes — Fourchettator" };

export default async function RecettesPage() {
  const recipes = await getRecipes({ sort: "pop" });
  return (
    <Suspense fallback={null}>
      <Browse allRecipes={recipes} />
    </Suspense>
  );
}
