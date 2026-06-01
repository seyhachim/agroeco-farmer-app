"use client";
import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "../../../lib/i18n";

interface FilterDropdownProps {
  categories: string[];
  activeFilter: string;
  setActiveFilter: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  categories,
  activeFilter,
  setActiveFilter,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { tLearninghub } = useTranslations();

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemClick = (category: string) => {
    setActiveFilter(category);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="flex items-center gap-3 w-[382px] mt-[22px] pl-1 font-[Kantumruy_Pro]">
      <span className="text-[#6B7280] text-xs font-medium ">
        {tLearninghub("showing")}
      </span>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-between w-[312px] 
            ${
              activeFilter
                ? "text-[#0E4123] text-xs font-medium leading-5"
                : "text-[#0E4123] text-xs font-medium leading-5"
            }`}
        >
          {activeFilter || "All Categories"}
          <ChevronDownIcon
            className={`w-6 h-6 rounded border border-[#E5E7EB] bg-white transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-2 w-[318px] bg-white border border-gray-200 rounded-lg shadow-md z-10 p-2"
            >
              <ul className="divide-y divide-gray-100 max-h-[200px] overflow-y-auto">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <motion.li
                      key={cat}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-[#0D1B2A] text-sm font-normal leading-[26px]"
                      onClick={() => handleItemClick(cat)}
                    >
                      {cat}
                    </motion.li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500">
                    {tLearninghub("noCategoriesFound")}
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FilterDropdown;
