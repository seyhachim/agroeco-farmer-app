"use client";
import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "../../../lib/i18n";

interface SearchFilterProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  value,
  onChange,
}) => {
  const { tLearninghub } = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="w-[382px] h-9 rounded-[10px] bg-white flex items-center pl-4 pr-4 border border-[#E3E3E3] mt-[22px] ml-[24px] mr-[24px] font-[Kantumruy_Pro]"
    >
      <img
        src="/icons/learninghub/icon_search.svg"
        alt="search-icon"
        className="w-[18px] h-[18px]"
      />
      <input
        type="text"
        placeholder={tLearninghub("searchPlaceholder")}
        className="flex-1 w-full h-full pl-3 outline-none text-[rgba(113,125,150,0.6)]  text-[14px] font-normal tracking-[-0.14px]"
        value={value}
        onChange={onChange}
        style={{ fontSize: "16px" }}
      />
    </motion.div>
  );
};
export default SearchFilter;
