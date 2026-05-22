"use client";

import { motion } from "framer-motion";
import { Roboto } from "next/font/google";
import { AnimatePresence } from "framer-motion";

import { REMARKS } from "./constants/farmMap";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface RemarkPanelProps {
  selectedRemarks: string[];
}

const RemarkPanel: React.FC<RemarkPanelProps> = ({ selectedRemarks }) => {
  return (
    <AnimatePresence>
      {selectedRemarks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`${roboto.className} absolute bottom-8 right-5 bg-white p-3 rounded-lg shadow-md`}
        >
          <span className="text-base font-medium text-[#0D1B2A]">Remark</span>
          <ul className="mt-2 flex flex-col gap-1">
            {REMARKS.filter((r) => selectedRemarks.includes(r.label)).map(
              (item) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-32 text-[#3A4042] text-xs flex items-center gap-2"
                >
                  <img src={item.icon} alt={item.label} className="w-4 h-4" />
                  {item.label}
                </motion.li>
              )
            )}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RemarkPanel;
