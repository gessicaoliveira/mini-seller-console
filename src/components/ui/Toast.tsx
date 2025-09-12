import { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const iconColor = type === "success" ? "text-green-600" : "text-red-600";
  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm ${bgColor}`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <p className={`text-sm font-medium ${textColor} flex-1`}>{message}</p>
        <button
          onClick={onClose}
          className={`p-1 hover:bg-black/5 rounded ${textColor}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
