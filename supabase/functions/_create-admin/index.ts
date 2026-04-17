import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async () => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const email = "global@fightport.pro";
  const password = "#Fight001#";

  // Try to find existing user
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);

  let userId: string;
  if (existing) {
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    userId = data.user!.id;
  }

  // Upsert into schools as admin
  const { error: schoolErr } = await admin.from("schools").upsert(
    {
      id: userId,
      name: "Fightport Global Admin",
      email,
      martial_art: "Outros",
      is_admin: true,
    },
    { onConflict: "id" }
  );

  // Ensure credits row exists
  await admin.from("credits").upsert({ school_id: userId, balance: 0 }, { onConflict: "school_id" });

  return new Response(
    JSON.stringify({ ok: true, user_id: userId, email, school_error: schoolErr?.message ?? null }),
    { headers: { "Content-Type": "application/json" } }
  );
});
