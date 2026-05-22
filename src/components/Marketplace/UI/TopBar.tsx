"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useFavorites } from "../context/FavContext";
import { useCart } from "../context/CartContext";
import { Heart } from "lucide-react";
import { useTranslations } from "../../../lib/i18n";

const TopBar: React.FC = () => {
  const router = useRouter();
  const { favoriteIds } = useFavorites();
  const { cartIds } = useCart();
  const { tMarketplace } = useTranslations();

  return (
    <div className="relative flex justify-between items-center w-full border p-4 sm:p-6 border-solid border-[#EBECF0]">
      <Link href="/" className="z-10 ml-2">
        <FaChevronLeft className="text-xl text-[#5B5B5B] cursor-pointer" />
      </Link>

      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-[#0D1B2A] text-base font-[kantumruy_Pro]  leading-4 tracking-[0.2px] text-center">
        {tMarketplace("marketplace")}
      </h1>

      <div className="flex items-center justify-between gap-4 z-10 mr-2">
        {/* Favorites */}
        <button
          onClick={() => router.push("/resource/favorites")}
          className="relative"
          aria-label={tMarketplace("addToFavorites")}
        >
          <Heart size={24} className="text-[#0E4123]" />
          {favoriteIds.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0E4123] text-[10px] font-bold text-white leading-none">
              {favoriteIds.length > 9 ? "9+" : favoriteIds.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TopBar;
