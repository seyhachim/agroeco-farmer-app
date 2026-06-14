import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage") ?? "20")));

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.listUsers({ page, perPage });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const userIds = authData.users.map((u) => u.id);

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("user_profiles")
    .select("id, display_name, avatar_url, role, created_at")
    .in("id", userIds);

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  const users = authData.users.map((u) => {
    const profile = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? null,
      phone: u.phone ?? null,
      display_name:
        profile?.display_name || u.user_metadata?.full_name || null,
      avatar_url: profile?.avatar_url ?? null,
      role: profile?.role ?? "farmer",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
    };
  });

  return NextResponse.json({
    users,
    page,
    perPage,
    total: authData.total ?? users.length,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const role = body?.role as string | undefined;

  if (!userId || (role !== "admin" && role !== "farmer")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (userId === auth.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("user_profiles")
    .upsert(
      { id: userId, role, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
