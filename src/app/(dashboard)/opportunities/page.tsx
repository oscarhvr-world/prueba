import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Lightbulb } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { StatusBadge, CategoryBadge } from "@/components/ui/status-badge";
import { ScoreIndicator } from "@/components/ui/score-indicator";

export default async function OpportunitiesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const opportunities = await prisma.opportunity.findMany({
    where: { context: { userId: session.user.id } },
    include: {
      context: { select: { name: true } },
      _count: { select: { backlogItems: true } },
      mvpSpec: { select: { id: true } },
    },
    orderBy: { priorityScore: "desc" },
  });

  return (
    <div className="flex flex-col">
      <Header
        title="Opportunities"
        description="All identified opportunities, sorted by priority score"
        actions={
          <Link href="/opportunities/new">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" />
              New Opportunity
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Lightbulb className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No opportunities yet
            </h3>
            <p className="text-sm text-slate-500 mb-4 max-w-sm">
              Identify opportunities from your contexts to build your
              prioritized backlog.
            </p>
            <Link href="/opportunities/new">
              <Button variant="primary">
                <Plus className="h-4 w-4" />
                Add Opportunity
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Opportunity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Context
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Backlog
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Spec
                  </th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <Link
                        href={`/opportunities/${opp.id}`}
                        className="font-medium text-slate-200 hover:text-blue-400 transition-colors line-clamp-2"
                      >
                        {opp.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {opp.context.name}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={opp.category} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreIndicator score={opp.priorityScore} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={opp.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {opp._count.backlogItems}
                    </td>
                    <td className="px-4 py-3">
                      {opp.mvpSpec ? (
                        <Link href={`/specs/${opp.mvpSpec.id}`}>
                          <span className="text-xs text-blue-400 hover:text-blue-300">
                            View spec
                          </span>
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
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
