"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

interface CartContextType {
  cartIds: string[];
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCartIds([]);
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const cartProductIds = data?.map((item) => item.product_id) || [];
      setCartIds(cartProductIds);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please sign in to add to cart");
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .insert([{ user_id: user.id, product_id: productId, quantity: 1 }]);

      if (error) {
        if (error.code === "23505") {
          // Unique violation - item already in cart, we can ignore or update quantity
          console.log("Item already in cart");
        } else {
          throw error;
        }
      }

      setCartIds((prev) => [...prev, productId]);
    } catch (error: unknown) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to cart";
      alert(errorMessage);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;

      setCartIds((prev) => prev.filter((id) => id !== productId));
    } catch (error: unknown) {
      console.error("Error removing from cart:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove from cart";
      alert(errorMessage);
    }
  };

  const clearCart = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setCartIds([]);
    } catch (error: unknown) {
      console.error("Error clearing cart:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clear cart";
      alert(errorMessage);
    }
  };

  return (
    <CartContext.Provider
      value={{ cartIds, addToCart, removeFromCart, clearCart, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
