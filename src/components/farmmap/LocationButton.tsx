"use client";

import { motion } from "framer-motion";
import { Locate } from "lucide-react";

interface LocationButtonProps {
  trackLocationOnce: () => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({
  trackLocationOnce,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: [
          "0px 0px 0px rgba(14, 65, 35, 0)",
          "0px 0px 10px rgba(14, 65, 35, 0.5)",
          "0px 0px 0px rgba(14, 65, 35, 0)",
        ],
      }}
      transition={{
        boxShadow: { repeat: Infinity, duration: 2 },
      }}
      onClick={trackLocationOnce}
      className="absolute bottom-48 right-5 bg-white shadow-md p-2.5 rounded-full z-50"
    >
      <Locate size={22} color="#0E4123" />
    </motion.button>
  );
};

export default LocationButton;
