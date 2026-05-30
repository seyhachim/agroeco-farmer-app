import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { getServiceSupabase } from "@/lib/supabase";

function verifyTelegramData(initData: string): Record<string, string> | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");
  const entries = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.TELEGRAM_BOT_TOKEN!)
    .digest();

  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(entries)
    .digest("hex");

  if (expectedHash !== hash) return null;

  const result: Record<string, string> = {};
  params.forEach((v, k) => (result[k] = v));
  return result;
}

export async function POST(req: NextRequest) {
  const { initData } = await req.json();

  if (!initData) {
    return NextResponse.json({ error: "Missing initData" }, { status: 400 });
  }

  const verified = verifyTelegramData(initData);
  if (!verified) {
    return NextResponse.json({ error: "Invalid Telegram data" }, { status: 401 });
  }

  const tgUser = JSON.parse(verified.user);
  const telegramId = tgUser.id;
  const email = `tg_${telegramId}@telegram.user`;
  const password = `tg_${telegramId}_${process.env.TELEGRAM_BOT_TOKEN!.slice(0, 8)}`;

  const admin = getServiceSupabase();

  // Try sign in first
  const { data: signInData, error: signInError } =
    await admin.auth.signInWithPassword({ email, password });

  if (!signInError && signInData.session) {
    return NextResponse.json({ session: signInData.session });
  }

  // Create user if not exists
  const { data: createData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      telegram_id: telegramId,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name,
      username: tgUser.username,
      photo_url: tgUser.photo_url,
    },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  // Sign in the newly created user
  const { data: newSession, error: newError } =
    await admin.auth.signInWithPassword({ email, password });

  if (newError) {
    return NextResponse.json({ error: newError.message }, { status: 500 });
  }

  return NextResponse.json({ session: newSession.session });
}
