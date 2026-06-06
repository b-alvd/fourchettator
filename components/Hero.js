"use client";
import Link from "next/link";
import { Utensils, Clock, Heart, Bowl, Tomato, Garlic, Bread, Cheese, Herb } from "@/components/Icon";
import { useState, useEffect } from "react";
import SurpriseButton from "@/components/SurpriseButton";

const WORDS = ["cuisine", "mijote", "prépare", "improvise", "dévore"];

export default function Hero({ ids }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-bg" aria-hidden="true">
        <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
      </div>

      <div className="hero-copy">
        <div className="eyebrow hero-in" style={{ animationDelay: ".05s" }}>Bienvenue en cuisine</div>
        <h1 className="hero-in" style={{ animationDelay: ".15s" }}>
          Qu'est-ce qu'on<br />
          <span className="rotator"><span key={i} className="rotator-word">{WORDS[i]}</span></span> aujourd'hui&nbsp;?
        </h1>
        <p className="hero-in" style={{ animationDelay: ".25s" }}>
          Des recettes testées, des portions qui s'ajustent toutes seules, et des étapes claires. On passe à table&nbsp;?
        </p>
        <div className="hero-cta hero-in" style={{ animationDelay: ".35s" }}>
          <Link href="/recettes" className="btn">Explorer les recettes →</Link>
          <SurpriseButton ids={ids} />
        </div>
        <div className="props hero-in" style={{ animationDelay: ".45s" }}>
          <span className="prop"><Utensils /> Portions ajustables</span>
          <span className="prop"><Clock /> Temps réalistes</span>
          <span className="prop"><Heart filled /> Favoris sauvegardés</span>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="bowl">
          <span className="steam s1" /><span className="steam s2" /><span className="steam s3" />
          <Bowl />
        </div>
        <span className="orbit o1" style={{ color: "var(--tomato)" }}><Tomato /></span>
        <span className="orbit o2" style={{ color: "var(--muted)" }}><Garlic /></span>
        <span className="orbit o3" style={{ color: "var(--gold)" }}><Bread /></span>
        <span className="orbit o4" style={{ color: "var(--saffron)" }}><Cheese /></span>
        <span className="orbit o5" style={{ color: "var(--olive)" }}><Herb /></span>
      </div>
    </section>
  );
}
