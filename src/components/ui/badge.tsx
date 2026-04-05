import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-slate-700 bg-slate-800 text-slate-300",
        primary: "border-blue-800 bg-blue-900/30 text-blue-300",
        secondary: "border-slate-600 bg-slate-700 text-slate-200",
        destructive: "border-red-800 bg-red-900/30 text-red-300",
        outline: "border-slate-600 text-slate-400",
        success: "border-green-800 bg-green-900/30 text-green-300",
        warning: "border-yellow-800 bg-yellow-900/30 text-yellow-300",
        purple: "border-purple-800 bg-purple-900/30 text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
