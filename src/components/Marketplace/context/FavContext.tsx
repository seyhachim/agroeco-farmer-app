"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface FavContextType {
  favoriteIds: string[];
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  removeFavoriteByProductId: (productId: string) => void;
  isLoading: boolean;
}

const FavContext = createContext<FavContextType | undefined>(undefined);

export const FavProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);

      if (!user) {
        setFavoriteIds([]);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setFavoriteIds(data?.map((item) => item.product_id) || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
      setFavoriteIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  // FIX — Reload favorites whenever auth user changes
  useEffect(() => {
    loadFavorites();
  }, [user]);

  const addFavorite = async (productId: string) => {
    if (!user) {
      alert("Please sign in to add favorites");
      return;
    }

    const { error } = await supabase
      .from("favorites")
      .insert([{ user_id: user.id, product_id: productId }]);

    if (!error) {
      setFavoriteIds((prev) => [...prev, productId]);
    }
  };

  const removeFavorite = async (productId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (!error) {
      setFavoriteIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const removeFavoriteByProductId = (productId: string) => {
    setFavoriteIds((prev) => prev.filter((id) => id !== productId));
  };

  return (
    <FavContext.Provider
      value={{
        favoriteIds,
        addFavorite,
        removeFavorite,
        removeFavoriteByProductId,
        isLoading,
      }}
    >
      {children}
    </FavContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavProvider");
  }
  return context;
};
