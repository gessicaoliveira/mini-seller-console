import { useState } from "react";
import { LeadsList } from "./components/LeadsList";
import { LeadDetailPanel } from "./components/LeadDetailPanel";
import { Toast } from "./components/ui/Toast";

import { useToast } from "./hooks/useToast";
import type { Lead } from "./types";

function App() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const { toast, showToast, hideToast } = useToast();

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
    );
    setSelectedLead(updatedLead);
    showToast(`Lead ${updatedLead.name} atualizado com sucesso!`, "success");
  };

  const handleLeadsLoad = (loadedLeads: Lead[]) => {
    setLeads(loadedLeads);
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <LeadsList
          onLeadSelect={setSelectedLead}
          selectedLeadId={selectedLead?.id}
          onLeadsLoad={handleLeadsLoad}
          leads={leads}
        />
      </main>

      <LeadDetailPanel
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdate={handleLeadUpdate}
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
