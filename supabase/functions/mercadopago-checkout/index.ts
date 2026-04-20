import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PACKAGES: Record<string, { credits: number; price: number }> = {
  Starter: { credits: 10, price: 9700 },
  Equipe: { credits: 50, price: 39700 },
  "Organização": { credits: 150, price: 99000 },
};

// Rate limit em memória (por instância da Edge Function):
// máx. 5 chamadas por escola em janela deslizante de 10 minutos.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const checkoutAttempts = new Map<string, number[]>();

function checkRateLimit(schoolId: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const recent = (checkoutAttempts.get(schoolId) ?? []).filter((t) => t > cutoff);

  if (recent.length >= RATE_LIMIT_MAX) {
    checkoutAttempts.set(schoolId, recent);
    const oldest = recent[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  checkoutAttempts.set(schoolId, recent);

  // GC ocasional para não vazar memória de schools inativas
  if (checkoutAttempts.size > 1000) {
    for (const [k, v] of checkoutAttempts) {
      const fresh = v.filter((t) => t > cutoff);
      if (fresh.length === 0) checkoutAttempts.delete(k);
      else checkoutAttempts.set(k, fresh);
    }
  }

  return { allowed: true, retryAfterSec: 0 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const MP_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MP_TOKEN) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit por escola (school_id = user.id)
    const rl = checkRateLimit(user.id);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({
          error: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
          retry_after_sec: rl.retryAfterSec,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rl.retryAfterSec),
          },
        }
      );
    }

    let body: { package_name?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { package_name } = body;
    if (typeof package_name !== "string" || !PACKAGES[package_name]) {
      return new Response(
        JSON.stringify({ error: `Invalid package. Accepted: ${Object.keys(PACKAGES).join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const pkg = PACKAGES[package_name];

    // Validate school exists for this user
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("name")
      .eq("id", user.id)
      .single();

    if (schoolError || !school) {
      return new Response(
        JSON.stringify({ error: "No school found for this user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const preference = {
      items: [
        {
          title: `FightPort – Pacote ${package_name} (${pkg.credits} créditos)`,
          quantity: 1,
          unit_price: pkg.price / 100,
          currency_id: "BRL",
        },
      ],
      payer: { email: user.email },
      external_reference: JSON.stringify({
        school_id: user.id,
        package_name,
        credits: pkg.credits,
        price_brl: pkg.price / 100,
      }),
      back_urls: {
        success: `${req.headers.get("origin") || "https://fightport.pro"}/painel/creditos`,
        failure: `${req.headers.get("origin") || "https://fightport.pro"}/painel/creditos`,
        pending: `${req.headers.get("origin") || "https://fightport.pro"}/painel/creditos`,
      },
      auto_return: "approved",
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
    };

    let mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    // Retry uma vez se 503 (MP indisponível)
    if (mpResponse.status === 503) {
      console.log("MercadoPago returned 503, retrying in 2s...");
      await new Promise((r) => setTimeout(r, 2000));
      mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preference),
      });
    }

    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      console.error("MercadoPago error:", mpData);
      throw new Error(`MercadoPago API error [${mpResponse.status}]: ${JSON.stringify(mpData)}`);
    }

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        preference_id: mpData.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
