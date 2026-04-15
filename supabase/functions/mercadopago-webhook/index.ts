import { createClient } from "npm:@supabase/supabase-js@2";

async function verifyMPSignature(req: Request, body: string): Promise<boolean> {
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  const secret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");

  if (!xSignature || !xRequestId || !secret) return false;

  // Parse ts and v1 from x-signature: "ts=...,v1=..."
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const [key, ...val] = part.split("=");
    parts[key.trim()] = val.join("=").trim();
  }

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  // Parse data.id from the body
  let dataId: string | undefined;
  try {
    const parsed = JSON.parse(body);
    dataId = parsed.data?.id?.toString();
  } catch {
    return false;
  }

  // Build the signed template
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const computed = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === v1;
}

Deno.serve(async (req) => {
  // Webhook doesn't need CORS since it's server-to-server
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  const rawBody = await req.text();

  // Validate MercadoPago webhook signature
  const isValid = await verifyMPSignature(req, rawBody);
  if (!isValid) {
    console.error("Invalid webhook signature — rejecting request");
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
  }

  try {
    const MP_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MP_TOKEN) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const body = JSON.parse(rawBody);
    console.log("Webhook received:", JSON.stringify(body));

    // Only process payment notifications
    if (body.type !== "payment" && body.action !== "payment.created" && body.action !== "payment.updated") {
      return new Response(JSON.stringify({ status: "ignored" }), { status: 200 });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return new Response(JSON.stringify({ status: "no payment id" }), { status: 200 });
    }

    // Fetch payment details from MercadoPago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_TOKEN}` },
    });
    const payment = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("MP payment fetch error:", payment);
      return new Response(JSON.stringify({ error: "Failed to fetch payment" }), { status: 500 });
    }

    console.log("Payment status:", payment.status, "external_reference:", payment.external_reference);

    if (payment.status !== "approved") {
      return new Response(JSON.stringify({ status: "not approved", payment_status: payment.status }), { status: 200 });
    }

    // Parse external reference
    let ref: { school_id: string; package_name: string; credits: number; price_brl: number };
    try {
      ref = JSON.parse(payment.external_reference);
    } catch {
      console.error("Invalid external_reference:", payment.external_reference);
      return new Response(JSON.stringify({ error: "Invalid reference" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check for duplicate (idempotency)
    const { data: existing } = await supabase
      .from("credit_transactions")
      .select("id")
      .eq("school_id", ref.school_id)
      .eq("type", "purchase")
      .eq("package_name", ref.package_name)
      .eq("amount", ref.credits)
      .gte("created_at", new Date(Date.now() - 60000).toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      console.log("Duplicate payment, skipping");
      return new Response(JSON.stringify({ status: "duplicate" }), { status: 200 });
    }

    // Insert transaction
    const { error: txError } = await supabase.from("credit_transactions").insert({
      school_id: ref.school_id,
      type: "purchase",
      amount: ref.credits,
      package_name: ref.package_name,
      price_brl: ref.price_brl,
      status: "completed",
    });

    if (txError) {
      console.error("Transaction insert error:", txError);
      throw txError;
    }

    // Update credit balance
    const { data: currentCredits } = await supabase
      .from("credits")
      .select("balance")
      .eq("school_id", ref.school_id)
      .single();

    const newBalance = (currentCredits?.balance ?? 0) + ref.credits;
    const { error: creditError } = await supabase
      .from("credits")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("school_id", ref.school_id);

    if (creditError) {
      console.error("Credit update error:", creditError);
      throw creditError;
    }

    console.log(`Credits added: ${ref.credits} for school ${ref.school_id}. New balance: ${newBalance}`);

    return new Response(JSON.stringify({ status: "ok", credits_added: ref.credits }), { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
});
