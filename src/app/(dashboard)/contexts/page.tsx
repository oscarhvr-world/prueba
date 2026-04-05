import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, FolderOpen } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function ContextsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const contexts = await prisma.context.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { evidences: true, opportunities: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col">
      <Header
        title="Contexts"
        description="Manage your business and personal contexts"
        actions={
          <Link href="/contexts/new">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" />
              New Context
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        {contexts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No contexts yet
            </h3>
            <p className="text-sm text-slate-500 mb-4 max-w-sm">
              Create your first context to start capturing information about
              your business or project environment.
            </p>
            <Link href="/contexts/new">
              <Button variant="primary">
                <Plus className="h-4 w-4" />
                Create Context
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Sector
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Evidences
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Opportunities
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {contexts.map((ctx) => (
                  <tr
                    key={ctx.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/contexts/${ctx.id}`}
                        className="font-medium text-slate-200 hover:text-blue-400 transition-colors"
                      >
                        {ctx.name}
                      </Link>
                      {ctx.city && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ctx.city}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {ctx.sector || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ctx.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {ctx._count.evidences}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {ctx._count.opportunities}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(ctx.updatedAt).toLocaleDateString()}
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
