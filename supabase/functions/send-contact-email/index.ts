import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { name, email, organization, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from("contact_submissions")
      .insert({ name, email, organization: organization || null, subject, message });

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    // Send email via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "fightport.pro <onboarding@resend.dev>",
        to: ["contato@fightport.pro"],
        reply_to: email,
        subject: `[Contato] ${subject} — ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1C1C1C; margin-bottom: 24px;">Nova mensagem de contato</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6B6B6B; width: 120px;">Nome</td><td style="padding: 8px 0; color: #1C1C1C;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #6B6B6B;">E-mail</td><td style="padding: 8px 0; color: #1C1C1C;">${email}</td></tr>
              ${organization ? `<tr><td style="padding: 8px 0; color: #6B6B6B;">Organização</td><td style="padding: 8px 0; color: #1C1C1C;">${organization}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #6B6B6B;">Assunto</td><td style="padding: 8px 0; color: #1C1C1C;">${subject}</td></tr>
            </table>
            <div style="margin-top: 24px; padding: 20px; background: #F7F7F5; border-radius: 8px;">
              <p style="color: #6B6B6B; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.06em;">Mensagem</p>
              <p style="color: #1C1C1C; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #9A9A9A; font-size: 12px; margin-top: 32px;">Enviado via formulário de contato — fightport.pro</p>
          </div>
        `,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      // Still return success since we saved to DB
      return new Response(
        JSON.stringify({ success: true, emailSent: false, dbSaved: !dbError }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailSent: true, dbSaved: !dbError }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
