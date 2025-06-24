import { env } from "~/env";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("🔍 Debug endpoint called");

  const debugInfo = {
    nodeEnv: env.NODE_ENV,
    hasAuthSecret: !!env.AUTH_SECRET,
    authSecretLength: env.AUTH_SECRET?.length || 0,
    authSecretPreview: env.AUTH_SECRET
      ? env.AUTH_SECRET.substring(0, 10) + "..."
      : "undefined",
    hasGoogleClientId: !!env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!env.GOOGLE_CLIENT_SECRET,
    hasDatabaseUrl: !!env.DATABASE_URL,
    baseUrl: env.NEXT_PUBLIC_BASE_URL,
    timestamp: new Date().toISOString(),
  };

  console.log("🔍 Debug info:", debugInfo);

  return NextResponse.json(debugInfo);
}
