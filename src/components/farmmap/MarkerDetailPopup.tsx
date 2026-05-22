"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n";

interface MarkerDetailPopupProps {
  selectedMarker: any;
  setSelectedMarker: (marker: any) => void;
  openNotePopup: (marker: any) => void;
  handleDirectionsClick: () => void;
}

const MarkerDetailPopup: React.FC<MarkerDetailPopupProps> = ({
  selectedMarker,
  setSelectedMarker,
  openNotePopup,
  handleDirectionsClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { t, lang } = useTranslations();

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || startY === null) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0) setCurrentY(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 100) setSelectedMarker(null);
    setCurrentY(0);
  };

  const translations = {
    phone: lang === "kh" ? "លេខទូរស័ព្ទ:" : "Phone:",
    copy: lang === "kh" ? "ចម្លង" : "Copy",
    copied: lang === "kh" ? "បានចម្លង" : "Copied",
    directions: lang === "kh" ? "ទិសដៅ" : "Directions",
    details: lang === "kh" ? "ព័ត៌មានលម្អិត" : "Details",
    goToDestination: lang === "kh" ? "ទៅកាន់ទីតាំង" : "Go to Destination",
  };

  return (
    <AnimatePresence>
      {selectedMarker && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMarker(null)}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: currentY > 0 ? currentY : 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full z-50"
            style={{ touchAction: "none" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="bg-white rounded-t-2xl shadow-lg p-5 relative">
              <div className="bg-[#DADCE0] rounded-full w-14 h-1 mx-auto mb-3"></div>

              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-normal text-[19px] text-[#1f1f1f]">
                    {selectedMarker?.name}
                  </h3>
                  <p className="font-normal text-[14px] text-[#5e5e5e]">
                    {translations.phone} {selectedMarker?.phone}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedMarker?.phone) {
                      navigator.clipboard.writeText(selectedMarker.phone);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    }
                  }}
                  className="font-normal text-[14px] text-[#007aff] hover:underline"
                >
                  {copied ? translations.copied : translations.copy}
                </motion.button>
              </div>

              <div className="flex gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#0e4123] font-medium text-[14px] text-center text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  onClick={handleDirectionsClick}
                >
                  <img
                    src="/icons/farmmap/directions.svg"
                    alt=""
                    className="w-5"
                  />
                  <p className="h-full flex justify-center items-center pt-1">
                    {translations.goToDestination}
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex justify-center items-center border border-[#0e4123] font-medium text-[14px] text-right text-[#0e4123] py-2 rounded-lg"
                  onClick={() => openNotePopup(selectedMarker)}
                >
                  {translations.details}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MarkerDetailPopup;
