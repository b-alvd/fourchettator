"use client";
import { useEffect, useState } from "react";
import { Search } from "@/components/Icon";
import { CATS } from "@/lib/data";
import RecipeCard from "@/components/RecipeCard";
import { useFavorites } from "@/components/useFavorites";

export default function Browse({ initialCat = "Tous" }) {
  const [cat, setCat] = useState(initialCat);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("pop");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favorites, toggle } = useFavorites();

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ q: search, cat, sort });
      setLoading(true);
      fetch(`/api/recipes?${qs}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => { setRecipes(d.recipes || []); setLoading(false); })
        .catch(() => {});
    }, 180); // petit debounce sur la frappe
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [search, cat, sort]);

  return (
    <>
      <div className="browse-top"><h2>Explorer les recettes</h2></div>
      <div className="search-big">
        <span className="ic"><Search size={18} /></span>
        <input
          type="text"
          placeholder="Poulet, tarte, végétarien…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        !loading && (
          <div className="empty">
            <div className="big"><Search size={46} /></div>
            <strong>Aucune recette trouvée</strong>
            <p>Essaie un autre mot-clé ou une autre catégorie.</p>
          </div>
        )
      )}
    </>
  );
}
