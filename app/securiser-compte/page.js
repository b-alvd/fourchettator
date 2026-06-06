import { Suspense } from "react";
import { Shield } from "@/components/Icon";
import SecureAccountClient from "@/components/SecureAccountClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sécuriser mon compte — Fourchettator" };

export default function Page() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-card" style={{ textAlign: "center" }}><div className="auth-stamp"><Shield size={28} /></div></div></div>}>
      <SecureAccountClient />
    </Suspense>
  );
}
