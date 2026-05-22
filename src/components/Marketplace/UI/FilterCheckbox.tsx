import React from "react";
import { useTranslations } from "../../../lib/i18n";

const options = ["All", "Organic Only", "Agroecology Friendly"];

interface Props {
  currentSelection: string[];
  onCheckboxChange: (selection: string[]) => void;
}

const FilterCheckbox: React.FC<Props> = ({
  currentSelection,
  onCheckboxChange,
}) => {
  const { tMarketplace } = useTranslations();

  // Translation mapping for options
  const optionTranslations: Record<string, string> = {
    All: tMarketplace("all"),
    "Organic Only": tMarketplace("organicOnly"),
    "Agroecology Friendly": tMarketplace("agroecologyFriendly"),
  };

  const handleChange = (option: string, isChecked: boolean) => {
    let newSelection = [...currentSelection];

    if (option === "All") {
      newSelection = isChecked ? ["All"] : [];
    } else if (isChecked) {
      newSelection = newSelection.filter((item) => item !== "All"); // Remove 'All'
      if (!newSelection.includes(option)) {
        newSelection.push(option);
      }
    } else {
      newSelection = newSelection.filter((item) => item !== option);
    }

    // If no options are selected, default back to "All"
    if (newSelection.length === 0) {
      newSelection = ["All"];
    }

    onCheckboxChange(newSelection);
  };

  const isChecked = (option: string) => currentSelection.includes(option);

  return (
    <div className="font-[kantumruy_Pro] p-4 border-b">
      <h3 className="font-semibold text-gray-800 mb-3">
        {tMarketplace("certification")}
      </h3>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              className="w-4 h-4 text-green-800 border-gray-300 rounded focus:ring-green-800 accent-green-800"
              checked={isChecked(opt)}
              onChange={(e) => handleChange(opt, e.target.checked)}
            />
            <span>{optionTranslations[opt]}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterCheckbox;
