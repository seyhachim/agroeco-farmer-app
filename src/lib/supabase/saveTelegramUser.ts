import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveTelegramUser(tgUser: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}) {
  const { data, error } = await supabase.from("telegram_users").upsert(
    {
      telegram_id: tgUser.id,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name,
      username: tgUser.username,
    },
    { onConflict: "telegram_id" }
  );

  if (error) console.error("Supabase error:", error);
  return data;
}
