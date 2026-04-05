import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, List } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

const priorityColors: Record<string, string> = {
  critical: "border-red-800 bg-red-900/30 text-red-300",
  high: "border-orange-800 bg-orange-900/30 text-orange-300",
  medium: "border-yellow-800 bg-yellow-900/30 text-yellow-300",
  low: "border-slate-700 bg-slate-800 text-slate-400",
};

const effortLabels: Record<string, string> = {
  xs: "XS",
  s: "S",
  m: "M",
  l: "L",
  xl: "XL",
};

export default async function BacklogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userContextIds = await prisma.context.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const userOpportunityIds = await prisma.opportunity.findMany({
    where: { contextId: { in: userContextIds.map((c) => c.id) } },
    select: { id: true },
  });

  const items = await prisma.backlogItem.findMany({
    where: {
      opportunityId: { in: userOpportunityIds.map((o) => o.id) },
    },
    include: {
      opportunity: {
        select: { id: true, title: true, context: { select: { name: true } } },
      },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col">
      <Header
        title="Backlog"
        description="Development backlog items across all contexts"
        actions={
          <Link href="/backlog/new">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" />
              New Item
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <List className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              Backlog is empty
            </h3>
            <p className="text-sm text-slate-500 mb-4 max-w-sm">
              Add backlog items from opportunities or create them directly.
            </p>
            <Link href="/backlog/new">
              <Button variant="primary">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Effort
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Opportunity
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-slate-200">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 capitalize">
                      {item.type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${
                          priorityColors[item.priority] || ""
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.effort ? (
                        <span className="inline-flex items-center rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300">
                          {effortLabels[item.effort] || item.effort}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      {item.opportunity ? (
                        <Link
                          href={`/opportunities/${item.opportunity.id}`}
                          className="text-xs text-blue-400 hover:text-blue-300 line-clamp-1"
                        >
                          {item.opportunity.title}
                        </Link>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
