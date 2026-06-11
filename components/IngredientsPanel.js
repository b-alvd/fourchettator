"use client";
import { useState, Fragment } from "react";

function fmt(n) {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r)
    ? String(r)
    : r.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
}

export default function IngredientsPanel({ ingredients, baseServings }) {
  const [serv, setServ] = useState(baseServings);
  const [checked, setChecked] = useState(() => new Set());
  const factor = serv / baseServings;

  const toggle = (i) => setChecked((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const hasSections = ingredients.some((i) => i[4] !== null && i[4] !== undefined);
  const groups = [];
  ingredients.forEach((it, idx) => {
    const g = it[4];
    const key = g === null || g === undefined ? "_" : `g${g}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push({ it, idx });
    else groups.push({ key, title: it[3] || "", items: [{ it, idx }] });
  });

  const renderItem = ({ it, idx }) => {
    const qty = it[1] ? fmt(it[1] * factor) : "";
    const measure = [qty, it[2] || ""].filter(Boolean).join(" ");
    return (
      <li key={idx} className={checked.has(idx) ? "checked" : ""} onClick={() => toggle(idx)}>
        <span className="cbox">{checked.has(idx) ? "✓" : ""}</span>
        <span className="iname">{it[0]}</span>
        {measure && <span className="qty">{measure}</span>}
      </li>
    );
  };

  return (
    <div className="panel">
      <h2>Ingrédients</h2>
      <div className="serv">
        <span className="lbl">Portions</span>
        <div className="stepper">
          <button onClick={() => setServ((s) => Math.max(1, s - 1))} aria-label="moins">−</button>
          <span className="n">{serv}</span>
          <button onClick={() => setServ((s) => Math.min(20, s + 1))} aria-label="plus">+</button>
        </div>
      </div>
      <ul className="ing">
        {groups.map((g, gi) => (
          <Fragment key={gi}>
            {hasSections && g.title && <li className="ing-head">{g.title}</li>}
            {g.items.map(renderItem)}
          </Fragment>
        ))}
      </ul>
    </div>
  );
}
