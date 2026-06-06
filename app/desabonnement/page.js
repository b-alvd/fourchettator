import { Suspense } from "react";
import { Hourglass } from "@/components/Icon";
import UnsubscribeClient from "@/components/UnsubscribeClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Désabonnement — Fourchettator" };

export default function Page() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-card" style={{ textAlign: "center" }}><div className="auth-stamp"><Hourglass size={26} /></div></div></div>}>
      <UnsubscribeClient />
    </Suspense>
  );
}
