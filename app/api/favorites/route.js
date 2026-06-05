import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavorites, toggleFavorite } from "@/lib/favorites";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ favorites: [], authed: false });
  const favorites = await getFavorites(user.id);
  return NextResponse.json({ favorites, authed: true });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { recipeId, on } = await request.json();
  if (!recipeId) return NextResponse.json({ error: "recipeId requis." }, { status: 400 });
  const favorites = await toggleFavorite(user.id, recipeId, Boolean(on));
  return NextResponse.json({ favorites });
}
