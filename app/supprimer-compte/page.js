import { Suspense } from "react";
import { Trash } from "@/components/Icon";
import DeleteAccountClient from "@/components/DeleteAccountClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suppression de compte — Fourchettator" };

export default function Page() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="auth-card" style={{ textAlign: "center" }}><div className="auth-stamp"><Trash size={26} /></div></div></div>}>
      <DeleteAccountClient />
    </Suspense>
  );
}
