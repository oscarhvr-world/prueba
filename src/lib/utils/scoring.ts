export interface ScoringWeights {
  impactWeight: number;
  urgencyWeight: number;
  confidenceWeight: number;
  painWeight: number;
  effortWeight: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  impactWeight: 0.35,
  urgencyWeight: 0.20,
  confidenceWeight: 0.15,
  painWeight: 0.20,
  effortWeight: 0.10,
};

export function calculatePriorityScore(
  impact: number,
  urgency: number,
  confidence: number,
  pain: number,
  effort: number,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  const score =
    impact * weights.impactWeight +
    urgency * weights.urgencyWeight +
    confidence * weights.confidenceWeight +
    pain * weights.painWeight -
    effort * weights.effortWeight;

  return Math.round(score * 100) / 100;
}

export function getScoreLabel(score: number): string {
  if (score >= 8) return "Critical";
  if (score >= 6) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

export function getScoreColor(score: number): string {
  if (score >= 8) return "text-red-400";
  if (score >= 6) return "text-orange-400";
  if (score >= 4) return "text-yellow-400";
  return "text-slate-400";
}

export function getScoreBgColor(score: number): string {
  if (score >= 8) return "bg-red-900/30 text-red-300 border-red-800";
  if (score >= 6) return "bg-orange-900/30 text-orange-300 border-orange-800";
  if (score >= 4) return "bg-yellow-900/30 text-yellow-300 border-yellow-800";
  return "bg-slate-800 text-slate-400 border-slate-700";
}
