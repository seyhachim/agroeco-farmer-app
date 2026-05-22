"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { AlertCircle, UserX, X } from "lucide-react";
import { tradeApi, uploadImage } from "../../../lib/api/trade";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "../../../lib/i18n";

interface CreateTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeCreated: () => void;
  prefilledRecipient?: string; // Add this prop
}

const CreateTradeModal: React.FC<CreateTradeModalProps> = ({
  isOpen,
  onClose,
  onTradeCreated,
  prefilledRecipient = "", // Default to empty string
}) => {
  const { t, tMarketplace } = useTranslations();
  const [formData, setFormData] = useState({
    to_user_display_name: prefilledRecipient, // Initialize with prefilled value
    title: "",
    description: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserDisplayName, setCurrentUserDisplayName] =
    useState<string>("");
  const [isSelfTrade, setIsSelfTrade] = useState(false);

  // Handle Escape key and background scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    // Add event listener when modal is open
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent background scroll
      document.body.style.overflow = "hidden";
    }

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Restore background scroll
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Get current user's display name when modal opens and handle prefilled recipient
  useEffect(() => {
    const getCurrentUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("display_name")
            .eq("id", user.id)
            .single();

          if (profile?.display_name) {
            setCurrentUserDisplayName(profile.display_name);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (isOpen) {
      getCurrentUserProfile();

      // Set prefilled recipient if provided
      if (prefilledRecipient) {
        setFormData((prev) => ({
          ...prev,
          to_user_display_name: prefilledRecipient,
        }));
      }
    }
  }, [isOpen, prefilledRecipient]); // Add prefilledRecipient to dependencies

  // Check if user is trying to trade with themselves
  useEffect(() => {
    if (formData.to_user_display_name.trim() && currentUserDisplayName) {
      const isSelf =
        formData.to_user_display_name.trim().toLowerCase() ===
        currentUserDisplayName.toLowerCase();
      setIsSelfTrade(isSelf);

      if (isSelf) {
        setError(tMarketplace("tradeWithSelfError"));
      } else if (error?.includes("yourself")) {
        setError(null);
      }
    } else {
      setIsSelfTrade(false);
    }
  }, [
    formData.to_user_display_name,
    currentUserDisplayName,
    error,
    tMarketplace,
  ]);

  const handleImageUpload = async (files: FileList) => {
    const newImages = Array.from(files);

    // Check if adding new images would exceed the 5-image limit
    const totalImagesAfterUpload = images.length + newImages.length;
    if (totalImagesAfterUpload > 3) {
      setError(tMarketplace("maximumPhotos_Product"));
      return;
    }

    // Validate file types and sizes
    const validImages = newImages.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isValidType) {
        setError(
          `Invalid file type: ${file.name}. ${tMarketplace(
            "pleaseUseValidImageFormats"
          )}`
        );
        return false;
      }
      if (!isValidSize) {
        setError(
          `File too large: ${file.name}. ${tMarketplace(
            "maximumFileSize"
          )} 10MB.`
        );
        return false;
      }
      return true;
    });

    if (validImages.length === 0) return;

    // Create previews
    const newPreviews = validImages.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImages((prev) => [...prev, ...validImages]);
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));

    // Clear error if it was about maximum images
    if (error?.includes("maximum")) {
      setError(null);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    setUploading(true);
    try {
      console.log("Uploading", images.length, "images...");
      const uploadPromises = images.map((file) => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      console.log("Images uploaded successfully:", urls);
      return urls;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error(tMarketplace("imageUploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation
    if (!formData.to_user_display_name.trim()) {
      setError(tMarketplace("enterRecipientName"));
      return;
    }

    if (isSelfTrade) {
      setError(tMarketplace("tradeWithSelfError"));
      return;
    }

    // if (!formData.title.trim()) {
    //   setError(tMarketplace("enterTradeTitle"));
    //   return;
    // }

    setLoading(true);
    setError(null);

    try {
      console.log("Starting trade creation process...");

      // Use the new method that handles image uploads
      const tradeData = {
        to_user_display_name: formData.to_user_display_name.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      console.log("Creating trade with data and images:", tradeData, images);
      await tradeApi.createTradeRequestWithImages(tradeData, images);

      console.log("Trade created successfully!");
      onTradeCreated();
      handleClose();
    } catch (err) {
      console.error("Trade creation error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : tMarketplace("tradeCreationFailed");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      to_user_display_name: prefilledRecipient, // Reset to prefilled value
      title: "",
      description: "",
    });
    // Clean up all object URLs to prevent memory leaks
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreviews([]);
    setError(null);
    setIsSelfTrade(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing (unless it's a self-trade error)
    if (error && !error.includes("yourself")) {
      setError(null);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4 font-[kantumruy_Pro]"
      onClick={handleClose} // Close when clicking on backdrop
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {tMarketplace("createTradeRequest")}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={loading || uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              className={`rounded-lg p-3 ${
                error.includes("yourself") || error.includes("maximum")
                  ? "bg-red-50 border border-red-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start gap-2">
                {error.includes("yourself") ? (
                  <UserX className="text-red-600 mt-0.5 shrink-0" size={16} />
                ) : (
                  <AlertCircle
                    className="text-red-600 mt-0.5 shrink-0"
                    size={16}
                  />
                )}
                <div>
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                  {error.includes("yourself") && (
                    <p className="text-red-700 text-xs mt-1">
                      {tMarketplace("tradeRequestsMustBeSentToOthers")}
                    </p>
                  )}
                  {error.includes("maximum") && (
                    <p className="text-red-700 text-xs mt-1">
                      {tMarketplace("maximumPhotos_Product")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* To User Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tMarketplace("toUser")}
            </label>
            <input
              type="text"
              style={{ fontSize: "16px" }}
              name="to_user_display_name"
              value={formData.to_user_display_name}
              onChange={handleChange}
              placeholder={tMarketplace("enterRecipientName")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                isSelfTrade
                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                  : "border-gray-300 focus:ring-green-500"
              }`}
              required
              disabled={loading || uploading}
            />

            {/* Show prefilled info if recipient was auto-filled */}
            {prefilledRecipient &&
              formData.to_user_display_name === prefilledRecipient && (
                <div className="mt-2 flex items-center gap-2 text-green-600 text-xs bg-green-50 p-2 rounded border border-green-200">
                  <span>✓ {tMarketplace("autoFilledWithOwner")}</span>
                </div>
              )}

            {/* Self-trade warning */}
            {isSelfTrade && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded border border-red-200">
                <UserX size={14} />
                <span>{tMarketplace("cannotSendToYourself")}</span>
              </div>
            )}
          </div>

          {/* Trade Title */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tMarketplace("tradeTitle")}
            </label>
            <input
              type="text"
              name="title"
              style={{ fontSize: "16px" }}
              value={formData.title}
              onChange={handleChange}
              placeholder={tMarketplace("tradeTitlePlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={loading || uploading || isSelfTrade}
            />
          </div> */}

          {/* Trade Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tMarketplace("description")}
            </label>
            <textarea
              name="description"
              style={{ fontSize: "16px" }}
              value={formData.description}
              onChange={handleChange}
              placeholder={tMarketplace("describeWhatYouWant")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              required
              disabled={loading || uploading || isSelfTrade}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tMarketplace("uploadImages")} ({t("optional")})
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                isSelfTrade || images.length >= 3
                  ? "border-gray-200 bg-gray-50"
                  : "border-gray-300"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) =>
                  e.target.files && handleImageUpload(e.target.files)
                }
                className="hidden"
                id="image-upload"
                disabled={
                  loading || uploading || isSelfTrade || images.length >= 3
                }
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer font-medium ${
                  loading || uploading || isSelfTrade || images.length >= 3
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-green-600 hover:text-green-700"
                }`}
              >
                {images.length >= 5
                  ? tMarketplace("maximumPhotos_Product")
                  : tMarketplace("clickToUploadImages")}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {tMarketplace("supportedImageFormats")} •{" "}
                {tMarketplace("maximumPhotos_Product")}: 3 •{" "}
                {tMarketplace("currentImages")}: {images.length}/3
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">
                  {tMarketplace("selectedImages")} ({images.length}/3):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={loading || uploading || isSelfTrade}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || uploading}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading || uploading || isSelfTrade}
              className={`flex-1 py-3 px-4 rounded-lg text-white transition-colors font-medium flex items-center justify-center ${
                loading || uploading || isSelfTrade
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0E4123] hover:bg-green-800 "
              }`}
            >
              {loading || uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploading
                    ? tMarketplace("uploading")
                    : tMarketplace("creating")}
                </>
              ) : isSelfTrade ? (
                tMarketplace("cannotTradeWithSelf")
              ) : (
                tMarketplace("createTrade")
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateTradeModal;
