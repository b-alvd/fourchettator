"use client";
import { useEffect, useState, useRef } from "react";
import { Check, Alert, Hourglass } from "@/components/Icon";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function UnsubscribeClient() {
  const params = useSearchParams();
  const [state, setState] = useState("loading"); // loading | ok | error
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const u = params.get("u"), t = params.get("t");
    if (!u || !t) { setState("error"); return; }
    (async () => {
      try {
        const res = await fetch("/api/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ u, t }) });
        setState(res.ok ? "ok" : "error");
      } catch { setState("error"); }
    })();
  }, [params]);

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-stamp">{state === "ok" ? <Check size={28} /> : state === "error" ? <Alert size={26} /> : <Hourglass size={26} />}</div>
        {state === "loading" && <h1 className="auth-title">Désabonnement…</h1>}
        {state === "ok" && (<><h1 className="auth-title">Désabonné</h1><p className="auth-sub">Tu ne recevras plus d&apos;emails promotionnels. Tu peux fermer cette page.</p></>)}
        {state === "error" && (<><h1 className="auth-title">Lien invalide</h1><p className="auth-sub">Ce lien de désabonnement n&apos;est pas valide.</p><Link href="/" className="btn auth-submit" style={{ display: "inline-block", textDecoration: "none" }}>Accueil</Link></>)}
      </div>
    </div>
  );
}
