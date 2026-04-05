import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, ExternalLink, Tag } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, CategoryBadge } from "@/components/ui/status-badge";
import { ScoreIndicator } from "@/components/ui/score-indicator";
import { EvidenceDialog } from "@/components/contexts/evidence-dialog";

interface PageProps {
  params: { id: string };
}

const evidenceTypeLabels: Record<string, string> = {
  link: "Link",
  note: "Note",
  observation: "Observation",
  finding: "Finding",
  competitor: "Competitor",
  manual_process: "Manual Process",
  idea: "Idea",
  screenshot_desc: "Screenshot",
};

export default async function ContextDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const context = await prisma.context.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      evidences: { orderBy: { createdAt: "desc" } },
      opportunities: {
        orderBy: { priorityScore: "desc" },
        include: {
          _count: { select: { backlogItems: true } },
          mvpSpec: { select: { id: true } },
        },
      },
    },
  });

  if (!context) notFound();

  const infoFields = [
    { label: "User Type", value: context.userType },
    { label: "City", value: context.city },
    { label: "Sector", value: context.sector },
    { label: "Main Activity", value: context.mainActivity },
    { label: "Technical Level", value: context.technicalLevel },
    { label: "Approx Budget", value: context.approxBudget },
    { label: "Available Time", value: context.availableTime },
    { label: "Urgency", value: context.urgency },
  ];

  const textFields = [
    { label: "Previous Experience", value: context.previousExperience },
    { label: "Current Assets", value: context.currentAssets },
    { label: "Main Pains", value: context.mainPains },
    { label: "Repetitive Tasks", value: context.repetitiveTasks },
    { label: "Objectives", value: context.objectives },
    { label: "Restrictions", value: context.restrictions },
    { label: "Notes", value: context.notes },
  ];

  return (
    <div className="flex flex-col">
      <Header
        title={context.name}
        description={`${context.sector || ""}${context.city ? ` · ${context.city}` : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={context.status} />
            <Link href={`/opportunities/new?contextId=${context.id}`}>
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4" />
                Add Opportunity
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-6">
        <Tabs defaultValue="info">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="evidences">
              Evidences ({context.evidences.length})
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              Opportunities ({context.opportunities.length})
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {infoFields.map((field) =>
                  field.value ? (
                    <div key={field.label} className="rounded-md border border-slate-800 bg-slate-900/30 p-3">
                      <p className="text-xs text-slate-500 mb-1">{field.label}</p>
                      <p className="text-sm text-slate-200 capitalize">{field.value}</p>
                    </div>
                  ) : null
                )}
              </div>

              <div className="space-y-4">
                {textFields.map((field) =>
                  field.value ? (
                    <div key={field.label}>
                      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                        {field.label}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {field.value}
                      </p>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </TabsContent>

          {/* Evidences Tab */}
          <TabsContent value="evidences">
            <div className="space-y-4">
              <div className="flex justify-end">
                <EvidenceDialog contextId={context.id} />
              </div>

              {context.evidences.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500">No evidences captured yet</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Add links, notes, observations and findings
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {context.evidences.map((ev) => (
                    <Card key={ev.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {evidenceTypeLabels[ev.type] || ev.type}
                              </Badge>
                              <h4 className="text-sm font-medium text-slate-200 truncate">
                                {ev.title}
                              </h4>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              {ev.content}
                            </p>
                            {ev.url && (
                              <a
                                href={ev.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {ev.url}
                              </a>
                            )}
                            {ev.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {ev.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-400"
                                  >
                                    <Tag className="h-2.5 w-2.5" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-slate-600 shrink-0">
                            {new Date(ev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Link href={`/opportunities/new?contextId=${context.id}`}>
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4" />
                    New Opportunity
                  </Button>
                </Link>
              </div>

              {context.opportunities.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500">No opportunities yet</p>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                          Title
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
                          Spec
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {context.opportunities.map((opp) => (
                        <tr
                          key={opp.id}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/opportunities/${opp.id}`}
                              className="font-medium text-slate-200 hover:text-blue-400 transition-colors"
                            >
                              {opp.title}
                            </Link>
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
                          <td className="px-4 py-3">
                            {opp.mvpSpec ? (
                              <Link href={`/specs/${opp.mvpSpec.id}`}>
                                <Button variant="ghost" size="sm" className="h-7 text-xs">
                                  <FileText className="h-3 w-3" />
                                  View
                                </Button>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
