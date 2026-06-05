import { Suspense } from "react";
import VerifyEmailClient from "@/components/VerifyEmailClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fourchettator - Vérification email" };

export default function Page() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-card" style={{ textAlign: "center" }}><div className="auth-stamp">⏳</div><h1 className="auth-title">Vérification…</h1></div></div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
