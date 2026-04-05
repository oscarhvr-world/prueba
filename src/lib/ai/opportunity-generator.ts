// TODO: Replace mock with OpenAI Responses API call
// Interface is ready - just swap the implementation

import type { ContextInput } from "./types";

export interface GeneratedOpportunity {
  title: string;
  description: string;
  category: string;
  impact: number;
  effort: number;
  urgency: number;
  confidence: number;
  pain: number;
  painResolved: string;
  valueType: string;
  solutionProposal: string;
}

export async function generateOpportunitiesFromContext(
  context: ContextInput
): Promise<GeneratedOpportunity[]> {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      title: `Automatizar reportes de ${context.name}`,
      description: `Identificada oportunidad de automatización en los procesos de reporting para ${context.mainActivity}`,
      category: "reporting",
      impact: 7,
      effort: 4,
      urgency: 6,
      confidence: 8,
      pain: 7,
      painResolved: "Tiempo dedicado a reportes manuales, errores humanos",
      valueType: "time_saving",
      solutionProposal: "Dashboard automatizado con integración a fuentes de datos existentes",
    },
  ];
}
