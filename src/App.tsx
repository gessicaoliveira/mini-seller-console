import { useState } from "react";
import { LeadsList } from "./components/LeadsList";
import { LeadDetailPanel } from "./components/LeadDetailPanel";
import { ConvertLeadModal } from "./components/ConvertLeadModal";
import { OpportunitiesList } from "./components/OpportunitiesList";
import { Toast } from "./components/ui/Toast";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useToast } from "./hooks/useToast";
import type { Lead, Opportunity } from "./types";

function App() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [opportunities, setOpportunities] = useLocalStorage<Opportunity[]>(
    "opportunities",
    []
  );
  const [activeTab, setActiveTab] = useState<"leads" | "opportunities">(
    "leads"
  );
  const { toast, showToast, hideToast } = useToast();

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
    );
    setSelectedLead(updatedLead);
  };

  const handleLeadsLoad = (loadedLeads: Lead[]) => {
    setLeads(loadedLeads);
  };

  const handleConvertLead = (lead: Lead) => {
    setConvertingLead(lead);
  };

  const handleOpportunityCreated = (opportunity: Opportunity) => {
    setOpportunities((prev) => [opportunity, ...prev]);
    setConvertingLead(null);
    setSelectedLead(null);
    showToast(
      `Successfully converted ${opportunity.name} to opportunity!`,
      "success"
    );

    const leadToUpdate = leads.find((l) => l.id === opportunity.leadId);
    if (leadToUpdate) {
      const updatedLead = { ...leadToUpdate, status: "Qualified" as const };
      handleLeadUpdate(updatedLead);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Mini Seller Console
            </h1>
            <div className="text-sm text-gray-500">Lead Management System</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("leads")}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "leads"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Leads ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "opportunities"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Opportunities ({opportunities.length})
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "leads" ? (
          <LeadsList
            onLeadSelect={setSelectedLead}
            selectedLeadId={selectedLead?.id}
            onLeadsLoad={handleLeadsLoad}
            leads={leads}
          />
        ) : (
          <OpportunitiesList opportunities={opportunities} />
        )}
      </main>

      <LeadDetailPanel
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdate={handleLeadUpdate}
        onConvertLead={handleConvertLead}
      />

      <ConvertLeadModal
        lead={convertingLead}
        isOpen={!!convertingLead}
        onClose={() => setConvertingLead(null)}
        onConvert={handleOpportunityCreated}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;
