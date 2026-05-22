import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  loading?: boolean;
  uploading?: boolean;
  onPrevious: () => void;
  onNext?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  isLastStep?: boolean;
}

export const NavigationButtons = ({
  currentStep,
  totalSteps,
  loading = false,
  uploading = false,
  onPrevious,
  onNext,
  onSubmit,
  isLastStep = false,
}: NavigationButtonsProps) => {
  const { t, tFarm } = useTranslations();

  return (
    <div className="flex justify-between pt-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{t("back")}</span>
      </button>

      {isLastStep ? (
        <button
          type="submit"
          onClick={onSubmit}
          disabled={loading || uploading}
          className="px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-emerald-500/25"
        >
          {loading || uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {uploading ? `${t("uploading")}...` : `${t("creating")}...`}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{tFarm("createFarm")}</span>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-emerald-500/25"
        >
          <span>{t("next")}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
