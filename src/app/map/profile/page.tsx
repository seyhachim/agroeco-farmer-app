"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Redirect only after loading is done
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  // While checking session, show loader (don't render profile or redirect)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking session...</p>
      </div>
    );
  }

  // If still no user after loading, return nothing (redirect will handle)
  if (!user) {
    return null;
  }

  // ✅ Render profile only after user is confirmed
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">👤 Profile</h1>

      <div className="w-full max-w-md rounded-lg bg-white shadow-md p-6 space-y-2">
        <p>
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-semibold">User ID:</span> {user.id}
        </p>
        <p>
          <span className="font-semibold">Created At:</span>{" "}
          {new Date(user.created_at).toLocaleString()}
        </p>
      </div>

      <button
        onClick={async () => {
          await logout();
          router.replace("/auth/login");
        }}
        className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
