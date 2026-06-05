"use client";
import { useState } from "react";

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

  const toggle = (i) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
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
        {ingredients.map((i, idx) => {
          const qty = i[1] ? fmt(i[1] * factor) : "";
          const measure = [qty, i[2] || ""].filter(Boolean).join(" ");
          return (
            <li key={idx} className={checked.has(idx) ? "checked" : ""} onClick={() => toggle(idx)}>
              <span className="cbox">{checked.has(idx) ? "✓" : ""}</span>
              <span className="iname">{i[0]}</span>
              {measure && <span className="qty">{measure}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
