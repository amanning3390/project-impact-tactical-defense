import { NextResponse } from "next/server";
import { verifySignedPayload } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { address, message, signature, expectedDomain, expiresAt } = payload ?? {};

    if (!address || !message || !signature) {
      return NextResponse.json(
        { ok: false, error: "Missing address, message, or signature" },
        { status: 400 }
      );
    }

    const verified = await verifySignedPayload({
      address,
      message,
      signature,
      expectedDomain,
      expiresAt,
    });

    return NextResponse.json({ ok: verified });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to verify payload" },
      { status: 400 }
    );
  }
}

