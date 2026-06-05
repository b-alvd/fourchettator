"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BARE = ["/verifier-email", "/supprimer-compte", "/securiser-compte", "/desabonnement"];
const isBare = (p) => BARE.some((b) => p === b || p.startsWith(b + "/"));

export function SiteHeader() {
  const p = usePathname();
  return isBare(p) ? null : <Header />;
}

export function SiteFooter() {
  const p = usePathname();
  return isBare(p) ? null : <Footer />;
}
