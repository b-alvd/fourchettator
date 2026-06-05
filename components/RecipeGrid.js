"use client";
import RecipeCard from "@/components/RecipeCard";
import { useFavorites } from "@/components/useFavorites";

export default function RecipeGrid({ recipes }) {
  const { favorites, toggle } = useFavorites();
  return (
    <div className="grid">
      {recipes.map((r) => (
        <RecipeCard key={r.id} r={r} isFav={favorites.includes(r.id)} onToggleFav={toggle} />
      ))}
    </div>
  );
}
