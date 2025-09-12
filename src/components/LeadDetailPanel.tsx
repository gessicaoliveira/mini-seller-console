import { useState, useEffect } from "react";
import {
  X,
  Edit2,
  Check,
  AlertCircle,
  User,
  Building,
  Mail,
  Calendar,
  Target,
  Activity,
  TrendingUp,
} from "lucide-react";
import type { Lead, LeadStatus } from "../types";
import { Badge } from "./ui/Badge";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { api } from "../utils/api";
import { validateEmail, formatDateTime } from "../utils/validation";

interface LeadDetailPanelProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdate: (updatedLead: Lead) => void;
}

interface EditState {
  status: LeadStatus;
  email: string;
}

export function LeadDetailPanel({
  lead,
  isOpen,
  onClose,
  onLeadUpdate,
}: LeadDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<EditState>({
    status: "New",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setEditState({
        status: lead.status,
        email: lead.email,
      });
      setIsEditing(false);
      setError(null);
      setEmailError(null);
    }
  }, [lead]);

  useEffect(() => {
    if (editState.email && !validateEmail(editState.email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError(null);
    }
  }, [editState.email]);

  const handleSave = async () => {
    if (!lead) return;

    if (!validateEmail(editState.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const optimisticLead = {
        ...lead,
        status: editState.status,
        email: editState.email,
        lastActivity: new Date().toISOString(),
      };
      onLeadUpdate(optimisticLead);
      setIsEditing(false);

      const updatedLead = await api.updateLead(lead.id, {
        status: editState.status,
        email: editState.email,
        lastActivity: new Date().toISOString(),
      });

      onLeadUpdate(updatedLead);
    } catch (err) {
      onLeadUpdate(lead);
      setEditState({
        status: lead.status,
        email: lead.email,
      });
      setIsEditing(true);
      setError(err instanceof Error ? err.message : "Failed to update lead");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (lead) {
      setEditState({
        status: lead.status,
        email: lead.email,
      });
    }
    setIsEditing(false);
    setError(null);
    setEmailError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (isEditing) {
        handleCancel();
      } else {
        onClose();
      }
    }
    if (e.key === "Enter" && e.ctrlKey && isEditing) {
      handleSave();
    }
  };

  const canConvert =
    lead && (lead.status === "Qualified" || lead.status === "Contacted");

  if (!isOpen || !lead) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md sm:max-w-lg bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lead Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close panel"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {lead.name}
                  </h3>
                  <p className="text-sm text-gray-500">Lead ID: {lead.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Company
                    </p>
                    <p className="font-medium text-gray-900 truncate">
                      {lead.company}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Email
                    </p>
                    {isEditing ? (
                      <div>
                        <input
                          type="email"
                          value={editState.email}
                          onChange={(e) =>
                            setEditState((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className={`mt-1 block w-full px-3 py-1 border rounded-md text-sm ${
                            emailError
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-primary-500"
                          } focus:outline-none focus:ring-2`}
                          placeholder="Enter email address"
                        />
                        {emailError && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{emailError}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium text-gray-900 truncate">
                        {lead.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Source
                    </p>
                    <div className="mt-1">
                      <Badge variant="source" value={lead.source} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Activity className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Score
                    </p>
                    <div className="mt-1">
                      <Badge variant="score" value={lead.score} />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-4 h-4 rounded-full bg-primary-500 flex-shrink-0 mt-0.5"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Status
                    </p>
                    {isEditing ? (
                      <select
                        value={editState.status}
                        onChange={(e) =>
                          setEditState((prev) => ({
                            ...prev,
                            status: e.target.value as LeadStatus,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Unqualified">Unqualified</option>
                        <option value="Lost">Lost</option>
                      </select>
                    ) : (
                      <div className="mt-1">
                        <Badge variant="status" value={lead.status} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Created
                    </p>
                    <p className="font-medium text-gray-900 text-sm">
                      {formatDateTime(lead.createdAt)}
                    </p>
                  </div>
                </div>

                {lead.lastActivity && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Last Activity
                      </p>
                      <p className="font-medium text-gray-900 text-sm">
                        {formatDateTime(lead.lastActivity)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 sm:p-6 space-y-3">
            {canConvert && !isEditing && (
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Convert to Opportunity
              </button>
            )}

            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !!emailError}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Lead
              </button>
            )}

            <div className="text-xs text-gray-500 text-center">
              {isEditing
                ? "Press Ctrl+Enter to save, Esc to cancel"
                : "Press Esc to close"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
