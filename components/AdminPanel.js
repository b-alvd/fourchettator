"use client";
import { useState } from "react";
import { Close, Edit } from "@/components/Icon";
import AdminBroadcast from "@/components/AdminBroadcast";

const DIFFS = ["Facile", "Moyen", "Difficile"];
const GRADS = [
  ["Tomate / or", "linear-gradient(135deg,#f3c969,#c0532b)"],
  ["Olive", "linear-gradient(135deg,#9bb85a,#5b6b3a)"],
  ["Chocolat", "linear-gradient(135deg,#a8693a,#5c3318)"],
  ["Doré", "linear-gradient(135deg,#e9b75e,#a85a2a)"],
  ["Beurre", "linear-gradient(135deg,#f0d27a,#b06a2c)"],
];

const EMPTY = (cat) => ({ name: "", cat, image: "", time: 30, diff: "Facile", kcal: 400, serv: 4, blurb: "", grad: GRADS[0][1] });

// Redimensionne + compresse l'image côté navigateur, puis renvoie une data URL JPEG.
function fileToDataUrl(file, maxDim = 1000, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        const c = document.createElement("canvas");
        c.width = width; c.height = height;
        c.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminPanel({ recipes: initial, cats }) {
  const [recipes, setRecipes] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [f, setF] = useState(EMPTY(cats[0]));
  const [ing, setIng] = useState([{ name: "", qty: "", unit: "" }]);
  const [useSections, setUseSections] = useState(false);
  const [steps, setSteps] = useState([""]);                          // mode simple
  const [sections, setSections] = useState([{ title: "", steps: [""] }]); // mode sections
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  // --- bascule simple <-> sections en conservant le travail en cours ---
  function toggleSections(on) {
    if (on) {
      setSections([{ title: "", steps: steps.length ? steps : [""] }]);
    } else {
      const flat = sections.flatMap((g) => g.steps);
      setSteps(flat.length ? flat : [""]);
    }
    setUseSections(on);
  }

  // --- handlers sections ---
  const setSectionTitle = (gi, v) => setSections((a) => a.map((g, i) => (i === gi ? { ...g, title: v } : g)));
  const setSectionStep = (gi, si, v) => setSections((a) => a.map((g, i) => (i === gi ? { ...g, steps: g.steps.map((s, j) => (j === si ? v : s)) } : g)));
  const addSectionStep = (gi) => setSections((a) => a.map((g, i) => (i === gi ? { ...g, steps: [...g.steps, ""] } : g)));
  const removeSectionStep = (gi, si) => setSections((a) => a.map((g, i) => (i === gi ? { ...g, steps: g.steps.length > 1 ? g.steps.filter((_, j) => j !== si) : g.steps } : g)));
  const addSection = () => setSections((a) => [...a, { title: "", steps: [""] }]);
  const removeSection = (gi) => setSections((a) => (a.length > 1 ? a.filter((_, i) => i !== gi) : a));

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg("");
    try { set("image", await fileToDataUrl(file)); }
    catch { setMsg("Image illisible, essaie un autre fichier."); }
    e.target.value = "";
  }

  function resetForm() {
    setEditingId(null);
    setF(EMPTY(cats[0]));
    setIng([{ name: "", qty: "", unit: "" }]);
    setSteps([""]); setSections([{ title: "", steps: [""] }]); setUseSections(false);
  }

  function startEdit(r) {
    setEditingId(r.id);
    setF({ name: r.name, cat: r.cat, image: r.image || "", time: r.time, diff: r.diff, kcal: r.kcal, serv: r.serv, blurb: r.blurb || "", grad: r.grad });
    setIng(r.ing && r.ing.length ? r.ing.map((x) => ({ name: x[0], qty: x[1] ? String(x[1]) : "", unit: x[2] || "" })) : [{ name: "", qty: "", unit: "" }]);
    const st = r.steps || [];
    const hasSec = st.some((s) => (s.group !== null && s.group !== undefined) || s.section);
    if (hasSec) {
      const keyOf = (s) => (s.group !== null && s.group !== undefined ? `g${s.group}` : `t:${s.section || ""}`);
      const groups = [];
      for (const s of st) {
        const key = keyOf(s);
        const last = groups[groups.length - 1];
        if (last && last._k === key) last.steps.push(s.content);
        else groups.push({ _k: key, title: s.section || "", steps: [s.content] });
      }
      setSections(groups.length ? groups.map((g) => ({ title: g.title, steps: g.steps })) : [{ title: "", steps: [""] }]);
      setUseSections(true);
    } else {
      setSteps(st.length ? st.map((s) => s.content) : [""]);
      setUseSections(false);
    }
    setMsg("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!f.name.trim()) { setMsg("Donne un nom à la recette."); return; }
    const isEdit = !!editingId;
    setBusy(true); setMsg("");

    const wireSteps = useSections
      ? sections.flatMap((g, gi) =>
          g.steps.map((c) => c.trim()).filter(Boolean).map((c) => ({ content: c, section: g.title.trim(), group: gi })))
      : steps.map((c) => c.trim()).filter(Boolean).map((c) => ({ content: c, section: "", group: null }));
    const wireIng = ing.filter((i) => i.name.trim()).map((i) => [i.name.trim(), Number(i.qty) || 0, i.unit.trim()]);
    const body = { ...f, ing: wireIng, steps: wireSteps };

    const res = await fetch(isEdit ? `/api/admin/recipes/${editingId}` : "/api/admin/recipes", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg(d.error || "Erreur."); return; }

    if (isEdit) {
      setRecipes((rs) => rs.map((x) => (x.id === editingId ? { ...x, ...f, ing: wireIng, steps: wireSteps } : x)).sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      setRecipes((rs) => [...rs, { id: d.id, ...f, ing: wireIng, steps: wireSteps, rating: 0, votes: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
    }
    resetForm();
    setMsg(isEdit ? "Recette modifiée ✓" : "Recette ajoutée ✓");
  }

  async function remove(id) {
    if (!window.confirm("Supprimer cette recette ?")) return;
    if (editingId === id) resetForm();
    setRecipes((r) => r.filter((x) => x.id !== id));
    await fetch(`/api/admin/recipes/${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <div className="account">
      <div className="sec-head" style={{ marginTop: 40 }}><h2>Administration</h2></div>

      <div className="admin-form">
        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 20, marginBottom: 16 }}>
          {editingId ? "Modifier la recette" : "Nouvelle recette"}
        </h3>
        <div className="admin-grid">
          <label className="admin-field"><span>Nom</span><input className="auth-input" value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
          <label className="admin-field"><span>Catégorie</span>
            <select className="select" value={f.cat} onChange={(e) => set("cat", e.target.value)}>{cats.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="admin-field"><span>Dégradé (repli si pas d&apos;image)</span>
            <select className="select" value={f.grad} onChange={(e) => set("grad", e.target.value)}>{GRADS.map(([n, g]) => <option key={g} value={g}>{n}</option>)}</select>
          </label>
          <label className="admin-field"><span>Temps (min)</span><input type="number" className="auth-input" value={f.time} onChange={(e) => set("time", e.target.value)} /></label>
          <label className="admin-field"><span>Difficulté</span>
            <select className="select" value={f.diff} onChange={(e) => set("diff", e.target.value)}>{DIFFS.map((d) => <option key={d}>{d}</option>)}</select>
          </label>
          <label className="admin-field"><span>kcal / pers</span><input type="number" className="auth-input" value={f.kcal} onChange={(e) => set("kcal", e.target.value)} /></label>
          <label className="admin-field"><span>Portions de base</span><input type="number" className="auth-input" value={f.serv} onChange={(e) => set("serv", e.target.value)} /></label>
        </div>
        <label className="admin-field" style={{ marginTop: 14 }}><span>Description</span><input className="auth-input" value={f.blurb} onChange={(e) => set("blurb", e.target.value)} /></label>

        <div className="admin-field" style={{ marginTop: 14 }}>
          <span>Image (laisse vide pour garder le dégradé)</span>
          <input type="file" accept="image/*" className="file-input" onChange={onFile} />
        </div>
        {f.image && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <img src={f.image} alt="aperçu" style={{ width: 160, height: 110, objectFit: "cover", borderRadius: 12, border: "2px solid var(--border)" }} />
            <button type="button" className="btn-mini" onClick={() => set("image", "")}>Retirer l&apos;image</button>
          </div>
        )}

        {/* ---- Ingrédients ---- */}
        <div style={{ marginTop: 18 }}>
          <span className="admin-field" style={{ fontWeight: 700, fontSize: 13, color: "var(--ink2)" }}>Ingrédients (qté / unité facultatives)</span>
          {ing.map((it, idx) => (
            <div className="admin-row" key={idx}>
              <input className="auth-input" placeholder="Nom" value={it.name} onChange={(e) => setIng((a) => a.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
              <input className="auth-input" placeholder="Qté" style={{ maxWidth: 90 }} value={it.qty} onChange={(e) => setIng((a) => a.map((x, i) => i === idx ? { ...x, qty: e.target.value } : x))} />
              <input className="auth-input" placeholder="Unité" style={{ maxWidth: 110 }} value={it.unit} onChange={(e) => setIng((a) => a.map((x, i) => i === idx ? { ...x, unit: e.target.value } : x))} />
              <button className="x" onClick={() => setIng((a) => a.length > 1 ? a.filter((_, i) => i !== idx) : a)}><Close size={15} /></button>
            </div>
          ))}
          <button className="mini-add" onClick={() => setIng((a) => [...a, { name: "", qty: "", unit: "" }])}>+ ajouter un ingrédient</button>
        </div>

        {/* ---- Étapes ---- */}
        <div style={{ marginTop: 18 }}>
          <span className="admin-field" style={{ fontWeight: 700, fontSize: 13, color: "var(--ink2)" }}>Étapes</span>
          <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 12px", fontWeight: 700, fontSize: 13, color: "var(--ink2)", cursor: "pointer" }}>
            <input type="checkbox" checked={useSections} onChange={(e) => toggleSections(e.target.checked)} />
            Étapes par sections (menus déroulants)
          </label>

          {!useSections && (
            <>
              {steps.map((s, idx) => (
                <div className="admin-row" key={idx}>
                  <input className="auth-input" placeholder={`Étape ${idx + 1}`} value={s} onChange={(e) => setSteps((a) => a.map((x, i) => i === idx ? e.target.value : x))} />
                  <button className="x" onClick={() => setSteps((a) => a.length > 1 ? a.filter((_, i) => i !== idx) : a)}><Close size={15} /></button>
                </div>
              ))}
              <button className="mini-add" onClick={() => setSteps((a) => [...a, ""])}>+ ajouter une étape</button>
            </>
          )}

          {useSections && (
            <>
              {sections.map((g, gi) => (
                <div className="sec-block" key={gi}>
                  <div className="admin-row">
                    <input className="auth-input" style={{ fontWeight: 700 }} placeholder="Titre de la section (ex. La pâte)" value={g.title} onChange={(e) => setSectionTitle(gi, e.target.value)} />
                    <button className="x" onClick={() => removeSection(gi)} title="Supprimer la section"><Close size={15} /></button>
                  </div>
                  {g.steps.map((s, si) => (
                    <div className="admin-row" key={si} style={{ marginLeft: 16 }}>
                      <input className="auth-input" placeholder={`Étape ${si + 1}`} value={s} onChange={(e) => setSectionStep(gi, si, e.target.value)} />
                      <button className="x" onClick={() => removeSectionStep(gi, si)}><Close size={15} /></button>
                    </div>
                  ))}
                  <button className="mini-add" style={{ marginLeft: 16 }} onClick={() => addSectionStep(gi)}>+ étape</button>
                </div>
              ))}
              <button className="mini-add" onClick={addSection}>+ ajouter une section</button>
            </>
          )}
        </div>

        {msg && <div style={{ marginTop: 14, fontWeight: 700, color: msg.includes("✓") ? "var(--olive)" : "var(--tomato-d)" }}>{msg}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button className="btn" onClick={save} disabled={busy}>{busy ? "Enregistrement…" : editingId ? "Enregistrer les modifications" : "Ajouter la recette"}</button>
          {editingId && <button className="btn-mini" onClick={resetForm}>Annuler</button>}
        </div>
      </div>

      <div className="sec-head"><h2>Recettes ({recipes.length})</h2></div>
      <div className="admin-list">
        {recipes.map((r) => (
          <div className={`arow ${editingId === r.id ? "editing" : ""}`} key={r.id}>
            {r.image
              ? <img className="em-img" src={r.image} alt="" />
              : <span className="em-grad" style={{ background: r.grad }} />}
            <span className="nm">{r.name}</span>
            <span className="meta">{r.cat} · ★ {r.rating || "—"} {r.votes ? `(${r.votes})` : ""}</span>
            <button className="edit" onClick={() => startEdit(r)} title="Modifier"><Edit size={15} /></button>
            <button className="x" onClick={() => remove(r.id)} title="Supprimer"><Close size={15} /></button>
          </div>
        ))}
      </div>
    <AdminBroadcast />
    </div>
  );
}
