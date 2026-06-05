import Browse from "@/components/Browse";

export default function RecettesPage({ searchParams }) {
  const initialCat = searchParams?.cat || "Tous";
  return <Browse initialCat={initialCat} />;
}
