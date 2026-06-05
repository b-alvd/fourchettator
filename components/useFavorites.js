"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function useFavorites() {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setFavorites(d.favorites || []))
      .catch(() => {});
  }, [user]);

  const toggle = useCallback(
    async (recipeId) => {
      if (!user) { router.push("/connexion"); return; }
      const on = !favorites.includes(recipeId);
      setFavorites((f) => (on ? [...f, recipeId] : f.filter((x) => x !== recipeId)));
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId, on }),
        });
        const d = await res.json();
        if (d.favorites) setFavorites(d.favorites);
      } catch {
        setFavorites((f) => (on ? f.filter((x) => x !== recipeId) : [...f, recipeId]));
      }
    },
    [user, favorites, router]
  );

  return { favorites, toggle };
}
