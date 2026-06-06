"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function RatingStars({ recipeId, avg, votes }) {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(avg || 0);
  const [count, setCount] = useState(votes || 0);
  const [myVote, setMyVote] = useState(0);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetch(`/api/recipes/${recipeId}/rating`).then((r) => r.json()).then((d) => {
      if (alive && d && typeof d.mine !== "undefined") setMyVote(d.mine || 0);
    }).catch(() => {});
    return () => { alive = false; };
  }, [user, recipeId]);
  const [hover, setHover] = useState(0);

  async function rate(v) {
    if (!user) { router.push("/connexion"); return; }
    setMyVote(v);
    const res = await fetch(`/api/recipes/${recipeId}/rating`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: v }),
    });
    const d = await res.json();
    if (res.ok) { setRating(d.rating); setCount(d.votes); }
  }

  const fillTo = hover || myVote || Math.round(rating);
  return (
    <div className="rating">
      <div className="rating-stars" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`star ${n <= fillTo ? "on" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => rate(n)}
            aria-label={`Noter ${n} sur 5`}
          >★</button>
        ))}
      </div>
      <span className="rating-meta">
        <b>{rating ? rating.toFixed(1) : "—"}</b>{" "}
        {count > 0 ? `· ${count} avis` : "· pas encore noté"}
        {myVote ? ` · ta note : ${myVote}` : ""}
      </span>
    </div>
  );
}
