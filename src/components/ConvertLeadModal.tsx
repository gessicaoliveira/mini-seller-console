import { useEffect, useState } from "react";
import { X, TrendingUp, DollarSign, Building, AlertCircle } from "lucide-react";
import type { Lead, Opportunity, OpportunityStage } from "../types";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { api } from "../utils/api";
import { validateRequired } from "../utils/validation";

interface ConvertLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onConvert: (opportunity: Opportunity) => void;
}

interface ConversionForm {
  name: string;
  stage: OpportunityStage;
  amount: string;
  accountName: string;
}

export function ConvertLeadModal({
  lead,
  isOpen,
  onClose,
  onConvert,
}: ConvertLeadModalProps) {
  const [form, setForm] = useState<ConversionForm>({
    name: "",
    stage: "" as OpportunityStage,
    amount: "",
    accountName: "",
  });
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lead && isOpen) {
      setForm({
        name: lead.name,
        stage: "" as OpportunityStage,
        amount: "",
        accountName: lead.company,
      });
      setError(null);
      setFieldErrors({});
    }
  }, [lead, isOpen]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateRequired(form.name)) {
      errors.name = "Opportunity name is required";
    }

    if (!validateRequired(form.stage)) {
      errors.stage = "Stage is required";
    }

    if (!validateRequired(form.accountName)) {
      errors.accountName = "Account name is required";
    }

    if (form.amount && isNaN(Number(form.amount))) {
      errors.amount = "Amount must be a valid number";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lead || !validateForm()) return;

    try {
      setIsConverting(true);
      setError(null);

      const opportunity = await api.createOpportunity({
        name: form.name,
        stage: form.stage,
        amount: form.amount ? Number(form.amount) : undefined,
        accountName: form.accountName,
        leadId: lead.id,
      });

      setForm({
        name: "",
        stage: "" as OpportunityStage,
        amount: "",
        accountName: "",
      });
      setError(null);
      setFieldErrors({});

      onConvert(opportunity);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert lead");
    } finally {
      setIsConverting(false);
    }
  };

  const updateForm = (field: keyof ConversionForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Convert Lead
                </h2>
                <p className="text-sm text-gray-500">
                  Create opportunity from {lead.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Opportunity Name *
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                className={`input-field ${
                  fieldErrors.name
                    ? "border-red-300 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="Enter opportunity name"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="accountName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Account Name *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="accountName"
                  type="text"
                  value={form.accountName}
                  onChange={(e) => updateForm("accountName", e.target.value)}
                  className={`input-field pl-10 ${
                    fieldErrors.accountName
                      ? "border-red-300 focus-visible:ring-red-500"
                      : ""
                  }`}
                  placeholder="Enter account name"
                />
              </div>
              {fieldErrors.accountName && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.accountName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="stage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Stage *
              </label>
              <select
                id="stage"
                value={form.stage}
                onChange={(e) => updateForm("stage", e.target.value)}
                className={`select-field ${
                  fieldErrors.stage
                    ? "border-red-300 focus-visible:ring-red-500"
                    : ""
                }`}
              >
                <option value="">Select stage</option>
                <option value="Prospecting">Prospecting</option>
                <option value="Qualification">Qualification</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
              {fieldErrors.stage && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.stage}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => updateForm("amount", e.target.value)}
                  className={`input-field pl-10 ${
                    fieldErrors.amount
                      ? "border-red-300 focus-visible:ring-red-500"
                      : ""
                  }`}
                  placeholder="0.00"
                />
              </div>
              {fieldErrors.amount && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.amount}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isConverting}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Converting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Convert to Opportunity
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isConverting}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
