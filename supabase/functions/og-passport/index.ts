import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const fpId = url.searchParams.get("id");

  if (!fpId) {
    return new Response("Missing id parameter", { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: practitioner } = await supabase
    .from("practitioners")
    .select("*, schools(name, martial_art)")
    .eq("fp_id", fpId)
    .single();

  if (!practitioner) {
    return new Response("Practitioner not found", { status: 404, headers: corsHeaders });
  }

  const school = practitioner.schools as any;
  const fullName = `${practitioner.first_name} ${practitioner.last_name}`;
  const title = `${fullName} — Passaporte ${practitioner.martial_art} | fightport.pro`;
  const description = `Passaporte verificado de ${fullName}. ${practitioner.martial_art} na ${school?.name}. Graduações autenticadas com hash SHA-256.`;
  const pageUrl = `https://fightport.lovable.app/p/${practitioner.fp_id}`;
  const imageUrl = practitioner.photo_url || "";

  // Detect if the request is from a social crawler
  const userAgent = (req.headers.get("user-agent") || "").toLowerCase();
  const isCrawler = /facebookexternalhit|twitterbot|telegrambot|whatsapp|linkedinbot|slackbot|discordbot|pinterest|googlebot/i.test(userAgent);

  // For browsers, redirect to the SPA
  if (!isCrawler) {
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: pageUrl },
    });
  }

  // For crawlers, return pre-rendered HTML with OG tags
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <!-- Open Graph -->
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}">` : ""}
  <meta property="og:site_name" content="fightport.pro">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="${imageUrl ? "summary_large_image" : "summary"}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">` : ""}

  <link rel="canonical" href="${escapeHtml(pageUrl)}">

  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName,
    url: pageUrl,
    description,
    memberOf: {
      "@type": "SportsOrganization",
      name: school?.name,
      sport: practitioner.martial_art,
    },
    ...(practitioner.current_belt && {
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        name: `Faixa ${practitioner.current_belt} — ${practitioner.martial_art}`,
        credentialCategory: "Belt Rank",
      },
    }),
  })}
  </script>
</head>
<body>
  <h1>${escapeHtml(fullName)}</h1>
  <p>${escapeHtml(description)}</p>
  <a href="${escapeHtml(pageUrl)}">Ver passaporte completo</a>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
