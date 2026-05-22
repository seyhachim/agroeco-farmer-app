import { useRef } from "react";
import { Images, X } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface ImageUploaderProps {
  profileImage: File | null;
  galleryImages: File[];
  imagePreviews: {
    profile: string | null;
    gallery: string[];
  };
  onProfileImageSelect: (file: File) => void;
  onGalleryImagesSelect: (files: File[]) => void;
  onRemoveProfileImage: () => void;
  onRemoveGalleryImage: (index: number) => void;
}

export const ImageUploader = ({
  profileImage,
  galleryImages,
  imagePreviews,
  onProfileImageSelect,
  onGalleryImagesSelect,
  onRemoveProfileImage,
  onRemoveGalleryImage,
}: ImageUploaderProps) => {
  const { t, tFarm } = useTranslations();
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onProfileImageSelect(file);
  };

  const handleGalleryImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    onGalleryImagesSelect(files);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {tFarm("profileImage")}
        </label>
        {imagePreviews.profile ? (
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24">
              <img
                src={imagePreviews.profile}
                className="w-24 h-24 object-cover rounded-2xl border-2 border-emerald-200"
                alt="Profile"
              />
              <button
                type="button"
                onClick={onRemoveProfileImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-gray-600">
              {tFarm("profileImage")} {t("selected")}
            </span>
          </div>
        ) : (
          <div
            onClick={() => profileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 cursor-pointer"
          >
            <Images className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">{t("clickToUpload")}</p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG {t("upTo")} 5MB
            </p>
          </div>
        )}
        <input
          type="file"
          ref={profileInputRef}
          accept="image/*"
          onChange={handleProfileImageChange}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {tFarm("galleryImages")} ({galleryImages.length}/5)
        </label>
        {imagePreviews.gallery.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {imagePreviews.gallery.map((src, idx) => (
              <div key={idx} className="relative w-20 h-20">
                <img
                  src={src}
                  className="w-20 h-20 object-cover rounded-xl border-2 border-emerald-200"
                  alt={`Gallery ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => onRemoveGalleryImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {galleryImages.length < 5 && (
          <>
            <div
              onClick={() => galleryInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 cursor-pointer"
            >
              <Images className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">{t("addImages")}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t("canAddMore")} {5 - galleryImages.length} {t("moreImages")}
              </p>
            </div>
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              multiple
              onChange={handleGalleryImagesChange}
              className="hidden"
            />
          </>
        )}
      </div>
    </>
  );
};
