import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface Step {
  number: number;
  title: string;
  icon: React.ComponentType<any>;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  const { tFarm } = useTranslations();

  return (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10" />
      <div
        className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 -z-10 transition-all duration-300"
        style={{
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
        }}
      />
      {steps.map((step) => {
        const StepIcon = step.icon;
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;

        return (
          <div key={step.number} className="flex flex-col items-center ">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isCompleted
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : isCurrent
                  ? "border-emerald-500 bg-white text-emerald-600"
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <StepIcon className="w-5 h-5" />
              )}
            </div>
            <span
              className={`text-xs mt-2 font-medium text-center ${
                isCurrent || isCompleted ? "text-emerald-600" : "text-gray-500"
              }`}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};
