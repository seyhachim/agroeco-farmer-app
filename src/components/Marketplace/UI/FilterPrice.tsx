import React from "react";
import { useTranslations } from "../../../lib/i18n";

interface Props {
  minPrice: number | null;
  maxPrice: number | null;
  onPriceChange: (key: "minPrice" | "maxPrice", value: number | null) => void;
}

const FilterPrice: React.FC<Props> = ({
  minPrice,
  maxPrice,
  onPriceChange,
}) => {
  const { tMarketplace } = useTranslations();

  const handleInputChange = (
    key: "minPrice" | "maxPrice",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    onPriceChange(key, value);
  };

  return (
    <div className="p-4 border-b">
      <h3 className="font-semibold text-gray-800 mb-3">
        {tMarketplace("priceRange")}
      </h3>
      <div className="flex gap-3 items-end">
        {/* Min Price Input Group */}
        <div className="relative w-1/2">
          <label
            htmlFor="min-price"
            className="text-gray-500 font-[kantumruy_Pro] text-xs font-normal leading-normal mb-1"
          >
            {tMarketplace("minPrice")}
          </label>
          <span className="absolute left-3 top-8.25 text-gray-500">$</span>
          <input
            id="min-price"
            type="number"
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 focus:ring-green-800 focus:border-green-800"
            value={minPrice ?? ""}
            onChange={(e) => handleInputChange("minPrice", e)}
            min="0"
          />
        </div>

        <span className="text-gray-500 mb-2">-</span>

        {/* Max Price Input Group */}
        <div className="relative w-1/2">
          <label
            htmlFor="max-price"
            className="text-gray-500 font-[kantumruy_Pro] text-xs font-normal leading-normal mb-1"
          >
            {tMarketplace("maxPrice")}
          </label>
          <span className="absolute left-3 top-8.25 text-gray-500">$</span>
          <input
            id="max-price"
            type="number"
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 focus:ring-green-800 focus:border-green-800"
            value={maxPrice ?? ""}
            onChange={(e) => handleInputChange("maxPrice", e)}
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPrice;
