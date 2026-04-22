import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version",
};

interface SendEmailBody {
  to?: unknown;
  subject?: unknown;
  html?: unknown;
  replyTo?: unknown;
  idempotencyKey?: unknown;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    let body: SendEmailBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, html, replyTo /* idempotencyKey reservado para uso futuro */ } = body;

    if (!isNonEmptyString(to) || !isNonEmptyString(subject) || !isNonEmptyString(html)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service-role client para gravar no log (best-effort)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const resendPayload: Record<string, unknown> = {
      from: "FightPort <noreply@fightport.pro>",
      to: [to],
      subject,
      html,
    };
    if (isNonEmptyString(replyTo)) {
      resendPayload.reply_to = replyTo;
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(resendPayload),
    });

    let resendData: any = null;
    try {
      resendData = await resendRes.json();
    } catch {
      resendData = null;
    }

    if (!resendRes.ok) {
      const errorMessage =
        (resendData && (resendData.message || resendData.error)) ||
        `Resend HTTP ${resendRes.status}`;

      console.error("Resend error:", resendData);

      try {
        await supabase.from("email_send_log").insert({
          to,
          subject,
          status: "failed",
          error_message: typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage),
        });
      } catch (logErr) {
        console.error("Failed to write email_send_log (failed):", logErr);
      }

      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messageId: string | null = (resendData && resendData.id) || null;

    try {
      await supabase.from("email_send_log").insert({
        to,
        subject,
        status: "sent",
        resend_message_id: messageId,
      });
    } catch (logErr) {
      console.error("Failed to write email_send_log (sent):", logErr);
    }

    return new Response(
      JSON.stringify({ success: true, messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-email error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
