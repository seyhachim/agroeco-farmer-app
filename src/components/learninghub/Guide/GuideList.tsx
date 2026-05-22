"use client";
import React, { useState } from "react";
import GuideCard from "./GuideCard";
import FilterDropdown from "../ui/FilterDropdown";
import { Guide } from "../../../lib/api/guides";
import { useTranslations } from "../../../lib/i18n";

interface GuideListProps {
  guides: Guide[];
  searchText?: string;
}

const GuideList: React.FC<GuideListProps> = ({ guides, searchText = "" }) => {
  const { tLearninghub, lang } = useTranslations();
  const [activeFilter, setActiveFilter] = useState(
    lang === "kh" ? "ប្រភេទទាំងអស់" : "All Categories"
  );

  // Define categories with both languages
  const categories = {
    kh: ["ប្រភេទទាំងអស់", "ដី និងជីកំប៉ុស", "ជី", "ការថែរក្សាដំណាំ"],
    en: ["All Categories", "Soil & Compost", "Fertilizer", "Plant Care"],
  };

  const currentCategories = categories[lang];

  const filteredGuides = guides.filter((guide) => {
    // Handle category filtering with language support
    const matchesCategory =
      activeFilter === currentCategories[0] ||
      (lang === "kh"
        ? // Khmer category matching logic
          (activeFilter === "ដី និងជីកំប៉ុស" &&
            guide.category === "Soil & Compost") ||
          (activeFilter === "ជី" && guide.category === "Fertilizer") ||
          (activeFilter === "ការថែរក្សាដំណាំ" &&
            guide.category === "Plant Care") ||
          guide.category === activeFilter
        : // English category matching logic
          guide.category === activeFilter);

    const matchesSearch =
      guide.title.toLowerCase().includes(searchText.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchText.toLowerCase()) ||
      guide.author.toLowerCase().includes(searchText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 items-center px-6">
      {/* Dropdown filter */}
      <FilterDropdown
        categories={currentCategories}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* Guide cards */}
      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <GuideCard key={guide.id} {...guide} />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center mt-4">
          <p className="font-[Kantumruy_Pro]">
            {searchText
              ? tLearninghub("noSearchResults")
              : tLearninghub("noGuidesFound")}
          </p>
        </div>
      )}
    </div>
  );
};

export default GuideList;
