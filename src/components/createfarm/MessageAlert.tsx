import { CheckCircle2, Award } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface MessageAlertProps {
  message: {
    text: string;
    type: "error" | "success" | "info";
  };
}

export const MessageAlert = ({ message }: MessageAlertProps) => {
  const { t } = useTranslations();

  if (!message.text) return null;

  const alertStyles = {
    error: "bg-red-50 text-red-700 border border-red-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 mr-2" />,
    info: <Award className="w-5 h-5 mr-2" />,
    error: null,
  };

  return (
    <div className={`m-6 p-4 rounded-xl ${alertStyles[message.type]}`}>
      <div className="flex items-center">
        {icons[message.type]}
        {message.text}
      </div>
    </div>
  );
};
