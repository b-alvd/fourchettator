"use client";
import { useRouter } from "next/navigation";
import { Dice } from "@/components/Icon";

export default function SurpriseButton({ ids }) {
  const router = useRouter();
  function surprise() {
    if (!ids.length) return;
    const id = ids[Math.floor(Math.random() * ids.length)];
    router.push(`/recettes/${id}`);
  }
  return (
    <button className="btn ghost" onClick={surprise}><Dice size={18} /> Surprends-moi</button>
  );
}
