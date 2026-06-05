import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user: user ? { ...user, isAdmin: isAdmin(user) } : null });
}
