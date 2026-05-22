"use client";
import { ChevronLeft, ChevronRight, CircleX } from "lucide-react";

export default function Lightbox({
  open,
  photos,
  activeSlide,
  setActiveSlide,
  onClose,
}: any) {
  if (!open || !photos) return null;

  return (
    <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white">
        <CircleX size={28} />
      </button>

      <button
        onClick={() =>
          setActiveSlide((s: number) => (s > 0 ? s - 1 : photos.length - 1))
        }
        className="absolute left-4 text-white"
      >
        <ChevronLeft size={28} />
      </button>

      <img
        src={photos[activeSlide]}
        alt=""
        className="max-h-[80%] rounded-lg"
      />

      <button
        onClick={() =>
          setActiveSlide((s: number) => (s < photos.length - 1 ? s + 1 : 0))
        }
        className="absolute right-4 text-white"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
}
