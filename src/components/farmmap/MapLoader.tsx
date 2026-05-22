"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Locate } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export default function MapLoader({ loading }: { loading: boolean }) {
  const { t } = useTranslations();

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-[#0E4123] rounded-full mb-4 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Locate size={28} color="white" />
              </motion.div>
            </div>
            <p className="text-[#0E4123] font-medium">{t("loading")}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
