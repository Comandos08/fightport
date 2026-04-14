import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PACKAGES: Record<string, { credits: number; price: number }> = {
  Starter: { credits: 10, price: 9700 },
  Escola: { credits: 50, price: 39700 },
  Academia: { credits: 150, price: 99000 },
};

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

    const { package_name } = await req.json();
    const pkg = PACKAGES[package_name];
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Invalid package" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get school name
    const { data: school } = await supabase
      .from("schools")
      .select("name")
      .eq("id", user.id)
      .single();

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
        success: `${req.headers.get("origin") || "https://fightport.lovable.app"}/painel/creditos?status=success`,
        failure: `${req.headers.get("origin") || "https://fightport.lovable.app"}/painel/creditos?status=failure`,
        pending: `${req.headers.get("origin") || "https://fightport.lovable.app"}/painel/creditos?status=pending`,
      },
      auto_return: "approved",
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      console.error("MercadoPago error:", mpData);
      throw new Error(`MercadoPago API error [${mpResponse.status}]: ${JSON.stringify(mpData)}`);
    }

    return new Response(
      JSON.stringify({
        init_point: mpData.sandbox_init_point || mpData.init_point,
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
