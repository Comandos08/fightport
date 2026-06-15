import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version",
};

type Ref = { school_id: string; package_name: string; credits: number; price_brl: number };

async function searchPaymentByReference(
  mpToken: string,
  reference: string,
): Promise<Record<string, unknown> | null> {
  // Tenta external_reference primeiro
  const tries = [
    `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(reference)}&sort=date_created&criteria=desc&limit=10`,
    `https://api.mercadopago.com/v1/payments/search?q=${encodeURIComponent(reference)}&sort=date_created&criteria=desc&limit=10`,
  ];
  for (const url of tries) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${mpToken}` } });
    if (!res.ok) continue;
    const json = await res.json();
    const results: Array<Record<string, unknown>> = json?.results ?? [];
    // Procura primeiro um approved; senão devolve o mais recente
    const approved = results.find((p) => p.status === "approved");
    if (approved) return approved;
    if (results.length > 0) return results[0];
  }
  return null;
}

async function fetchPaymentById(mpToken: string, paymentId: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${mpToken}` },
  });
  const json = await res.json();
  return { ok: res.ok, payment: json };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const MP_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MP_TOKEN) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdminRes, error: adminError } = await supabase.rpc("is_admin", { _user_id: user.id });
    if (adminError || !isAdminRes) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: { reference?: string; payment_id?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reference = (body.reference ?? "").trim();
    const explicitPaymentId = (body.payment_id ?? "").trim();
    if (!reference && !explicitPaymentId) {
      return new Response(JSON.stringify({ error: "Provide 'payment_id' or 'reference'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve payment object
    let payment: Record<string, unknown> | null = null;
    if (explicitPaymentId) {
      const { ok, payment: p } = await fetchPaymentById(MP_TOKEN, explicitPaymentId);
      if (!ok) {
        return new Response(JSON.stringify({ error: "MP payment fetch failed", detail: p }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      payment = p;
    } else if (/^\d+$/.test(reference)) {
      const { ok, payment: p } = await fetchPaymentById(MP_TOKEN, reference);
      if (ok) payment = p;
    }

    if (!payment) {
      payment = await searchPaymentByReference(MP_TOKEN, reference);
    }

    if (!payment || !payment.id) {
      return new Response(
        JSON.stringify({ error: "Payment not found on MercadoPago for the provided reference" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const paymentId = String(payment.id);
    const status = payment.status as string;

    if (status !== "approved") {
      return new Response(
        JSON.stringify({ error: "Payment is not approved", payment_id: paymentId, status }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Idempotency
    const { data: existing } = await supabase
      .from("credit_transactions")
      .select("id")
      .eq("payment_id", paymentId)
      .limit(1);
    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ status: "duplicate", payment_id: paymentId, message: "Already credited" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Parse external_reference
    let ref: Ref;
    try {
      ref = JSON.parse(payment.external_reference as string);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid external_reference on payment", payment_id: paymentId }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: txError } = await supabase.from("credit_transactions").insert({
      school_id: ref.school_id,
      type: "purchase",
      amount: ref.credits,
      package_name: ref.package_name,
      price_brl: ref.price_brl,
      status: "completed",
      payment_id: paymentId,
    });
    if (txError) {
      if ((txError as { code?: string }).code === "23505") {
        return new Response(
          JSON.stringify({ status: "duplicate", payment_id: paymentId }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw txError;
    }

    const { error: creditError } = await supabase.rpc("add_credits", {
      p_school_id: ref.school_id,
      p_amount: ref.credits,
    });
    if (creditError) throw creditError;

    // Audit log
    try {
      await supabase.rpc("admin_log_action", {
        p_action: "payment.replay",
        p_target_type: "school",
        p_target_id: ref.school_id,
        p_metadata: {
          payment_id: paymentId,
          reference: reference || null,
          credits: ref.credits,
          price_brl: ref.price_brl,
          package_name: ref.package_name,
        },
      });
    } catch (e) {
      console.warn("admin_log_action failed:", e);
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        payment_id: paymentId,
        school_id: ref.school_id,
        credits_added: ref.credits,
        price_brl: ref.price_brl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("mp-replay-payment error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
