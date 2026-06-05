"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const BARE = ["/verifier-email", "/supprimer-compte", "/securiser-compte", "/desabonnement"];

export default function CookieBanner() {
  const path = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (!localStorage.getItem("fc-cookie-consent")) setShow(true); } catch {}
  }, []);

  function choose(v) {
    try { localStorage.setItem("fc-cookie-consent", v); } catch {}
    setShow(false);
  }

  if (!show || BARE.some((b) => path === b || path.startsWith(b + "/"))) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookies">
      <p>
        On utilise un seul cookie, <b>essentiel</b> à la connexion (pour te garder identifié). Pas de pub, pas de pistage.
      </p>
      <div className="cookie-actions">
        <button className="btn-mini" onClick={() => choose("essential")}>Refuser le superflu</button>
        <button className="btn-mini solid" onClick={() => choose("all")}>OK, j&apos;ai compris</button>
      </div>
    </div>
  );
}
