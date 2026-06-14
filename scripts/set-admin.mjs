// Promotes a user to the 'admin' role in user_profiles.
// Usage: npm run set-admin -- you@example.com
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run set-admin -- <email>");
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (check .env.local)"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  let userId;
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;

    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) {
      userId = match.id;
      break;
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  if (!userId) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const { error: upsertError } = await supabase
    .from("user_profiles")
    .upsert(
      { id: userId, role: "admin", updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );

  if (upsertError) throw upsertError;

  console.log(`Promoted ${email} (${userId}) to admin.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
