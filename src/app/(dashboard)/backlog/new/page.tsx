"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { backlogItemSchema, type BacklogItemInput } from "@/lib/validations/backlog";

function NewBacklogItemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<
    { id: string; title: string }[]
  >([]);

  const opportunityId = searchParams.get("opportunityId") || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BacklogItemInput>({
    resolver: zodResolver(backlogItemSchema),
    defaultValues: {
      opportunityId: opportunityId || undefined,
      type: "feature",
      priority: "medium",
      status: "draft",
    },
  });

  useEffect(() => {
    fetch("/api/opportunities")
      .then((r) => r.json())
      .then((json) => setOpportunities(json.data || []));
  }, []);

  const onSubmit = async (data: BacklogItemInput) => {
    setError(null);
    const res = await fetch("/api/backlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to create backlog item");
      return;
    }

    router.push("/backlog");
  };

  return (
    <div className="flex flex-col">
      <Header
        title="New Backlog Item"
        description="Add a development task to the backlog"
      />

      <div className="p-6 max-w-2xl">
        {error && (
          <div className="mb-4 rounded-md border border-red-800 bg-red-900/30 px-3 py-2">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <ChevronRight className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Item Details
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pl-6">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="What needs to be built?"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-xs text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the task..."
                  rows={3}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs text-red-400">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Linked Opportunity</Label>
                <Select
                  defaultValue={opportunityId || undefined}
                  onValueChange={(val) => setValue("opportunityId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional..." />
                  </SelectTrigger>
                  <SelectContent>
                    {opportunities.map((opp) => (
                      <SelectItem key={opp.id} value={opp.id}>
                        {opp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select
                  defaultValue="feature"
                  onValueChange={(val) => setValue("type", val as BacklogItemInput["type"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
                    <SelectItem value="experiment">Experiment</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="ops">Ops</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(val) => setValue("priority", val as BacklogItemInput["priority"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Effort</Label>
                <Select
                  onValueChange={(val) => setValue("effort", val as BacklogItemInput["effort"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">XS (hours)</SelectItem>
                    <SelectItem value="s">S (1-2 days)</SelectItem>
                    <SelectItem value="m">M (3-5 days)</SelectItem>
                    <SelectItem value="l">L (1-2 weeks)</SelectItem>
                    <SelectItem value="xl">XL (2+ weeks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <ChevronRight className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Technical Details
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 pl-6">
              <div className="space-y-1.5">
                <Label htmlFor="acceptanceCriteria">Acceptance Criteria</Label>
                <Textarea
                  id="acceptanceCriteria"
                  placeholder="How do we know this is done? List criteria..."
                  rows={3}
                  {...register("acceptanceCriteria")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dependencies">Dependencies</Label>
                <Input
                  id="dependencies"
                  placeholder="What does this depend on?"
                  {...register("dependencies")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="technicalNotes">Technical Notes</Label>
                <Textarea
                  id="technicalNotes"
                  placeholder="Implementation notes, architecture decisions..."
                  rows={2}
                  {...register("technicalNotes")}
                />
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Item"
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewBacklogItemPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading...</div>}>
      <NewBacklogItemForm />
    </Suspense>
  );
}
