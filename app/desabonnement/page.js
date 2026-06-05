import { Suspense } from "react";
import UnsubscribeClient from "@/components/UnsubscribeClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fourchettator - Désabonnement" };

export default function Page() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-card" style={{ textAlign: "center" }}><div className="auth-stamp">⏳</div></div></div>}>
      <UnsubscribeClient />
    </Suspense>
  );
}
