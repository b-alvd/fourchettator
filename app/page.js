import Link from "next/link";
import { Bowl } from "@/components/Icon";
import { getRecipes } from "@/lib/recipes";
import { CATS } from "@/lib/data";
import RecipeGrid from "@/components/RecipeGrid";
import Hero from "@/components/Hero";

// Lire la DB à chaque requête plutôt que de figer les données au build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const all = await getRecipes({ sort: "pop" });
  const popular = all.slice(0, 6);
  const ids = all.map((r) => r.id);

  return (
    <>
      <Hero ids={ids} />

      <div className="sec-head"><h2>Parcourir par envie</h2></div>
      <div className="chips">
        {CATS.slice(1).map((c) => (
          <Link key={c} href={`/recettes?cat=${encodeURIComponent(c)}`} className="chip">{c}</Link>
        ))}
      </div>

      <div className="sec-head">
        <h2>On commence par les classiques</h2>
        <Link href="/recettes" className="more">Tout voir →</Link>
      </div>
      {popular.length ? (
        <RecipeGrid recipes={popular} />
      ) : (
        <div className="empty">
          <div className="big"><Bowl size={48} /></div>
          <strong>Pas encore de recettes</strong>
          <p>Les recettes ajoutées depuis le panneau d&apos;administration apparaîtront ici.</p>
        </div>
      )}
    </>
  );
}
