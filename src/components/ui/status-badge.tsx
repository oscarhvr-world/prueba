import { cn } from "@/lib/utils/cn";

type StatusBadgeVariant =
  | "identified"
  | "validated"
  | "prioritized"
  | "in_progress"
  | "done"
  | "discarded"
  | "draft"
  | "ready"
  | "blocked"
  | "active"
  | "archived";

const statusConfig: Record<
  StatusBadgeVariant,
  { label: string; className: string }
> = {
  identified: {
    label: "Identified",
    className: "border-slate-600 bg-slate-800 text-slate-300",
  },
  validated: {
    label: "Validated",
    className: "border-blue-800 bg-blue-900/30 text-blue-300",
  },
  prioritized: {
    label: "Prioritized",
    className: "border-purple-800 bg-purple-900/30 text-purple-300",
  },
  in_progress: {
    label: "In Progress",
    className: "border-yellow-800 bg-yellow-900/30 text-yellow-300",
  },
  done: {
    label: "Done",
    className: "border-green-800 bg-green-900/30 text-green-300",
  },
  discarded: {
    label: "Discarded",
    className: "border-red-900 bg-red-950 text-red-400",
  },
  draft: {
    label: "Draft",
    className: "border-slate-600 bg-slate-800 text-slate-300",
  },
  ready: {
    label: "Ready",
    className: "border-blue-800 bg-blue-900/30 text-blue-300",
  },
  blocked: {
    label: "Blocked",
    className: "border-red-800 bg-red-900/30 text-red-300",
  },
  active: {
    label: "Active",
    className: "border-green-800 bg-green-900/30 text-green-300",
  },
  archived: {
    label: "Archived",
    className: "border-slate-700 bg-slate-800/50 text-slate-500",
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusBadgeVariant] || {
    label: status,
    className: "border-slate-600 bg-slate-800 text-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const labels: Record<string, string> = {
    automation: "Automation",
    acquisition: "Acquisition",
    sales: "Sales",
    reporting: "Reporting",
    operations: "Operations",
    internal_control: "Internal Control",
    content: "Content",
    digital_presence: "Digital Presence",
    digital_product: "Digital Product",
    service: "Service",
  };

  return (
    <span className="inline-flex items-center rounded-md border border-indigo-800 bg-indigo-900/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
      {labels[category] || category}
    </span>
  );
}
