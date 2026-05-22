"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  TradeRequest,
  tradeApi,
  UpdateTradeRequest,
  uploadImage,
} from "../../../lib/api/trade";
import { useTranslations } from "../../../lib/i18n";

interface EditTradeModalProps {
  tradeRequest: TradeRequest;
  isOpen: boolean;
  onClose: () => void;
  onTradeUpdated: () => void;
}

const EditTradeModal: React.FC<EditTradeModalProps> = ({
  tradeRequest,
  isOpen,
  onClose,
  onTradeUpdated,
}) => {
  const { t, tMarketplace } = useTranslations();
  const [formData, setFormData] = useState({
    title: tradeRequest.title,
    description: tradeRequest.description,
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    tradeRequest.image_urls || []
  );
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: tradeRequest.title,
        description: tradeRequest.description,
      });
      setExistingImages(tradeRequest.image_urls || []);
      setNewImages([]);
      setNewImagePreviews([]);
      setError(null);
    }
  }, [isOpen, tradeRequest]);

  const handleNewImageUpload = async (files: FileList) => {
    const newImageFiles = Array.from(files);
    const validImages = newImageFiles.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isValidType || !isValidSize) return false;
      return true;
    });
    if (validImages.length === 0) return;
    const newPreviews = validImages.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
    setNewImages((prev) => [...prev, ...validImages]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return [];
    setUploading(true);
    try {
      const uploadPromises = newImages.map((file) => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError(tMarketplace("completeAllRequiredFields"));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const newImageUrls = await uploadNewImages();
      const allImageUrls = [...existingImages, ...newImageUrls];

      const updates: UpdateTradeRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image_urls: allImageUrls,
      };

      await tradeApi.updateTradeRequest(tradeRequest.id, updates);
      onTradeUpdated();
      onClose();
    } catch (err) {
      setError(tMarketplace("tradeUpdateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleClose = () => {
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center font-[kantumruy_Pro] justify-center z-50 p-2 sm:p-4"
      onClick={handleClose} // Close when clicking on backdrop
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {tMarketplace("editTradeRequest")}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Title */}
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
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
              disabled={loading || uploading}
            />
          </div> */}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tMarketplace("description")}
            </label>
            <textarea
              name="description"
              value={formData.description}
              style={{ fontSize: "16px" }}
              onChange={handleChange}
              placeholder={tMarketplace("describeWhatYouWant")}
              rows={4}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
              required
              disabled={loading || uploading}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tMarketplace("images")} ({t("optional")})
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {tMarketplace("currentImages")}:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`${tMarketplace("existingImage")} ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        disabled={loading || uploading}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Images */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) =>
                  e.target.files && handleNewImageUpload(e.target.files)
                }
                className="hidden"
                id="new-image-upload"
                disabled={loading || uploading}
              />
              <label
                htmlFor="new-image-upload"
                className={`cursor-pointer font-medium ${
                  loading || uploading
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-green-600 hover:text-green-700"
                }`}
              >
                {tMarketplace("addMoreImages")}
              </label>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {tMarketplace("supportedImageFormats")}
              </p>
            </div>

            {/* New Previews */}
            {newImagePreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">
                  {tMarketplace("newImagesToAdd")}:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`${tMarketplace("newImage")} ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        disabled={loading || uploading}
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || uploading}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition font-medium"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 py-3 px-4 bg-[#0E4123] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium flex items-center justify-center"
            >
              {loading || uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploading
                    ? tMarketplace("uploading")
                    : tMarketplace("updating")}
                </>
              ) : (
                tMarketplace("updateTrade")
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditTradeModal;
