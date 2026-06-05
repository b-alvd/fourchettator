"use client";
import { useRouter } from "next/navigation";

export default function SurpriseButton({ ids }) {
  const router = useRouter();
  function surprise() {
    if (!ids.length) return;
    const id = ids[Math.floor(Math.random() * ids.length)];
    router.push(`/recettes/${id}`);
  }
  return (
    <button className="btn ghost" onClick={surprise}>Surprends-moi</button>
  );
}
