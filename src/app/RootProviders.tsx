"use client";

import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";
import BottomNavigation from "@/components/BottomNavigation";
import { I18nProvider } from "@/lib/i18n";
import { SavedProvider } from "@/components/learninghub/Saved/SavedContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProfileProvider } from "@/context/ProfileContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { ReactNode } from "react";
import { FavProvider } from "../components/Marketplace/context/FavContext";
import { CartProvider } from "../components/Marketplace/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

interface RootProvidersProps {
  children: ReactNode;
}

export default function RootProviders({ children }: RootProvidersProps) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <I18nProvider>
          <SavedProvider>
            <FavProvider>
              <CartProvider>
                <ProtectedRoute>
                  <div
                    className={`${inter.className} min-h-screen bg-gray-50 flex flex-col`}
                  >
                    <main className="flex-1">{children}</main>
                  </div>
                </ProtectedRoute>
              </CartProvider>
            </FavProvider>
          </SavedProvider>
        </I18nProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
