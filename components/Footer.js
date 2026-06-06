import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <div className="foot">
        <Link href="/" className="foot-brand">
          <Image src="/logo.png" alt="Fourchettator" width={40} height={40} />
          <span>Fourchettator</span>
        </Link>
        <span className="foot-tag">
          Fait avec amour &amp; un peu de beurre par <span className="foot-credit">b_alvd</span>
        </span>
        <nav className="foot-links">
          <Link href="/">Accueil</Link>
          <Link href="/recettes">Recettes</Link>
          <Link href="/compte">Mon compte</Link>
        </nav>
      </div>
    </footer>
  );
}
