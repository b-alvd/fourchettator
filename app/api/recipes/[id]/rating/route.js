import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rateRecipe, getUserRating, getRecipeRating } from "@/lib/recipes";

export async function GET(_request, { params }) {
  const u = await getCurrentUser();
  const mine = u ? await getUserRating(u.id, params.id) : 0;
  const agg = await getRecipeRating(params.id);
  return NextResponse.json({ mine, ...agg });
}

export async function POST(request, { params }) {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { value } = await request.json();
  const agg = await rateRecipe(u.id, params.id, value);
  return NextResponse.json(agg);
}
