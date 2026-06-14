"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
}

const publicRoutes = [
  "/welcome",
  "/auth/login",
  "/auth/signup",
  "/auth/confirm",
];
const publicPrefixes = ["/knowledge"];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic =
    publicRoutes.includes(pathname) ||
    publicPrefixes.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!loading && user === null && !isPublic) {
      router.push("/welcome");
    }
  }, [user, loading, isPublic, router]);

  if (loading || (user === null && !isPublic)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
