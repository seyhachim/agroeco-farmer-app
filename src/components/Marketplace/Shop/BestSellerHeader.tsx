import React from "react";
import { useTranslations } from "../../../lib/i18n";

interface Props {
  title: string;
  onSeeAll?: () => void;
}

const BestSellerHeader: React.FC<Props> = ({ onSeeAll }) => {
  const { tMarketplace } = useTranslations();

  return (
    <div className="flex justify-between items-center mb-4 sm:mb-6 font-[kantumruy_Pro]">
      <h2 className="text-[18px] font-medium text-[#6B7280]">
        {" "}
        {tMarketplace("bestSeller")}
      </h2>
      <button
        onClick={onSeeAll}
        className="px-4 py-2 rounded-[8px] border border-[#E5E7EB] bg-white text-[#0E4123] text-[14px] font-medium hover:bg-gray-50 transition-colors duration-200"
      >
        {tMarketplace("seeAll")}
      </button>
    </div>
  );
};

export default BestSellerHeader;
