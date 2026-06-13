import React from "react";
import MarketplaceClient from "./MarketplaceClient";
import { Product } from "../../lib/api/marketplaceApi";
import { TradeRequest } from "../../lib/api/trade";
import { Kantumruy_Pro } from "next/font/google";
import { createClient } from "@/lib/supabase/server";

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-kantumruy-pro",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";

async function getMarketplaceData(tabParam: string) {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("type", "shop")
      .order("created_at", { ascending: false });

    if (error || !products) {
      throw error ?? new Error("No products returned");
    }

    const productIds = products.map((p) => p.id);

    const { data: productImages } = await supabase
      .from("product_images")
      .select("*")
      .in("product_id", productIds);

    const imagesMap = new Map<string, { image_url: string; image_order: number }[]>();
    productImages?.forEach((img) => {
      if (!imagesMap.has(img.product_id)) imagesMap.set(img.product_id, []);
      imagesMap.get(img.product_id)!.push(img);
    });

    const initialProducts: Product[] = products.map((product) => {
      const imgs = (imagesMap.get(product.id) ?? []).sort(
        (a, b) => a.image_order - b.image_order
      );
      return {
        ...product,
        images: imgs.length > 0 ? imgs.map((i) => i.image_url) : [PLACEHOLDER_IMAGE],
        seller: { name: "Seller", avatar: "", points: 0, contributorLevel: "Contributor" },
      };
    });

    const bestSellers = initialProducts.filter((p) => p.is_best_seller);

    return { initialProducts, bestSellers, tabParam };
  } catch (error) {
    console.error("Error fetching marketplace data:", error);
    return {
      initialProducts: [] as Product[],
      bestSellers: [] as Product[],
      tabParam,
    };
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = await searchParams;
  const tabParam = params.tab as string;

  const { initialProducts, bestSellers, tabParam: resolvedTabParam } =
    await getMarketplaceData(tabParam);

  return (
    <MarketplaceClient
      initialProducts={initialProducts}
      initialTrades={[] as TradeRequest[]}
      bestSellers={bestSellers}
      tabParam={resolvedTabParam}
    />
  );
}
