"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import AccountPanel from "@/components/AccountPanel";

export default function ComptePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => { document.title = "Fourchettator - Mon compte"; }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const [favRes, recRes] = await Promise.all([fetch("/api/favorites"), fetch("/api/recipes?sort=pop")]);
        const favIds = (await favRes.json()).favorites || [];
        const all = (await recRes.json()).recipes || [];
        if (alive) setFavorites(all.filter((r) => favIds.includes(r.id)));
      } catch { if (alive) setFavorites([]); }
    })();
    return () => { alive = false; };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="account">
        <div className="account-head" style={{ minHeight: 70 }} />
        <p style={{ color: "var(--muted)" }}>Chargement…</p>
      </div>
    );
  }
  return <AccountPanel user={user} favorites={favorites} />;
}
