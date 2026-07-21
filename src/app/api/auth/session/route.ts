import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * API Route: Session Check
 * GET /api/auth/session
 * 
 * Fitur: Memeriksa apakah cookie sesi admin masih valid dan aktif.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("coreculture_session");

    if (sessionToken && sessionToken.value === "authenticated_admin") {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
