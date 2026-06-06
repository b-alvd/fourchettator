"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import AdminPanel from "@/components/AdminPanel";
import { CATS } from "@/lib/data";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState(null);

  useEffect(() => { document.title = "Fourchettator - Admin"; }, []);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) router.replace("/");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    fetch("/api/recipes?sort=az").then((r) => r.json()).then((d) => setRecipes(d.recipes || [])).catch(() => setRecipes([]));
  }, [user]);

  if (loading || !user || !user.isAdmin) {
    return (
      <div className="account">
        <div className="sec-head" style={{ marginTop: 30 }}><h2>Administration</h2></div>
        <p style={{ color: "var(--muted)" }}>Chargement…</p>
      </div>
    );
  }
  return <AdminPanel recipes={recipes || []} cats={CATS.slice(1)} />;
}
