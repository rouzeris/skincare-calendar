import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const ALLOWED_ORIGINS = new Set([
  "https://cera.love",
  "https://www.cera.love",
  "http://localhost:4321",
  "http://localhost:4977",
]);

const corsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://cera.love",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};

const http = httpRouter();

http.route({
  path: "/waitlist",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, req) => {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }),
});

http.route({
  path: "/waitlist",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const headers = { ...corsHeaders(req), "Content-Type": "application/json" };
    let email: unknown;
    let locale: unknown;
    try {
      const body = (await req.json()) as Record<string, unknown>;
      email = body.email;
      locale = body.locale;
    } catch {
      return new Response(JSON.stringify({ error: "invalid JSON" }), {
        status: 400,
        headers,
      });
    }
    if (
      typeof email !== "string" ||
      email.length > 320 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return new Response(JSON.stringify({ error: "invalid email" }), {
        status: 400,
        headers,
      });
    }
    const safeLocale =
      typeof locale === "string" && ["pl", "ua", "en"].includes(locale)
        ? locale
        : "pl";
    await ctx.runMutation(internal.waitlist.join, {
      email,
      locale: safeLocale,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers,
    });
  }),
});

export default http;
