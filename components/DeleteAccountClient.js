"use client";
import { useState } from "react";
import { Check, Trash } from "@/components/Icon";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function DeleteAccountClient() {
  const params = useSearchParams();
  const { setUser } = useAuth();
  const [state, setState] = useState("idle");
  const token = params.get("token");

  async function confirmDelete() {
    if (!token) { setState("error"); return; }
    setState("deleting");
    try {
      const res = await fetch("/api/account/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
      });
      if (res.ok) { setUser(null); try { localStorage.setItem("fc-auth-change", String(Date.now())); } catch {} setState("done"); }
      else setState("error");
    } catch { setState("error"); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-stamp">{state === "done" ? <Check size={28} /> : <Trash size={26} />}</div>
        {state === "done" ? (
          <>
            <h1 className="auth-title">Compte supprimé</h1>
            <p className="auth-sub">Ton compte et tes données ont été effacés. Tu peux maintenant <b>fermer cette page</b>.</p>
          </>
        ) : state === "error" ? (
          <>
            <h1 className="auth-title">Lien invalide</h1>
            <p className="auth-sub">Ce lien de suppression est invalide ou expiré (valable 1h). Refais la demande depuis ton compte.</p>
            <Link href="/compte" className="btn auth-submit" style={{ display: "inline-block", textDecoration: "none" }}>Mon compte</Link>
          </>
        ) : (
          <>
            <h1 className="auth-title">Supprimer ton compte ?</h1>
            <p className="auth-sub">Cette action est définitive : ton profil et tes favoris seront effacés.</p>
            <button className="btn-danger" onClick={confirmDelete} disabled={state === "deleting"} style={{ width: "100%" }}>
              {state === "deleting" ? "Suppression…" : "Oui, supprimer définitivement"}
            </button>
            <div className="auth-toggle"><Link href="/compte">Annuler</Link></div>
          </>
        )}
      </div>
    </div>
  );
}
