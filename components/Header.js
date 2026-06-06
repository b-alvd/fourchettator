"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Menu, Close, Shield } from "@/components/Icon";

const TAGS = ["Fait maison", "De saison", "Testé en cuisine", "Sans prise de tête", "Pour tous les jours"];
const LOOP = Array.from({ length: 5 }).flatMap(() => TAGS);

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cls = (isActive) => (mounted && isActive ? "active" : "");

  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]); // referme le menu à chaque navigation
  const close = () => setOpen(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  const initial = user ? (user.name || user.email)[0].toUpperCase() : "";
  const displayName = user ? (user.name || user.email.split("@")[0]) : "";

  return (
    <header>
      <div className="ticker">
        <div className="ticker-track">
          {[...LOOP, ...LOOP].map((t, i) => (
            <span className="tk" key={i}>{t}<i className="tk-sep">✳</i></span>
          ))}
        </div>
      </div>
      <div className="navbar">
        <div className="bar">
          <Link href="/" className="brand">
            <Image src="/logo.png" alt="Fourchettator" width={46} height={46} priority />
            <span className="brand-name">Fourchettator</span>
          </Link>

          <nav className="links">
            <Link href="/" className={cls(path === "/")}>Accueil</Link>
            <Link href="/recettes" className={cls(path.startsWith("/recettes"))}>Recettes</Link>
          </nav>

          <div className="header-right">
            {user?.isAdmin && (
              <Link href="/admin" className={`admin-link ${cls(path === "/admin")}`} aria-label="Administration">
                <Shield size={15} /> Admin
              </Link>
            )}
            {user ? (
              <div className="usermenu">
                <Link href="/compte" className={`hello ${cls(path === "/compte")}`}>
                  <span className="avatar">{initial}</span>
                  {displayName}
                </Link>
                <button className="btn-mini" onClick={logout}>Déconnexion</button>
              </div>
            ) : (
              <Link href="/connexion" className="btn-mini solid">Connexion</Link>
            )}
          </div>

          <button className="burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            {open ? <Close size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div className={`mobile-menu ${open ? "open" : ""}`}>
          <Link href="/" className={cls(path === "/")} onClick={close}>Accueil</Link>
          <Link href="/recettes" className={cls(path.startsWith("/recettes"))} onClick={close}>Recettes</Link>
          {user?.isAdmin && <Link href="/admin" className={cls(path === "/admin")} onClick={close}>Admin</Link>}
          <div className="mm-sep" />
          {user ? (
            <>
              <Link href="/compte" className={`mm-account ${cls(path === "/compte")}`} onClick={close}>
                <span className="avatar">{initial}</span>{displayName}
              </Link>
              <button className="btn-mini" onClick={() => { close(); logout(); }}>Déconnexion</button>
            </>
          ) : (
            <Link href="/connexion" className="btn-mini solid" onClick={close}>Connexion</Link>
          )}
        </div>
      </div>
    </header>
  );
}
