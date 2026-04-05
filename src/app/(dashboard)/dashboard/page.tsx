import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  FolderOpen,
  Lightbulb,
  List,
  ArrowRight,
  Plus,
  FileText,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreIndicator } from "@/components/ui/score-indicator";
import { StatusBadge, CategoryBadge } from "@/components/ui/status-badge";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [contextsCount, opportunitiesCount, backlogCount, topOpportunities, recentContexts] =
    await Promise.all([
      prisma.context.count({ where: { userId } }),
      prisma.opportunity.count({ where: { context: { userId } } }),
      prisma.backlogItem.count({
        where: {
          status: "ready",
          opportunity: { context: { userId } },
        },
      }),
      prisma.opportunity.findMany({
        where: { context: { userId } },
        orderBy: { priorityScore: "desc" },
        take: 5,
        include: {
          context: { select: { name: true } },
          mvpSpec: { select: { id: true } },
        },
      }),
      prisma.context.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 3,
        include: {
          _count: { select: { evidences: true, opportunities: true } },
        },
      }),
    ]);

  const stats = [
    {
      title: "Contexts",
      value: contextsCount,
      description: "Active contexts",
      icon: FolderOpen,
      href: "/contexts",
      color: "text-blue-400",
    },
    {
      title: "Opportunities",
      value: opportunitiesCount,
      description: "Total identified",
      icon: Lightbulb,
      href: "/opportunities",
      color: "text-yellow-400",
    },
    {
      title: "Ready to Build",
      value: backlogCount,
      description: "Backlog items ready",
      icon: List,
      href: "/backlog",
      color: "text-green-400",
    },
  ];

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        description={`Welcome back${session.user.name ? `, ${session.user.name}` : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/contexts/new">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4" />
                New Context
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:border-slate-700 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          {stat.title}
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-slate-100">
                          {stat.value}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {stat.description}
                        </p>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top opportunities */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Top Opportunities</CardTitle>
                <Link
                  href="/opportunities"
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {topOpportunities.length === 0 ? (
                <div className="py-8 text-center">
                  <Lightbulb className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No opportunities yet</p>
                  <Link href="/opportunities/new">
                    <Button variant="ghost" size="sm" className="mt-2">
                      <Plus className="h-4 w-4" />
                      Add opportunity
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {topOpportunities.map((opp) => (
                    <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                      <div className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-slate-800/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 truncate">
                            {opp.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">
                              {opp.context.name}
                            </span>
                            <CategoryBadge category={opp.category} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {opp.mvpSpec && (
                            <FileText className="h-3.5 w-3.5 text-blue-400" />
                          )}
                          <ScoreIndicator score={opp.priorityScore} showLabel={false} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent contexts */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Recent Contexts</CardTitle>
                <Link
                  href="/contexts"
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentContexts.length === 0 ? (
                <div className="py-8 text-center">
                  <FolderOpen className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No contexts yet</p>
                  <Link href="/contexts/new">
                    <Button variant="ghost" size="sm" className="mt-2">
                      <Plus className="h-4 w-4" />
                      Create context
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentContexts.map((ctx) => (
                    <Link key={ctx.id} href={`/contexts/${ctx.id}`}>
                      <div className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-slate-800/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 truncate">
                            {ctx.name}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-500">
                              {ctx._count.evidences} evidences
                            </span>
                            <span className="text-xs text-slate-500">
                              {ctx._count.opportunities} opportunities
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={ctx.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Link href="/contexts/new">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <FolderOpen className="h-4 w-4" />
                  New Context
                </Button>
              </Link>
              <Link href="/opportunities/new">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Lightbulb className="h-4 w-4" />
                  New Opportunity
                </Button>
              </Link>
              <Link href="/backlog/new">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <List className="h-4 w-4" />
                  Add to Backlog
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Configure Scoring
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
