import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isSuperAdmin: (session.user as any).isSuperAdmin ?? false,
  });
}
