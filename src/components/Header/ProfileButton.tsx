"use client";

import Link from "next/link";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";

export default function ProfileButton() {
  const { user, loading, logout } = useAuth();
  const { profile } = useProfile();
  const isAdmin = profile?.role === "admin";

  if (loading) {
    return (
      <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition"
        title="ចូលប្រើប្រាស់"
      >
        <User className="h-5 w-5 text-white" />
      </Link>
    );
  }

  if (isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition"
          title="គណនីរបស់ខ្ញុំ"
        >
          <User className="h-5 w-5 text-white" />
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition"
          title="Dashboard"
        >
          <LayoutDashboard className="h-5 w-5 text-white" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/profile"
        className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition"
        title="គណនីរបស់ខ្ញុំ"
      >
        <User className="h-5 w-5 text-white" />
      </Link>
      <button
        onClick={() => logout()}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition"
        title="ចាកចេញ"
      >
        <LogOut className="h-5 w-5 text-white" />
      </button>
    </div>
  );
}
