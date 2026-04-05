import { cn } from "@/lib/utils/cn";
import { getScoreLabel, getScoreBgColor } from "@/lib/utils/scoring";

interface ScoreIndicatorProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function ScoreIndicator({
  score,
  showLabel = true,
  className,
}: ScoreIndicatorProps) {
  const label = getScoreLabel(score);
  const colorClass = getScoreBgColor(score);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tabular-nums",
          colorClass
        )}
      >
        {score.toFixed(1)}
      </span>
      {showLabel && (
        <span className="text-xs text-slate-500">{label}</span>
      )}
    </div>
  );
}

interface ScoreBarProps {
  value: number;
  max?: number;
  label: string;
  color?: string;
}

export function ScoreBar({ value, max = 10, label, color = "bg-blue-500" }: ScoreBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-medium text-slate-300">{value}/{max}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800">
        <div
          className={cn("h-1.5 rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
