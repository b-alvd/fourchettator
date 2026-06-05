"use client";
import { useState, useEffect } from "react";

export default function AdminBroadcast() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/broadcast").then((r) => r.json()).then((d) => setCount(d.count ?? null)).catch(() => {});
  }, []);

  async function send() {
    if (!subject.trim() || !message.trim()) { setMsg("Objet et message requis."); return; }
    if (!window.confirm(`Envoyer cet email à ${count ?? "?"} abonné(s) ?`)) return;
    setBusy(true); setMsg("");
    const res = await fetch("/api/admin/broadcast", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, message }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(d.error || "Erreur."); return; }
    setMsg(`Envoyé à ${d.sent}/${d.total} abonné(s) ✓`);
    setSubject(""); setMessage("");
  }

  return (
    <>
      <div className="sec-head" style={{ marginTop: 44 }}><h2>Emails promotionnels</h2></div>
      <div className="admin-form">
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>
          Envoyé à <b>{count ?? "…"}</b> abonné(s). Un lien de désabonnement est ajouté automatiquement à chaque email.
        </p>
        <label className="admin-field"><span>Objet</span>
          <input className="auth-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Nouveautés de la semaine" />
        </label>
        <label className="admin-field" style={{ marginTop: 14 }}><span>Message</span>
          <textarea className="auth-input" rows={6} style={{ resize: "vertical", fontFamily: "inherit" }} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Écris ton message… (les sauts de ligne sont conservés)" />
        </label>
        {msg && <div style={{ marginTop: 14, fontWeight: 700, color: msg.includes("✓") ? "var(--olive)" : "var(--tomato-d)" }}>{msg}</div>}
        <button className="btn" style={{ marginTop: 18 }} onClick={send} disabled={busy}>{busy ? "Envoi en cours…" : "Envoyer l'email"}</button>
      </div>
    </>
  );
}
