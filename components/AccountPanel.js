"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import PasswordInput from "@/components/PasswordInput";

export default function AccountPanel({ user, favorites }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [favs, setFavs] = useState(favorites);

  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const [delMsg, setDelMsg] = useState("");
  const [delBusy, setDelBusy] = useState(false);

  async function removeFav(id) {
    setFavs((f) => f.filter((r) => r.id !== id));
    fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipeId: id, on: false }) }).catch(() => {});
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  async function changePassword() {
    setPwMsg("");
    if (next.length < 6) { setPwMsg("Nouveau mot de passe trop court (6 min)."); return; }
    if (next !== confirmPw) { setPwMsg("La confirmation ne correspond pas."); return; }
    setPwBusy(true);
    const res = await fetch("/api/account/password", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: cur, next }),
    });
    const d = await res.json().catch(() => ({}));
    setPwBusy(false);
    if (!res.ok) { setPwMsg(d.error || "Erreur."); return; }
    setCur(""); setNext(""); setConfirmPw(""); setPwMsg("Mot de passe modifié ✓");
  }

  async function requestDelete() {
    setDelBusy(true); setDelMsg("");
    const res = await fetch("/api/account", { method: "POST" });
    setDelBusy(false);
    if (res.ok) setDelMsg("Un email de confirmation t'a été envoyé. Clique le lien pour supprimer ton compte (valable 1h).");
    else setDelMsg("Erreur, réessaie.");
  }

  return (
    <div className="account">
      <div className="account-head">
        <span className="account-avatar">{(user.name || user.email)[0].toUpperCase()}</span>
        <div className="account-id">
          <h1>{user.name || user.email.split("@")[0]}</h1>
          <div className="email">{user.email}</div>
        </div>
        <button className="btn-mini" onClick={logout}>Déconnexion</button>
      </div>

      <div className="sec-head" style={{ marginTop: 44 }}>
        <h2>Mes favoris</h2>
        <span className="count" style={{ marginLeft: "auto", paddingBottom: 12 }}>{favs.length} recette{favs.length > 1 ? "s" : ""}</span>
      </div>

      {favs.length ? (
        <div className="grid">
          {favs.map((r) => (
            <div className="card" key={r.id} style={{ position: "relative" }}>
              <Link href={`/recettes/${r.id}`} style={{ display: "block" }}>
                <div className="ph" style={r.image ? undefined : { background: r.grad }}>
                  {r.image && <img src={r.image} alt={r.name} className="ph-img" />}
                  <span className="cat">{r.cat}</span>
                </div>
              </Link>
              <button className="fav remove" title="Retirer des favoris" onClick={() => removeFav(r.id)}>✕</button>
              <Link href={`/recettes/${r.id}`}>
                <div className="body">
                  <h3>{r.name}</h3>
                  <div className="meta">
                    <span>⏱ {r.time} min</span><span>⚑ {r.diff}</span><span className="stars">★ {r.rating}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="fav-empty">
          <div style={{ fontSize: 44, marginBottom: 10 }}>🍽️</div>
          <p>Pas encore de favori. <Link href="/recettes">Va t&apos;en trouver un&nbsp;!</Link></p>
        </div>
      )}

      <div className="sec-head" style={{ marginTop: 44 }}><h2>Mot de passe</h2></div>
      <div className="pw-form">
        <label className="auth-field"><span>Mot de passe actuel</span>
          <PasswordInput value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
        </label>
        <label className="auth-field"><span>Nouveau mot de passe</span>
          <PasswordInput value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
        </label>
        <label className="auth-field"><span>Confirme le nouveau</span>
          <PasswordInput value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" />
        </label>
        {pwMsg && <div style={{ fontWeight: 700, color: pwMsg.includes("✓") ? "var(--olive)" : "var(--tomato-d)" }}>{pwMsg}</div>}
        <button className="btn" onClick={changePassword} disabled={pwBusy}>{pwBusy ? "…" : "Changer le mot de passe"}</button>
      </div>

      <div className="danger">
        <h3>Zone sensible</h3>
        <p>Supprimer ton compte efface définitivement ton profil et tes favoris. Pour confirmer, on t&apos;envoie un email avec un lien.</p>
        {delMsg ? (
          <div className="auth-info">{delMsg}</div>
        ) : (
          <button className="btn-cancel" onClick={requestDelete} disabled={delBusy}>
            {delBusy ? "Envoi…" : "Supprimer mon compte"}
          </button>
        )}
      </div>
    </div>
  );
}
