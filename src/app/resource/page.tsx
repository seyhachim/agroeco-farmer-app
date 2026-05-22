import React from "react";
import MarketplaceClient from "./MarketplaceClient";
import { marketplaceApi, Product } from "../../lib/api/marketplaceApi";
import { TradeRequest } from "../../lib/api/trade";
import { Kantumruy_Pro } from "next/font/google";

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-kantumruy-pro",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

async function getMarketplaceData(tabParam: string) {
  try {
    const [initialProducts, bestSellers] = await Promise.all([
      marketplaceApi.getProducts({ type: "shop" as const }),
      marketplaceApi.getBestSellers(),
    ]);

    const initialTrades: TradeRequest[] = [];

    return {
      initialProducts,
      initialTrades,
      bestSellers,
      tabParam,
    };
  } catch (error) {
    console.error("Error fetching marketplace data:", error);
    return {
      initialProducts: [] as Product[],
      initialTrades: [] as TradeRequest[],
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
  // Await searchParams first, then access its properties
  const params = await searchParams;
  const tabParam = params.tab as string;

  const {
    initialProducts,
    initialTrades,
    bestSellers,
    tabParam: resolvedTabParam,
  } = await getMarketplaceData(tabParam);

  return (
    <MarketplaceClient
      initialProducts={initialProducts}
      initialTrades={initialTrades}
      bestSellers={bestSellers}
      tabParam={resolvedTabParam}
    />
  );
}
