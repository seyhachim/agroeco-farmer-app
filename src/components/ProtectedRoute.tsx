"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
}

const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/confirm"];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only redirect if user is null and not on a public page
    if (loading && user !== undefined) {
      setLoading(false); // session checked
    }

    if (!loading && user === null && !publicRoutes.includes(pathname)) {
      router.push("/auth/login");
    }
  }, [user, pathname, router, loading]);

  // Show children if:
  // - user exists (logged in)
  // - OR this is a public route
  if (loading || (user === null && !publicRoutes.includes(pathname))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}
