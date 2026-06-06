import { Suspense } from "react";
import { Hourglass } from "@/components/Icon";
import VerifyEmailClient from "@/components/VerifyEmailClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vérification email — Fourchettator" };

export default function Page() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-card" style={{ textAlign: "center" }}><div className="auth-stamp"><Hourglass size={26} /></div><h1 className="auth-title">Vérification…</h1></div></div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
