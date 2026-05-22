import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/dashboard/sign-out-button";

export default async function Dashboard() {
  // FIX: Add 'await' here
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  const telegramData = user.user_metadata || {};
  const fullName = telegramData.full_name || "User";
  const emailDisplay = user.email || "No Email (Telegram)";
  const isTelegram = !!telegramData.telegram_id;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="opacity-90 text-sm mt-1">Protected Route</p>
        </div>

        <div className="p-6 space-y-6">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isTelegram
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {isTelegram ? "Logged in via Telegram" : "Logged in via Email"}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <p className="text-gray-800 font-medium text-lg">{fullName}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Account Identifier
              </label>
              <p className="text-gray-800 font-mono text-sm break-all">
                {emailDisplay}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Supabase User ID
              </label>
              <p className="text-gray-500 font-mono text-xs break-all">
                {user.id}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
