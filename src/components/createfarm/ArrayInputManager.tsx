import { X } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface ArrayInputManagerProps {
  label: string;
  items: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAddItem: (value: string) => void;
  onRemoveItem: (index: number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  badgeColor?: string;
  textColor?: string;
}

export const ArrayInputManager = ({
  label,
  items,
  inputValue,
  onInputChange,
  onAddItem,
  onRemoveItem,
  placeholder,
  error,
  required = false,
  badgeColor = "bg-emerald-100",
  textColor = "text-emerald-800",
}: ArrayInputManagerProps) => {
  const { t, tFarm } = useTranslations();

  const handleAdd = () => {
    onAddItem(inputValue);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label} {required && `*`}
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
        >
          {tFarm("addItem")}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className={`${badgeColor} ${textColor} px-3 py-1 rounded-full text-sm flex items-center`}
          >
            {item}
            <button
              type="button"
              onClick={() => onRemoveItem(index)}
              className={`ml-2 ${textColor.replace(
                "text-",
                "text-"
              )} hover:opacity-70`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
