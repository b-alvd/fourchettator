"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "@/components/Icon";
import { CATS } from "@/lib/data";
import RecipeCard from "@/components/RecipeCard";
import { useFavorites } from "@/components/useFavorites";

const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function Browse({ allRecipes = [] }) {
  const params = useSearchParams();
  const [cat, setCat] = useState(params.get("cat") || "Tous");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("pop");
  const { favorites, toggle } = useFavorites();

  const recipes = useMemo(() => {
    let list = allRecipes;
    if (cat !== "Tous") list = list.filter((r) => r.cat === cat);
    const q = norm(search.trim());
    if (q) list = list.filter((r) => norm(r.name).includes(q));
    const arr = [...list];
    if (sort === "az") arr.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    else if (sort === "time") arr.sort((a, b) => (a.time || 0) - (b.time || 0));
    else arr.sort((a, b) => (b.votes || 0) - (a.votes || 0) || (b.rating || 0) - (a.rating || 0));
    return arr;
  }, [allRecipes, cat, search, sort]);

  return (
    <>
      <div className="browse-top"><h2>Explorer les recettes</h2></div>
      <div className="search-big">
        <span className="ic"><Search size={18} /></span>
        <input type="text" placeholder="Poulet, tarte, végétarien…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="toolbar">
        <div className="chips" style={{ margin: 0 }}>
          {CATS.map((c) => (
            <button key={c} className={`chip ${c === cat ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="pop">Trier : Popularité</option>
          <option value="time">Trier : Temps de préparation</option>
          <option value="az">Trier : A → Z</option>
        </select>
        <span className="count">{recipes.length} recette{recipes.length > 1 ? "s" : ""}</span>
      </div>

      {recipes.length ? (
        <div className="grid">
          {recipes.map((r) => (
            <RecipeCard key={r.id} r={r} isFav={favorites.includes(r.id)} onToggleFav={toggle} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="big"><Search size={46} /></div>
          <strong>Aucune recette trouvée</strong>
          <p>Essaie un autre mot-clé ou une autre catégorie.</p>
        </div>
      )}
    </>
  );
}
