import { Suspense } from "react";
import DeleteAccountClient from "@/components/DeleteAccountClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fourchettator - Suppression de compte" };

export default function Page() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-card" style={{ textAlign: "center" }}><div className="auth-stamp">🗑️</div></div></div>}>
      <DeleteAccountClient />
    </Suspense>
  );
}
