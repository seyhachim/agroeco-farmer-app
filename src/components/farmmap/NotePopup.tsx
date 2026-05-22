"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  PhoneCall,
  MapPin,
  Tag,
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MessagesSquare,
} from "lucide-react";
import { Kantumruy_Pro } from "next/font/google";
import { useTranslations } from "@/lib/i18n";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface NotePopupProps {
  notePopupOpen: boolean;
  setNotePopupOpen: (open: boolean) => void;
  noteData: any;
}

const NotePopup: React.FC<NotePopupProps> = ({
  notePopupOpen,
  setNotePopupOpen,
  noteData,
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "photos">("info");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { t, lang } = useTranslations();

  if (!noteData) return null;

  // Farm type translations
  const getFarmTypeLabel = (type: string) => {
    const translations: Record<string, string> = {
      Farm: lang === "kh" ? "កសិដ្ឋាន" : "Farm",
      NGO: lang === "kh" ? "អង្គការ" : "NGO",
      "Store/Market": lang === "kh" ? "ហាង/ផ្សារ" : "Store/Market",
      "Education Center": lang === "kh" ? "មជ្ឈមណ្ឌលអប់រំ" : "Education Center",
      "Processing Facility": lang === "kh" ? "សម្ភារៈ" : "Processing Facility",
    };
    return translations[type] || type;
  };

  const translations = {
    details: lang === "kh" ? "ព័ត៌មានលម្អិត" : "Details",
    close: lang === "kh" ? "បិទ" : "Close",

    verified: lang === "kh" ? "បានផ្ទៀងផ្ទាត់" : "Verified",
    notVerified: lang === "kh" ? "មិនទាន់ផ្ទៀងផ្ទាត់" : "Not Verified",
    owner: lang === "kh" ? "ម្ចាស់" : "owner",

    // Updated owner label - different structure for Khmer vs English
    ownerLabel: (farmType: string) =>
      lang === "kh"
        ? `ម្ចាស់ ${getFarmTypeLabel(farmType)}`
        : `${getFarmTypeLabel(farmType)}'s owner`,

    personalInfo: lang === "kh" ? "ព័ត៌មានផ្ទាល់ខ្លួន" : "Personal Info",
    photos: lang === "kh" ? "រូបភាព" : "Photos",

    ownerInfo:
      lang === "kh" ? "ព័ត៌មានអំពីម្ចាស់កសិដ្ឋាន" : "Farm Owner Information",
    phone: lang === "kh" ? "ទូរស័ព្ទ" : "Phone",
    address: lang === "kh" ? "អាសយដ្ឋាន" : "Address",
    telegram: lang === "kh" ? "តេឡេក្រាម" : "Telegram",
    openInTelegram: lang === "kh" ? "បើកក្នុងតេឡេក្រាម" : "Open in Telegram",
    invalidTelegram:
      lang === "kh"
        ? "ទម្រង់តេឡេក្រាមមិនត្រឹមត្រូវ"
        : "Invalid Telegram format",
    noTelegram:
      lang === "kh" ? "មិនមានឈ្មោះតេឡេក្រាម" : "No Telegram username available",

    whatTheyGrow: lang === "kh" ? "អ្វីដែលពួកគេដាំ" : "What They Grow",
    certifications: lang === "kh" ? "វិញ្ញាបនបត្រ" : "Certifications",
    aboutFarm: (farmName: string) =>
      lang === "kh" ? `អំពី ${farmName}` : `About ${farmName}`,

    farmPhotos: lang === "kh" ? "រូបភាពកសិដ្ឋាន" : "Farm Photos",
    viewFullPhoto: lang === "kh" ? "មើលរូបពេញ" : "View Full Photo",

    closeLightbox: lang === "kh" ? "បិទ" : "Close",
  };

  return (
    <AnimatePresence>
      {notePopupOpen && noteData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white w-full h-[calc(100%-68px)] rounded-t-2xl pt-16 px-6 relative overflow-y-hidden"
          >
            <span
              className={`${kantumruyPro.className} absolute top-4 left-1/2 -translate-x-1/2 font-medium text-[14px] text-center text-[#383e49]`}
            >
              {translations.details}
            </span>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute w-7.5 h-7.5 bg-[#EEEEEF] rounded-full top-3 right-3 text-[#4B506D] text-2xl"
              onClick={() => setNotePopupOpen(false)}
            >
              &times;
            </motion.button>

            <div className="flex items-center gap-3 mb-4 ring-1 ring-[#EBECF0] rounded-lg p-3">
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                src={noteData.pf_url}
                alt="Profile"
                className="w-[77px] h-[77px] rounded-full object-cover"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[#252733] text-sm">
                    {noteData.owner}
                  </p>

                  {noteData.status === "verified" ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded-full">
                      {translations.verified}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-gray-200 text-gray-600 rounded-full">
                      {translations.notVerified}
                    </span>
                  )}
                </div>

                {/* Updated owner label */}
                <p className="text-[#717D96] text-sm">
                  {translations.ownerLabel(noteData.type)}
                </p>
              </div>
            </div>

            {/* ... rest of the component remains the same ... */}
            <div className="relative border-b mb-4 flex">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === "info" ? "text-[#0E4123]" : "text-gray-600"
                }`}
              >
                {translations.personalInfo}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab("photos");
                  setActiveSlide(0);
                }}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === "photos" ? "text-[#0E4123]" : "text-gray-600"
                }`}
              >
                {translations.photos}
              </motion.button>

              <motion.div
                className="absolute bottom-0 h-0.5 bg-[#0E4123]"
                initial={false}
                animate={{
                  left: activeTab === "info" ? "0%" : "50%",
                  width: "50%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>

            <div className="h-[calc(100%-200px)] overflow-y-auto">
              {activeTab === "info" ? (
                <>
                  <div className="mb-4 ring ring-inset ring-[#ebecf0] rounded-lg p-3 gap-2.5">
                    <span className="font-medium text-[14px] leading-[22px] text-[#252733]">
                      {translations.ownerInfo}
                    </span>

                    <div className="w-full flex items-center py-2">
                      <span className="w-10 h-10 bg-[#f6f8fa] rounded-[26px] flex items-center justify-center">
                        <PhoneCall size={20} color="#3d4043" />
                      </span>
                      <p className="font-normal text-[12px] text-[#252733] ml-3">
                        {translations.phone}: {noteData.phone}
                      </p>
                    </div>

                    <div className="w-full flex items-center py-2">
                      <span className="w-10 h-10 bg-[#f6f8fa] rounded-[26px] flex items-center justify-center">
                        <MapPin size={20} color="#3d4043" />
                      </span>
                      <p className="font-normal text-[12px] text-[#252733] ml-3">
                        {translations.address}: {noteData.address}
                      </p>
                    </div>

                    <div className="w-full flex items-center py-2">
                      <span className="w-10 h-10 bg-[#f6f8fa] rounded-[26px] flex items-center justify-center">
                        <img src="/icons/farmmap/telegram.svg" alt="Telegram" />
                      </span>
                      <div className="flex flex-col justify-center ml-3">
                        {noteData.owner_social?.find(
                          (s: any) => s.platform === "Telegram"
                        ) ? (
                          (() => {
                            const telegram = noteData.owner_social.find(
                              (s: any) => s.platform === "Telegram"
                            );

                            const getTelegramInfo = (url: string) => {
                              if (!url)
                                return { username: null, fullUrl: null };

                              let username = url;
                              let fullUrl = url;

                              username = username
                                .replace(/https?:\/\/(www\.)?/g, "")
                                .replace(/t\.me\//g, "")
                                .replace(/telegram\.me\//g, "")
                                .replace(/telegram\.org\//g, "");

                              username = username.replace(/^@/, "");

                              username = username.split(/[\/?#]/)[0];

                              const telegramRegex = /^[a-zA-Z0-9_]{5,32}$/;
                              if (!telegramRegex.test(username)) {
                                return { username: null, fullUrl: null };
                              }

                              fullUrl = `https://t.me/${username}`;

                              return { username, fullUrl };
                            };

                            const { username, fullUrl } = getTelegramInfo(
                              telegram.url
                            );

                            if (username && fullUrl) {
                              return (
                                <>
                                  <p className="font-normal text-[12px] leading-[22px] text-[#252733]">
                                    {translations.telegram}: @{username}
                                  </p>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                      window.open(fullUrl, "_blank")
                                    }
                                    className="font-normal text-[10px] text-center text-white bg-[#0088cc] rounded-full px-2 py-1 mt-1"
                                  >
                                    {translations.openInTelegram}
                                  </motion.button>
                                </>
                              );
                            } else {
                              return (
                                <p className="font-normal text-[12px] leading-[22px] text-[#252733]">
                                  {translations.invalidTelegram}
                                </p>
                              );
                            }
                          })()
                        ) : (
                          <p className="font-normal text-[12px] leading-[22px] text-[#252733]">
                            {translations.noTelegram}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {noteData.growing?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4"
                    >
                      <p className="text-gray-700 font-medium mb-2">
                        {translations.whatTheyGrow}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {noteData.growing.map((item: string, idx: number) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * idx }}
                            className="flex items-center gap-2 justify-between bg-green-100 px-2 py-1 rounded-full font-medium text-xs text-[#0e4123]"
                          >
                            <Tag size={12} color="#0e4123" strokeWidth={1.5} />{" "}
                            {item}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {noteData.certifications?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4"
                    >
                      <p className="text-gray-700 font-medium mb-2">
                        {translations.certifications}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {noteData.certifications.map(
                          (cert: string, idx: number) => (
                            <motion.span
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * idx }}
                              className="flex items-center gap-2 bg-yellow-100 px-2 py-1 rounded-full text-xs text-amber-800"
                            >
                              <Award
                                size={14}
                                color="#92400e"
                                strokeWidth={1.5}
                              />{" "}
                              {cert}
                            </motion.span>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}

                  {noteData.about && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4"
                    >
                      <p className="font-medium text-[14px] mb-3 text-[#252733]">
                        {translations.aboutFarm(noteData.name)}
                      </p>
                      <p className="font-normal text-xs text-gray-600">
                        {noteData.about}
                      </p>
                    </motion.div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-full relative overflow-hidden ring ring-inset ring-[#ebecf0] rounded-lg p-3">
                    <span className="font-medium text-[14px] leading-[22px] text-[#252733]">
                      {translations.farmPhotos}
                    </span>
                    <div className="w-full h-64 rounded-lg overflow-hidden relative">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeSlide}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          src={noteData.photos?.[activeSlide]}
                          alt={`Photo ${activeSlide + 1}`}
                          className="w-full h-64 object-cover"
                        />
                      </AnimatePresence>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl bg-[#F6F8FA] rounded-full p-2 shadow-lg"
                        onClick={() =>
                          setActiveSlide(
                            activeSlide > 0
                              ? activeSlide - 1
                              : noteData.photos.length - 1
                          )
                        }
                      >
                        <ChevronLeft color="#5B5B5B" size={16} />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-3xl bg-[#F6F8FA] rounded-full p-2 shadow-lg"
                        onClick={() =>
                          setActiveSlide(
                            activeSlide < noteData.photos.length - 1
                              ? activeSlide + 1
                              : 0
                          )
                        }
                      >
                        <ChevronRight color="#5B5B5B" size={16} />
                      </motion.button>
                    </div>

                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                      {noteData.photos?.map((src: string, idx: number) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveSlide(idx)}
                          className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                            idx === activeSlide
                              ? "border-[#0E4123]"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={src}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.button>
                      ))}
                    </div>

                    {noteData.photos?.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsLightboxOpen(true)}
                        className="mt-3 w-8 h-8 bg-[#f6f8fa] text-white text-sm py-2 rounded-full flex items-center justify-center absolute top-7 right-4"
                        title={translations.viewFullPhoto}
                      >
                        <Maximize2 size={16} color="#0C5C30" />
                      </motion.button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
          <AnimatePresence>
            {isLightboxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLightboxOpen(false)}
                  className="absolute top-5 right-5 text-white text-3xl"
                  title={translations.closeLightbox}
                >
                  &times;
                </motion.button>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSlide}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    src={noteData.photos[activeSlide]}
                    alt={`Full ${activeSlide + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-5xl bg-[#F6F8FA] rounded-full p-2 shadow-lg"
                  onClick={() =>
                    setActiveSlide(
                      activeSlide > 0
                        ? activeSlide - 1
                        : noteData.photos.length - 1
                    )
                  }
                >
                  <ChevronLeft color="#5B5B5B" size={16} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white text-5xl bg-[#F6F8FA] rounded-full p-2 shadow-lg"
                  onClick={() =>
                    setActiveSlide(
                      activeSlide < noteData.photos.length - 1
                        ? activeSlide + 1
                        : 0
                    )
                  }
                >
                  <ChevronRight color="#5B5B5B" size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotePopup;
