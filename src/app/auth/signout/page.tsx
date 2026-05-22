"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SignOutPage() {
  useEffect(() => {
    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
      } else {
        console.log("User logged out successfully");
        // Redirect to login page
        window.location.href = "/login";
      }
    };

    handleLogout();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Signing Out...</h1>
    </div>
  );
}
