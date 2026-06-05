import { Suspense } from "react";
import SecureAccountClient from "@/components/SecureAccountClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fourchettator - Sécuriser mon compte" };

export default function Page() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-card" style={{ textAlign: "center" }}><div className="auth-stamp">🛡️</div></div></div>}>
      <SecureAccountClient />
    </Suspense>
  );
}
