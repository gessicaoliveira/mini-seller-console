import { useState, useEffect, useMemo } from "react";
import { Search, Filter, ArrowUpDown, Users, RefreshCw } from "lucide-react";
import type { Lead, LeadStatus } from "../types";
import { Badge } from "./ui/Badge";
import { EmptyState } from "./ui/EmptyState";
import { ErrorState } from "./ui/ErrorState";
import { SkeletonLoader } from "./ui/SkeletonLoader";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { api } from "../utils/api";
import { formatDateTime } from "../utils/validation";

interface LeadsListProps {
  onLeadSelect?: (lead: Lead) => void;
  selectedLeadId?: string;
  onLeadsLoad?: (leads: Lead[]) => void;
  leads?: Lead[];
}

interface FilterState {
  search: string;
  status: LeadStatus | "All";
  sortBy: "score" | "name" | "company" | "createdAt";
  sortOrder: "asc" | "desc";
}

export function LeadsList({
  onLeadSelect,
  selectedLeadId,
  onLeadsLoad,
  leads: externalLeads,
}: LeadsListProps) {
  const [leads, setLeads] = useState<Lead[]>(externalLeads || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useLocalStorage<FilterState>("leads-filters", {
    search: "",
    status: "All",
    sortBy: "score",
    sortOrder: "desc",
  });

  useEffect(() => {
    if (!externalLeads || externalLeads.length === 0) {
      loadLeads();
    } else {
      setLeads(externalLeads);
      setLoading(false);
    }
  }, [externalLeads]);

  const loadLeads = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await api.getLeads();
      setLeads(data);
      onLeadsLoad?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadLeads(true);
  };

  useEffect(() => {
    if (externalLeads && externalLeads.length > 0) {
      setLeads(externalLeads);
    }
  }, [externalLeads]);

  const filteredLeads = useMemo(() => {
    let filtered = leads;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchLower) ||
          lead.company.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== "All") {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case "score":
          aValue = a.score;
          bValue = b.score;
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "company":
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, filters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSort = (sortBy: FilterState["sortBy"]) => {
    if (filters.sortBy === sortBy) {
      updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc");
    } else {
      updateFilter("sortBy", sortBy);
      updateFilter("sortOrder", "desc");
    }
  };

  const getSortIcon = (column: FilterState["sortBy"]) => {
    if (filters.sortBy !== column)
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return (
      <ArrowUpDown
        className={`w-4 h-4 ${
          filters.sortOrder === "desc" ? "rotate-180" : ""
        } text-primary-600 transition-transform`}
      />
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mt-2 animate-pulse"></div>
          </div>
        </div>
        <SkeletonLoader rows={8} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => loadLeads()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh leads"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-500 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
          <p className="text-gray-600">
            {filteredLeads.length} of {leads.length} leads
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>
              Qualified: {leads.filter((l) => l.status === "Qualified").length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>New: {leads.filter((l) => l.status === "New").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>
              Contacted: {leads.filter((l) => l.status === "Contacted").length}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or company..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filters.status}
                onChange={(e) =>
                  updateFilter("status", e.target.value as LeadStatus | "All")
                }
                className="input-field pl-10 w-full appearance-none bg-white"
              >
                <option value="All">All Status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Unqualified">Unqualified</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>
        </div>

        {(filters.search || filters.status !== "All") && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{filters.search}"
              </span>
            )}
            {filters.status !== "All" && (
              <Badge
                variant="status"
                value={filters.status}
                className="text-xs"
              />
            )}
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  status: "All",
                  sortBy: "score",
                  sortOrder: "desc",
                })
              }
              className="text-xs text-primary-600 hover:text-primary-700 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-gray-400" />}
          title="No leads found"
          description={
            filters.search || filters.status !== "All"
              ? "Try adjusting your filters to see more results."
              : "No leads available at the moment."
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="block sm:hidden">
            <div className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onLeadSelect?.(lead)}
                  className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedLeadId === lead.id
                      ? "bg-primary-50 border-l-4 border-l-primary-500"
                      : ""
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                          {lead.name}
                        </h3>
                        <p className="text-base text-gray-600 mt-1">
                          {lead.company}
                        </p>
                      </div>
                      <Badge variant="score" value={lead.score} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 break-all">
                        {lead.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(lead.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Badge variant="status" value={lead.status} />
                      <Badge variant="source" value={lead.source} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden sm:block overflow-x-auto h-[calc(100vh-380px)] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name {getSortIcon("name")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort("company")}
                  >
                    <div className="flex items-center gap-2">
                      Company {getSortIcon("company")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort("score")}
                  >
                    <div className="flex items-center gap-2">
                      Score {getSortIcon("score")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      Created {getSortIcon("createdAt")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onLeadSelect?.(lead)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedLeadId === lead.id
                        ? "bg-primary-50 border-l-4 border-l-primary-500"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {lead.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="source" value={lead.source} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="score" value={lead.score} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="status" value={lead.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
