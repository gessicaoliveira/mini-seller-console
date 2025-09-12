import type { Lead, Opportunity } from "../types";
import leadsData from "../data/leads.json";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldFail = () => Math.random() < 0.1;

export const api = {
  // Leads API
  async getLeads(): Promise<Lead[]> {
    await delay(800); // Simulate network latency

    if (shouldFail()) {
      throw new Error("Failed to fetch leads. Please try again.");
    }

    return leadsData as Lead[];
  },

  async updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead> {
    await delay(500);

    if (shouldFail()) {
      throw new Error("Failed to update lead. Please try again.");
    }

    const leads = leadsData as Lead[];
    const leadIndex = leads.findIndex((lead) => lead.id === leadId);

    if (leadIndex === -1) {
      throw new Error("Lead not found");
    }

    const updatedLead = { ...leads[leadIndex], ...updates };
    return updatedLead;
  },

  async createOpportunity(
    opportunity: Omit<Opportunity, "id" | "createdAt">
  ): Promise<Opportunity> {
    await delay(600);

    if (shouldFail()) {
      throw new Error("Failed to create opportunity. Please try again.");
    }

    const newOpportunity: Opportunity = {
      ...opportunity,
      id: `opp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    return newOpportunity;
  },

  async getOpportunities(): Promise<Opportunity[]> {
    await delay(400);

    if (shouldFail()) {
      throw new Error("Failed to fetch opportunities. Please try again.");
    }

    return [];
  },
};
