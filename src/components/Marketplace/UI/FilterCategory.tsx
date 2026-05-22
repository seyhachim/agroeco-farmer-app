import React from "react";
import { useTranslations } from "../../../lib/i18n";

const categories = [
  "All",
  "Seeds",
  "Tools",
  "Equipment",
  "Product",
  "Live Stock",
  "Trade",
];

interface Props {
  currentCategory: string[];
  onCategoryChange: (category: string[]) => void;
}

const FilterCategory: React.FC<Props> = ({
  currentCategory,
  onCategoryChange,
}) => {
  const { tMarketplace } = useTranslations();

  // Translation mapping for categories
  const categoryTranslations: Record<string, string> = {
    All: tMarketplace("all"),
    Seeds: tMarketplace("seeds"),
    Tools: tMarketplace("tools"),
    Equipment: tMarketplace("equipment"),
    Product: tMarketplace("product"),
    "Live Stock": tMarketplace("liveStock"),
    Trade: tMarketplace("trade"),
  };

  const isSelected = (cat: string) => currentCategory.includes(cat);

  const handleToggle = (category: string) => {
    let newSelection = [...currentCategory];

    if (category === "All") {
      // Selecting 'All' clears everything else
      newSelection = isSelected("All") ? [] : ["All"];
    } else {
      if (isSelected(category)) {
        // Remove the category
        newSelection = newSelection.filter(
          (c) => c !== category && c !== "All"
        );
      } else {
        // Add the category and ensure 'All' is removed
        newSelection = newSelection.filter((c) => c !== "All");
        newSelection.push(category);
      }
    }

    // If selection is empty, default back to 'All'
    if (newSelection.length === 0) {
      newSelection = ["All"];
    }

    onCategoryChange(newSelection);
  };

  return (
    <div className="font-[kantumruy_Pro] p-4 border-b">
      <h3 className="font-semibold text-gray-800 mb-3">
        {tMarketplace("categories")}
      </h3>
      <div className="flex flex-wrap gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleToggle(cat)}
            className={`px-4 py-1.5 border rounded-full text-sm transition-all ${
              isSelected(cat)
                ? "bg-green-800 border-green-800 text-white"
                : "border-gray-300 text-gray-700 hover:bg-green-50"
            }`}
          >
            {categoryTranslations[cat]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterCategory;
