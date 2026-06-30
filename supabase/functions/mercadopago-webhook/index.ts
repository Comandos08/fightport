import { createClient } from "npm:@supabase/supabase-js@2";

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function verifyMPSignature(
  req: Request,
  body: string,
): Promise<{ valid: boolean; dataId: string | null; reason?: string; source?: string }> {
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  const secret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");

  if (!secret) return { valid: false, dataId: null, reason: "missing_secret" };
  if (!xSignature) return { valid: false, dataId: null, reason: "missing_x_signature" };
  if (!xRequestId) return { valid: false, dataId: null, reason: "missing_x_request_id" };

  // Parse ts and v1 from x-signature: "ts=...,v1=..."
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const [key, ...val] = part.split("=");
    if (key) parts[key.trim()] = val.join("=").trim();
  }

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return { valid: false, dataId: null, reason: "missing_ts_or_v1" };

  // MercadoPago assina usando o data.id do query string da URL (preservando casing/formato).
  // Fallback: corpo JSON. Algumas versões usam apenas "id".
  let dataIdFromUrl: string | null = null;
  try {
    const url = new URL(req.url);
    dataIdFromUrl = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  } catch {
    // ignore
  }

  let dataIdFromBody: string | null = null;
  try {
    const parsed = JSON.parse(body);
    let raw = parsed?.data?.id ?? parsed?.id ?? parsed?.resource;
    if (typeof raw === "string" && raw.startsWith("http")) {
      // IPN antigo: resource é uma URL tipo .../v1/payments/123 — extrai o último segmento numérico.
      const m = raw.match(/\/(\d+)(?:\?|$)/);
      raw = m ? m[1] : raw;
    }
    if (raw !== undefined && raw !== null) dataIdFromBody = String(raw);
  } catch {
    // ignore
  }

  const dataId = dataIdFromUrl ?? dataIdFromBody;
  if (!dataId) return { valid: false, dataId: null, reason: "missing_data_id" };

  const source = dataIdFromUrl ? "url" : "body";

  // Build the signed template per MercadoPago docs.
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const computed = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Se a fonte primária falhar, tente a outra (URL <-> body) — protege contra
  // casing/normalização entre os dois lugares.
  if (timingSafeEqualHex(computed, v1.toLowerCase())) {
    return { valid: true, dataId, source };
  }

  if (dataIdFromUrl && dataIdFromBody && dataIdFromUrl !== dataIdFromBody) {
    const altManifest = `id:${dataIdFromBody};request-id:${xRequestId};ts:${ts};`;
    const altSig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(altManifest));
    const altComputed = Array.from(new Uint8Array(altSig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    if (timingSafeEqualHex(altComputed, v1.toLowerCase())) {
      return { valid: true, dataId: dataIdFromBody, source: "body_fallback" };
    }
  }

  return { valid: false, dataId, reason: "hmac_mismatch", source };
}

async function logWebhookEvent(
  supabase: ReturnType<typeof createClient>,
  args: {
    payment_id: string | null;
    signature_valid: boolean;
    processed: boolean;
    error: string | null;
    headers: Record<string, string>;
    body: unknown;
  },
) {
  try {
    await supabase.from("mp_webhook_events").insert({
      payment_id: args.payment_id,
      signature_valid: args.signature_valid,
      processed: args.processed,
      error: args.error,
      headers: args.headers,
      body: args.body,
    });
  } catch (err) {
    console.warn("[mp_webhook_events] insert failed:", err);
  }
}

