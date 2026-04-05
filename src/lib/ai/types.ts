export interface MvpSpecData {
  problem: string;
  targetUser: string;
  mvpObjective: string;
  scope: string;
  outOfScope?: string;
  features: string[];
  mainFlow: string;
  requiredData?: string;
  metrics?: string;
  risks?: string;
  assumptions?: string;
  suggestedStack?: string;
  nextIteration?: string;
  markdownContent: string;
  generatedBy: "mock" | "openai";
}

export interface OpportunityInput {
  id: string;
  title: string;
  description: string;
  category: string;
  solutionProposal?: string | null;
  painResolved?: string | null;
  valueType?: string | null;
  affectedChannel?: string | null;
}

export interface ContextInput {
  name: string;
  mainActivity?: string | null;
  sector?: string | null;
  userType?: string | null;
  city?: string | null;
  technicalLevel?: string | null;
  objectives?: string | null;
}
