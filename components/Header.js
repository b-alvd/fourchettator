"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const TAGS = ["Fait maison", "De saison", "Testé en cuisine", "Sans prise de tête", "Pour tous les jours"];
const LOOP = Array.from({ length: 5 }).flatMap(() => TAGS);

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cls = (isActive) => (mounted && isActive ? "active" : "");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

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
            <Image src="/logo.png" alt="Fourchettator" width={35} height={35} priority />
            <span className="brand-name">Fourchettator</span>
          </Link>
          <nav className="links">
            <Link href="/" className={cls(path === "/")}>Accueil</Link>
            <Link href="/recettes" className={cls(path.startsWith("/recettes"))}>Recettes</Link>
            {user?.isAdmin && <Link href="/admin" className={cls(path === "/admin")}>Admin</Link>}
          </nav>
          <div className="header-right">
            {user ? (
              <div className="usermenu">
                <Link href="/compte" className={`hello ${cls(path === "/compte")}`}>
                  <span className="avatar">{(user.name || user.email)[0].toUpperCase()}</span>
                  {user.name || user.email.split("@")[0]}
                </Link>
                <button className="btn-mini" onClick={logout}>Déconnexion</button>
              </div>
            ) : (
              <Link href="/connexion" className="btn-mini solid">Connexion</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
