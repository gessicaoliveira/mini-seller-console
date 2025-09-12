import type { LeadStatus, LeadSource } from "../../types";

interface BadgeProps {
  variant: "status" | "source" | "score";
  value: LeadStatus | LeadSource | number;
  className?: string;
}

export function Badge({ variant, value, className }: BadgeProps) {
  const getStatusStyles = (status: LeadStatus) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Contacted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Qualified":
        return "bg-green-100 text-green-800 border-green-200";
      case "Unqualified":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Lost":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSourceStyles = (source: LeadSource) => {
    switch (source) {
      case "Website":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "LinkedIn":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Cold Call":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Referral":
        return "bg-green-100 text-green-800 border-green-200";
      case "Email Campaign":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "Trade Show":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreStyles = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 80) return "bg-blue-100 text-blue-800 border-blue-200";
    if (score >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  let styles = "";
  let displayValue: string | number = value;

  if (variant === "status") {
    styles = getStatusStyles(value as LeadStatus);
  } else if (variant === "source") {
    styles = getSourceStyles(value as LeadSource);
  } else if (variant === "score") {
    styles = getScoreStyles(value as number);
    displayValue = `${value}%`;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${
        className || ""
      }`}
    >
      {displayValue}
    </span>
  );
}