async function notifyAdminOfFailure(
  supabase: ReturnType<typeof createClient>,
  reason: string,
  paymentId: string | null,
) {
  try {
    const { data: adminId } = await supabase.rpc("get_admin_recipient_id");
    if (adminId) {
      await supabase.from("notifications").insert({
        recipient_id: adminId,
        type: "webhook_signature_invalid",
        title: "Webhook MercadoPago rejeitado",
        body: `Uma notificação foi recusada (motivo: ${reason}${paymentId ? `, payment_id: ${paymentId}` : ""}). Verifique /dash/financeiro.`,
        link: "/dash/financeiro",
      });
    }
  } catch (err) {
    console.warn("[notifications] failure notify error:", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  const rawBody = await req.text();

  const headersObj: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    // Não loga cookies / authorization por segurança
    if (k.toLowerCase() === "cookie" || k.toLowerCase() === "authorization") return;
    headersObj[k] = v;
  });

  let parsedBody: unknown = null;
  try { parsedBody = JSON.parse(rawBody); } catch { parsedBody = { raw: rawBody }; }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Validate MercadoPago webhook signature
  const sig = await verifyMPSignature(req, rawBody);
  if (!sig.valid) {
    console.error("Invalid webhook signature:", sig.reason, "dataId:", sig.dataId, "source:", sig.source);
    await logWebhookEvent(supabase, {
      payment_id: sig.dataId,
      signature_valid: false,
      processed: false,
      error: `signature_invalid:${sig.reason ?? "unknown"}`,
      headers: headersObj,
      body: parsedBody,
    });
    await notifyAdminOfFailure(supabase, sig.reason ?? "unknown", sig.dataId);
    return new Response(JSON.stringify({ error: "Invalid signature", reason: sig.reason }), { status: 401 });
  }

  try {
    const MP_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!MP_TOKEN) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

    const body = (parsedBody && typeof parsedBody === "object" ? parsedBody : {}) as Record<string, unknown>;
    console.log("Webhook received:", JSON.stringify(body));

    // Aceita formato Webhook v2 (`type`/`data.id`) e IPN antigo (`topic`/`resource`).
    const eventType = (body.type ?? body.topic) as string | undefined;
    const action = body.action;
    let dataId: string | number | undefined =
      (body.data as Record<string, unknown> | undefined)?.id as string | number | undefined;
    if (!dataId && body.resource) {
      const r = body.resource;
      if (typeof r === "string") {
        const m = r.match(/\/(\d+)(?:\?|$)/);
        dataId = m ? m[1] : r;
      }
    }
    if (!dataId) dataId = sig.dataId ?? undefined;

    if (typeof eventType !== "string" || !dataId) {
      await logWebhookEvent(supabase, {
        payment_id: sig.dataId,
        signature_valid: true,
        processed: false,
        error: "missing_fields",
        headers: headersObj,
        body: parsedBody,
      });
      return new Response(JSON.stringify({ status: "ignored", reason: "missing fields" }), { status: 200 });
    }

    // Aceitamos qualquer evento de payment — buscamos sempre o estado autoritativo na API do MP.
    if (eventType !== "payment") {
      await logWebhookEvent(supabase, {
        payment_id: String(dataId),
        signature_valid: true,
        processed: false,
        error: `ignored_event:${eventType}/${action ?? ""}`,
        headers: headersObj,
        body: parsedBody,
      });
      return new Response(JSON.stringify({ status: "ignored", reason: `${eventType}/${action}` }), { status: 200 });
    }

    const paymentId = String(dataId);

    // Fetch payment details from MercadoPago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_TOKEN}` },
    });
    const payment = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("MP payment fetch error:", payment);
      await logWebhookEvent(supabase, {
        payment_id: paymentId,
        signature_valid: true,
        processed: false,
        error: `mp_fetch_failed:${payment?.message ?? mpResponse.status}`,
        headers: headersObj,
        body: parsedBody,
      });
      return new Response(JSON.stringify({ error: "Failed to fetch payment" }), { status: 500 });
    }

    console.log("Payment status:", payment.status, "external_reference:", payment.external_reference);

    if (payment.status !== "approved") {
      await logWebhookEvent(supabase, {
        payment_id: paymentId,
        signature_valid: true,
        processed: false,
        error: `not_approved:${payment.status}`,
        headers: headersObj,
        body: parsedBody,
      });
      return new Response(JSON.stringify({ status: "not approved", payment_status: payment.status }), { status: 200 });
    }

    // Parse external reference
    let ref: { school_id: string; package_name: string; credits: number; price_brl: number };
    try {
      ref = JSON.parse(payment.external_reference);
    } catch {
      console.error("Invalid external_reference:", payment.external_reference);
      await logWebhookEvent(supabase, {
        payment_id: paymentId,
        signature_valid: true,
        processed: false,
        error: "invalid_external_reference",
        headers: headersObj,
        body: parsedBody,
      });
      return new Response(JSON.stringify({ error: "Invalid reference" }), { status: 400 });
    }

    // Idempotency: check by payment_id
    const { data: existing } = await supabase
      .from("credit_transactions")
      .select("id")
      .eq("payment_id", paymentId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log("Duplicate payment, skipping:", paymentId);
      await logWebhookEvent(supabase, {
        payment_id: paymentId,
        signature_valid: true,
        processed: true,
        error: "duplicate",
        headers: headersObj,
        body: parsedBody,
      });
      return new Response(JSON.stringify({ status: "duplicate" }), { status: 200 });
    }

    // Insert transaction with payment_id for idempotency
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
        await logWebhookEvent(supabase, {
          payment_id: paymentId,
          signature_valid: true,
          processed: true,
          error: "duplicate_constraint",
          headers: headersObj,
          body: parsedBody,
        });
        return new Response(JSON.stringify({ status: "duplicate" }), { status: 200 });
      }
      console.error("Transaction insert error:", txError);
      await logWebhookEvent(supabase, {
        payment_id: paymentId,
        signature_valid: true,
        processed: false,
        error: `tx_insert_failed:${(txError as { message?: string }).message ?? "unknown"}`,
        headers: headersObj,
        body: parsedBody,
      });
      throw txError;
    }

    // Atomic credit balance update
    const { error: creditError } = await supabase.rpc("add_credits", {
      p_school_id: ref.school_id,
      p_amount: ref.credits,
    });

    if (creditError) {
      console.error("Credit update error:", creditError);
      await logWebhookEvent(supabase, {
        payment_id: paymentId,
        signature_valid: true,
        processed: false,
        error: `add_credits_failed:${(creditError as { message?: string }).message ?? "unknown"}`,
        headers: headersObj,
        body: parsedBody,
      });
      throw creditError;
    }

    console.log(`Credits added: ${ref.credits} for school ${ref.school_id}`);

    await logWebhookEvent(supabase, {
      payment_id: paymentId,
      signature_valid: true,
      processed: true,
      error: null,
      headers: headersObj,
      body: parsedBody,
    });

    // Notifica o admin (fire-and-forget)
    try {
      const { data: schoolRow } = await supabase
        .from("schools")
        .select("name")
        .eq("id", ref.school_id)
        .maybeSingle();
      const { data: adminId } = await supabase.rpc("get_admin_recipient_id");
      if (adminId) {
        await supabase.from("notifications").insert({
          recipient_id: adminId,
          type: "payment_approved",
          title: "Pagamento aprovado",
          body: `A escola "${schoolRow?.name ?? "desconhecida"}" concluiu uma compra de créditos.`,
          link: "/dash/financeiro",
        });
      }
    } catch (notifErr) {
      console.warn("[notifications] payment_approved failed:", notifErr);
    }

    // E-mail para a escola (fire-and-forget)
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(ref.school_id);
      const schoolEmail = authUser?.user?.email;
      if (schoolEmail) {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: schoolEmail,
            subject: `[FightPort] Pagamento aprovado — ${ref.credits} créditos adicionados`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0D0D0D;">
                <h2 style="margin: 0 0 16px; font-size: 20px;">Pagamento confirmado ✓</h2>
                <p style="font-size: 14px; line-height: 1.5;">
                  Seu pagamento foi aprovado e <strong>${ref.credits} créditos</strong>
                  foram adicionados à sua conta no plano <strong>${ref.package_name}</strong>.
                </p>
                <div style="background: #F7F5F0; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <h3 style="margin: 0 0 8px; font-size: 14px;">Resumo</h3>
                  <p style="margin: 4px 0; font-size: 14px;">Créditos adicionados: <strong>${ref.credits}</strong></p>
                  <p style="margin: 4px 0; font-size: 14px;">Valor pago: <strong>R$ ${ref.price_brl.toFixed(2)}</strong></p>
                </div>
                <p style="margin: 24px 0;">
                  <a href="https://fightport.pro/painel" style="display: inline-block; background: #0D0D0D; color: #C8F135; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Acessar painel →
                  </a>
                </p>
                <p style="font-size: 11px; color: #999; margin-top: 24px;">FightPort — sistema automático</p>
              </div>
            `,
          }),
        });
      }
    } catch (emailErr) {
      console.warn("[send-email] payment confirmation failed:", emailErr);
    }

    return new Response(JSON.stringify({ status: "ok", credits_added: ref.credits }), { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 },
    );
  }
});
