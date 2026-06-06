"use client";
import { useEffect, useState, useRef } from "react";
import { Check, Alert, Hourglass } from "@/components/Icon";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const { setUser } = useAuth();
  const [state, setState] = useState("loading"); // loading | ok | error
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const token = params.get("token");
    if (!token) { setState("error"); return; }
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
        });
        const d = await res.json();
        if (res.ok) { setUser(d.user); try { localStorage.setItem("fc-auth-change", String(Date.now())); } catch {} setState("ok"); }
        else setState("error");
      } catch { setState("error"); }
    })();
  }, [params, setUser]);

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-stamp">{state === "ok" ? <Check size={28} /> : state === "error" ? <Alert size={26} /> : <Hourglass size={26} />}</div>
        {state === "loading" && <h1 className="auth-title">Vérification…</h1>}
        {state === "ok" && (
          <>
            <h1 className="auth-title">Email confirmé !</h1>
            <p className="auth-sub">Ton compte est activé. Tu peux maintenant <b>fermer cette page</b>.</p>
          </>
        )}
        {state === "error" && (
          <>
            <h1 className="auth-title">Lien invalide</h1>
            <p className="auth-sub">Ce lien de confirmation est invalide ou expiré. Reconnecte-toi pour en recevoir un nouveau.</p>
            <Link href="/connexion" className="btn auth-submit" style={{ display: "inline-block", textDecoration: "none" }}>Aller à la connexion</Link>
          </>
        )}
      </div>
    </div>
  );
}
