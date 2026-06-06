"use client";
import { useState } from "react";
import { Mail, Bowl } from "@/components/Icon";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import PasswordInput from "@/components/PasswordInput";

export default function AuthForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [unverified, setUnverified] = useState("");
  const [info, setInfo] = useState("");

  const isRegister = mode === "register";

  async function submit() {
    setError(""); setInfo(""); setUnverified(""); setBusy(true);
    try {
      const url = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister ? { email, password, name } : { email, password };
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      setBusy(false);
      if (!res.ok) {
        setError(d.error || "Une erreur est survenue.");
        if (d.unverified) setUnverified(d.email || email);
        return;
      }
      if (isRegister) { setSent(true); return; }
      setUser(d.user);
      router.push("/");
    } catch {
      setError("Impossible de joindre le serveur.");
      setBusy(false);
    }
  }

  async function resend(targetEmail) {
    setInfo(""); setError("");
    await fetch("/api/auth/resend-verification", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: targetEmail }),
    }).catch(() => {});
    setInfo("Email de confirmation renvoyé. Vérifie ta boîte mail (et les spams).");
  }

  if (sent) {
    return (
      <div className="auth-wrap">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-stamp"><Mail size={28} /></div>
          <h1 className="auth-title">Vérifie ta boîte mail</h1>
          <p className="auth-sub">On a envoyé un lien de confirmation à <b>{email}</b>. Clique dessus pour activer ton compte.</p>
          {info && <div className="auth-info">{info}</div>}
          <button className="btn auth-submit" onClick={() => resend(email)}>Renvoyer l&apos;email</button>
          <div className="auth-toggle">
            <button onClick={() => { setSent(false); setMode("login"); setInfo(""); }}>Retour à la connexion</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-stamp"><Bowl size={30} /></div>
        <h1 className="auth-title">{isRegister ? "Rejoins la cuisine" : "Content de te revoir"}</h1>
        <p className="auth-sub">{isRegister ? "Crée ton compte pour enregistrer tes recettes favorites." : "Connecte-toi pour retrouver tes favoris."}</p>

        {isRegister && (
          <label className="auth-field">
            <span>Prénom</span>
            <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Zozo" autoComplete="name" />
          </label>
        )}
        <label className="auth-field">
          <span>Email</span>
          <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.fr" autoComplete="email" />
        </label>
        <label className="auth-field">
          <span>Mot de passe</span>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••••••" autoComplete={isRegister ? "new-password" : "current-password"} />
        </label>

        {error && <div className="auth-error">{error}</div>}
        {info && <div className="auth-info">{info}</div>}
        {unverified && (
          <button className="link-btn" onClick={() => resend(unverified)} style={{ marginBottom: 10 }}>
            Renvoyer l&apos;email de confirmation
          </button>
        )}

        <button className="btn auth-submit" onClick={submit} disabled={busy}>
          {busy ? "…" : isRegister ? "Créer mon compte" : "Se connecter"}
        </button>

        <div className="auth-toggle">
          {isRegister ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <button onClick={() => { setMode(isRegister ? "login" : "register"); setError(""); setInfo(""); setUnverified(""); }}>
            {isRegister ? "Se connecter" : "En créer un"}
          </button>
        </div>
      </div>
    </div>
  );
}
