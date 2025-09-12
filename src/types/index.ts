export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  source:
    | "Website"
    | "LinkedIn"
    | "Cold Call"
    | "Referral"
    | "Email Campaign"
    | "Trade Show";
  score: number; // 0-100
  status: "New" | "Contacted" | "Qualified" | "Unqualified" | "Lost";
  createdAt: string;
  lastActivity?: string;
}

export interface Opportunity {
  id: string;
  name: string;
  stage:
    | "Prospecting"
    | "Qualification"
    | "Proposal"
    | "Negotiation"
    | "Closed Won"
    | "Closed Lost";
  amount?: number;
  accountName: string;
  createdAt: string;
  leadId: string; // Reference to original lead
}

export type LeadStatus = Lead["status"];
export type LeadSource = Lead["source"];
export type OpportunityStage = Opportunity["stage"];
