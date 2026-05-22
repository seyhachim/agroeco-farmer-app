"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Funnel, ChevronLeft, CircleX } from "lucide-react";
import { Poppins, Roboto } from "next/font/google";
import { useTranslations } from "@/lib/i18n";

import { FILTER_MAP } from "./constants/farmMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface TopBarProps {
  searchTerm: string;
  handleSearch: (term: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  selectedFilters: string[];
  toggleFilter: (value: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  searchTerm,
  handleSearch,
  clearSearch,
  isSearching,
  setIsSearching,
  selectedFilters,
  toggleFilter,
}) => {
  const { t, lang } = useTranslations();

  const getFilterLabel = (filter: string) => {
    const translations: Record<string, string> = {
      ទាំងអស់: lang === "kh" ? "ទាំងអស់" : "All",
      អង្គការ: lang === "kh" ? "អង្គការ" : "Organization",
      ហាង: lang === "kh" ? "ហាង" : "Shop",
      កសិដ្ឋាន: lang === "kh" ? "កសិដ្ឋាន" : "Farm",
      មជ្ឈមណ្ឌលអប់រំ: lang === "kh" ? "មជ្ឈមណ្ឌលអប់រំ" : "Education Center",
      សម្ភារៈ: lang === "kh" ? "សម្ភារៈ" : "Equipment",
    };
    return translations[filter] || filter;
  };

  const FILTER_MAP_EN: Record<string, string[]> = {
    All: [
      "Farm",
      "NGO",
      "Store/Market",
      "Education Center",
      "Processing Facility",
    ],
    Organization: ["NGO"],
    Shop: ["Store/Market"],
    Farm: ["Farm"],
    "Education Center": ["Education Center"],
    Equipment: ["Processing Facility"],
  };

  const currentFilterMap = lang === "kh" ? FILTER_MAP : FILTER_MAP_EN;
  const filterKeys = Object.keys(currentFilterMap);

  const searchPlaceholder = lang === "kh" ? "ស្វែងរក..." : "Search...";

  return (
    <div className="w-full bg-white shadow-md px-6 py-3.5 flex flex-col">
      <div className="flex items-center gap-2">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Link href="/" className="btn btn-ghost p-2">
            <ChevronLeft size={22} color="#5B5B5B" />
          </Link>
        </motion.div>
        <motion.div
          whileFocus={{ scale: 1.02 }}
          className="flex items-center w-full bg-white ring-1 ring-inset ring-[#EBECF0] rounded-xl px-3 py-2"
        >
          <img
            src="/icons/farmmap/google_pin.svg"
            alt="Google Pins"
            className="w-6 h-6 mr-2.5"
          />
          <input
            id="pac-input"
            type="text"
            placeholder={searchPlaceholder}
            defaultValue={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearching(true)}
            className={`${roboto.className} bg-transparent outline-none w-full text-sm text-[#0D1B2A] placeholder:text-[#717D9699]`}
          />

          {searchTerm && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={clearSearch}
              className="ml-2"
            >
              <CircleX size={16} className="text-gray-500" />
            </motion.button>
          )}
        </motion.div>
      </div>

      <div className="px-3 max-h-28 overflow-x-auto scrollbar-hide">
        <div className="font-medium flex gap-1 min-w-max pb-2 scrollbar-hide scroll-smooth">
          {filterKeys.map((type) => {
            const isActive = selectedFilters.includes(type);
            return (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFilter(type)}
                className={`px-3 py-2 rounded-lg ring ring-inset text-xs transition whitespace-nowrap ${
                  isActive
                    ? "bg-[#0E4123] text-white ring-[#0E4123]"
                    : "bg-white text-[#3D4043] ring-[#EBECF0]"
                }`}
              >
                {getFilterLabel(type)}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
