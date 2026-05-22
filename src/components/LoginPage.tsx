"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTelegramUser } from "@/hooks/useTelegramAuth";
import { useAuth } from "@/context/AuthContext";
import { saveTelegramUser } from "@/lib/supabase/saveTelegramUser";

export default function LoginPage() {
  const router = useRouter();
  const tgUser = useTelegramUser();
  const { user } = useAuth();

  // If already logged in normally
  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  // ✅ Skip login if Telegram user found
  useEffect(() => {
    if (tgUser) {
      //   saveTelegramUser(tgUser);
      console.log("Telegram user detected:", tgUser);
      // Optionally store them in Supabase
      router.push("/"); // skip login
    }
  }, [tgUser, router]);

  return (
    <div className="p-8 flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <p>Normal login form here...</p>
    </div>
  );
}
