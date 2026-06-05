"use client";
import Link from "next/link";

export default function RecipeCard({ r, isFav, onToggleFav }) {
  return (
    <div className="card" style={{ position: "relative" }}>
      <Link href={`/recettes/${r.id}`} style={{ display: "block" }}>
        <div className="ph" style={r.image ? undefined : { background: r.grad }}>
          {r.image && <img src={r.image} alt={r.name} className="ph-img" />}
          <span className="cat">{r.cat}</span>
        </div>
      </Link>
      <button
        className="fav"
        title="Favori"
        aria-label="Ajouter aux favoris"
        onClick={(e) => {
          e.preventDefault();
          onToggleFav(r.id);
        }}
        style={{ position: "absolute" }}
      >
        {isFav ? "❤️" : "🤍"}
      </button>
      <Link href={`/recettes/${r.id}`}>
        <div className="body">
          <h3>{r.name}</h3>
          <div className="meta">
            <span>⏱ {r.time} min</span>
            <span>⚑ {r.diff}</span>
            <span className="stars">★ {r.rating}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
