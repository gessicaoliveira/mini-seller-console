import {
  TrendingUp,
  DollarSign,
  Calendar,
  Building,
  Target,
} from "lucide-react";
import type { Opportunity, OpportunityStage } from "../types";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { EmptyState } from "./ui/EmptyState";
import { ErrorState } from "./ui/ErrorState";
import { formatDateTime } from "../utils/validation";

interface OpportunitiesListProps {
  opportunities: Opportunity[];
  loading?: boolean;
  error?: string | null;
}

export function OpportunitiesList({
  opportunities,
  loading = false,
  error = null,
}: OpportunitiesListProps) {
  const getStageStyles = (stage: OpportunityStage) => {
    switch (stage) {
      case "Prospecting":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Qualification":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Proposal":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Negotiation":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Closed Won":
        return "bg-green-100 text-green-800 border-green-200";
      case "Closed Lost":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getTotalValue = () => {
    return opportunities
      .filter((opp) => opp.amount && opp.stage !== "Closed Lost")
      .reduce((sum, opp) => sum + (opp.amount || 0), 0);
  };

  const getWonValue = () => {
    return opportunities
      .filter((opp) => opp.amount && opp.stage === "Closed Won")
      .reduce((sum, opp) => sum + (opp.amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading opportunities...</span>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center px-6 py-4">
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              {formatCurrency(getWonValue())}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">Won</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-primary-600">
              {formatCurrency(getTotalValue())}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">Pipeline</p>
          </div>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-6 h-6 text-gray-400" />}
          title="No opportunities yet"
          description="Convert leads to opportunities to start building your sales pipeline."
        />
      ) : (
        <>
          <div className="block md:hidden space-y-3">
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mx-4 sm:mx-0"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {opportunity.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          ID: {opportunity.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStageStyles(
                        opportunity.stage
                      )}`}
                    >
                      {opportunity.stage}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {opportunity.accountName}
                      </p>
                      <p className="text-xs text-gray-500">Account</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {formatCurrency(opportunity.amount)}
                        </p>
                        <p className="text-xs text-gray-500">Amount</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900">
                          {formatDateTime(opportunity.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">Created</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto h-[calc(100vh-320px)] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opportunity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.map((opportunity) => (
                    <tr
                      key={opportunity.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Target className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {opportunity.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {opportunity.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <div className="text-sm text-gray-900">
                            {opportunity.accountName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStageStyles(
                            opportunity.stage
                          )}`}
                        >
                          {opportunity.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(opportunity.amount)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div className="text-sm text-gray-500">
                            {formatDateTime(opportunity.createdAt)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
