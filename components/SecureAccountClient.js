"use client";
import { useState } from "react";
import { Lock, Shield } from "@/components/Icon";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import PasswordInput from "@/components/PasswordInput";

export default function SecureAccountClient() {
  const params = useSearchParams();
  const { setUser } = useAuth();
  const token = params.get("token");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [state, setState] = useState("idle"); // idle | busy | done | error
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");
    if (pw.length < 6) { setMsg("Mot de passe trop court (6 min)."); return; }
    if (pw !== pw2) { setMsg("La confirmation ne correspond pas."); return; }
    if (!token) { setState("error"); return; }
    setState("busy");
    try {
      const res = await fetch("/api/account/recover", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, next: pw }),
      });
      const d = await res.json();
      if (res.ok) { setUser(d.user); try { localStorage.setItem("fc-auth-change", String(Date.now())); } catch {} setState("done"); }
      else { setMsg(d.error || "Erreur."); setState("idle"); }
    } catch { setMsg("Impossible de joindre le serveur."); setState("idle"); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-stamp">{state === "done" ? <Lock size={28} /> : <Shield size={28} />}</div>
        {state === "done" ? (
          <>
            <h1 className="auth-title">Compte sécurisé</h1>
            <p className="auth-sub">Nouveau mot de passe enregistré. Tous les autres appareils ont été déconnectés.</p>
            <Link href="/" className="btn auth-submit" style={{ display: "inline-block", textDecoration: "none" }}>Aller à l&apos;accueil</Link>
          </>
        ) : (
          <>
            <h1 className="auth-title">Sécuriser ton compte</h1>
            <p className="auth-sub">Choisis un nouveau mot de passe. Cela déconnectera tous les appareils, y compris celui qui a fait la modification.</p>
            <label className="auth-field" style={{ textAlign: "left" }}><span>Nouveau mot de passe</span>
              <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
            </label>
            <label className="auth-field" style={{ textAlign: "left" }}><span>Confirme</span>
              <PasswordInput value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} autoComplete="new-password" />
            </label>
            {msg && <div className="auth-error">{msg}</div>}
            <button className="btn auth-submit" onClick={submit} disabled={state === "busy"}>{state === "busy" ? "…" : "Définir le nouveau mot de passe"}</button>
          </>
        )}
      </div>
    </div>
  );
}
