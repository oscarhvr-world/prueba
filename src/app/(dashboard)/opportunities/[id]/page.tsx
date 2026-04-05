import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, CategoryBadge } from "@/components/ui/status-badge";
import { ScoreIndicator, ScoreBar } from "@/components/ui/score-indicator";
import { GenerateSpecButton } from "@/components/opportunities/generate-spec-button";

interface PageProps {
  params: { id: string };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const opportunity = await prisma.opportunity.findFirst({
    where: { id: params.id, context: { userId: session.user.id } },
    include: {
      context: { select: { id: true, name: true } },
      backlogItems: { orderBy: { createdAt: "asc" } },
      mvpSpec: { select: { id: true } },
    },
  });

  if (!opportunity) notFound();

  const valueTypeLabels: Record<string, string> = {
    time_saving: "Time Saving",
    revenue: "Revenue",
    cost_reduction: "Cost Reduction",
    risk_reduction: "Risk Reduction",
    quality: "Quality",
    visibility: "Visibility",
  };

  return (
    <div className="flex flex-col">
      <Header
        title={opportunity.title}
        description={opportunity.context.name}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={opportunity.status} />
            <CategoryBadge category={opportunity.category} />
          </div>
        }
      />

      <div className="p-6 space-y-6">
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to opportunities
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {opportunity.description}
                </p>
                {opportunity.painResolved && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                      Pain Resolved
                    </h4>
                    <p className="text-sm text-slate-400">{opportunity.painResolved}</p>
                  </div>
                )}
                {opportunity.solutionProposal && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                      Solution Proposal
                    </h4>
                    <p className="text-sm text-slate-400">{opportunity.solutionProposal}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MVP Spec */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">MVP Specification</CardTitle>
                  {!opportunity.mvpSpec ? (
                    <GenerateSpecButton opportunityId={opportunity.id} />
                  ) : (
                    <Link href={`/specs/${opportunity.mvpSpec.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                        View Spec
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {opportunity.mvpSpec ? (
                  <p className="text-sm text-green-400">
                    Spec generated — click &ldquo;View Spec&rdquo; to read the full document
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Generate an MVP specification document from this opportunity using the AI generator.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Backlog Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Backlog Items ({opportunity.backlogItems.length})
                  </CardTitle>
                  <Link href={`/backlog/new?opportunityId=${opportunity.id}`}>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {opportunity.backlogItems.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No backlog items yet. Add items to track work for this opportunity.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {opportunity.backlogItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-md border border-slate-800 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm text-slate-200">{item.title}</p>
                          <p className="text-xs text-slate-500 capitalize">
                            {item.type} · {item.effort || "?"}
                          </p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Priority Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <ScoreIndicator score={opportunity.priorityScore} className="justify-center" />
                </div>
                <div className="space-y-3">
                  <ScoreBar
                    value={opportunity.impact}
                    label="Impact (×0.35)"
                    color="bg-blue-500"
                  />
                  <ScoreBar
                    value={opportunity.urgency}
                    label="Urgency (×0.20)"
                    color="bg-yellow-500"
                  />
                  <ScoreBar
                    value={opportunity.confidence}
                    label="Confidence (×0.15)"
                    color="bg-green-500"
                  />
                  <ScoreBar
                    value={opportunity.pain}
                    label="Pain (×0.20)"
                    color="bg-red-500"
                  />
                  <ScoreBar
                    value={opportunity.effort}
                    label="Effort (−×0.10)"
                    color="bg-slate-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Meta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Context</p>
                  <Link
                    href={`/contexts/${opportunity.context.id}`}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {opportunity.context.name}
                  </Link>
                </div>
                {opportunity.valueType && (
                  <div>
                    <p className="text-xs text-slate-500">Value Type</p>
                    <p className="text-sm text-slate-300">
                      {valueTypeLabels[opportunity.valueType] || opportunity.valueType}
                    </p>
                  </div>
                )}
                {opportunity.affectedChannel && (
                  <div>
                    <p className="text-xs text-slate-500">Affected Channel</p>
                    <p className="text-sm text-slate-300">{opportunity.affectedChannel}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-sm text-slate-300">
                    {new Date(opportunity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
