import React from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  onClick: () => void;
}

const FilterButton: React.FC<Props> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex w-7.5 h-7.5 p-[5px] font-[kantumruy_Pro] justify-center items-center shrink-0 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 transition-colors"
  >
    <ChevronDown className="text-[#5D6679]" size={16} />
  </button>
);

export default FilterButton;
