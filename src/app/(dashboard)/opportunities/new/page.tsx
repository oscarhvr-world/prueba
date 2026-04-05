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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreBar } from "@/components/ui/score-indicator";
import { opportunitySchema, type OpportunityInput } from "@/lib/validations/opportunity";
import { calculatePriorityScore } from "@/lib/utils/scoring";

function NewOpportunityForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [contexts, setContexts] = useState<{ id: string; name: string }[]>([]);
  const [liveScore, setLiveScore] = useState(0);

  const contextId = searchParams.get("contextId") || "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OpportunityInput>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      contextId,
      impact: 5,
      effort: 5,
      urgency: 5,
      confidence: 5,
      pain: 5,
      category: "operations",
      status: "identified",
    },
  });

  const watchedValues = watch(["impact", "urgency", "confidence", "pain", "effort"]);

  useEffect(() => {
    const [impact, urgency, confidence, pain, effort] = watchedValues;
    const score = calculatePriorityScore(
      impact || 5,
      urgency || 5,
      confidence || 5,
      pain || 5,
      effort || 5
    );
    setLiveScore(score);
  }, [watchedValues]);

  useEffect(() => {
    fetch("/api/contexts")
      .then((r) => r.json())
      .then((json) => setContexts(json.data || []));
  }, []);

  const onSubmit = async (data: OpportunityInput) => {
    setError(null);
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to create opportunity");
      return;
    }

    const json = await res.json();
    router.push(`/opportunities/${json.data.id}`);
  };

  return (
    <div className="flex flex-col">
      <Header
        title="New Opportunity"
        description="Identify and score a new opportunity"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-4 rounded-md border border-red-800 bg-red-900/30 px-3 py-2">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <ChevronRight className="h-4 w-4 text-blue-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Basic Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pl-6">
                  <div className="space-y-1.5">
                    <Label>Context *</Label>
                    <Select
                      defaultValue={contextId || undefined}
                      onValueChange={(val) => setValue("contextId", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select context..." />
                      </SelectTrigger>
                      <SelectContent>
                        {contexts.map((ctx) => (
                          <SelectItem key={ctx.id} value={ctx.id}>
                            {ctx.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.contextId && (
                      <p className="text-xs text-red-400">{errors.contextId.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Category *</Label>
                    <Select
                      defaultValue="operations"
                      onValueChange={(val) => setValue("category", val as OpportunityInput["category"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automation">Automation</SelectItem>
                        <SelectItem value="acquisition">Acquisition</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="reporting">Reporting</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="internal_control">Internal Control</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="digital_presence">Digital Presence</SelectItem>
                        <SelectItem value="digital_product">Digital Product</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Clear, specific opportunity description"
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
                      placeholder="Describe the opportunity in detail..."
                      rows={3}
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-400">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Scoring */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <ChevronRight className="h-4 w-4 text-blue-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Priority Scoring (1-10)
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pl-6">
                  {[
                    { name: "impact" as const, label: "Impact", desc: "Business value if solved" },
                    { name: "urgency" as const, label: "Urgency", desc: "How time-sensitive" },
                    { name: "confidence" as const, label: "Confidence", desc: "Certainty of outcome" },
                    { name: "pain" as const, label: "Pain", desc: "Severity of current pain" },
                    { name: "effort" as const, label: "Effort", desc: "Implementation cost (inverted)" },
                  ].map((field) => (
                    <div key={field.name} className="space-y-1.5">
                      <Label htmlFor={field.name}>
                        {field.label}
                        <span className="ml-1 text-xs text-slate-500">({field.desc})</span>
                      </Label>
                      <Input
                        id={field.name}
                        type="number"
                        min={1}
                        max={10}
                        {...register(field.name, { valueAsNumber: true })}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Details */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <ChevronRight className="h-4 w-4 text-blue-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 pl-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="painResolved">Pain Resolved</Label>
                    <Textarea
                      id="painResolved"
                      placeholder="What specific pain does this solve?"
                      rows={2}
                      {...register("painResolved")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="solutionProposal">Solution Proposal</Label>
                    <Textarea
                      id="solutionProposal"
                      placeholder="Initial idea for the solution..."
                      rows={2}
                      {...register("solutionProposal")}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Value Type</Label>
                      <Select
                        onValueChange={(val) => setValue("valueType", val as OpportunityInput["valueType"])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="time_saving">Time Saving</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="cost_reduction">Cost Reduction</SelectItem>
                          <SelectItem value="risk_reduction">Risk Reduction</SelectItem>
                          <SelectItem value="quality">Quality</SelectItem>
                          <SelectItem value="visibility">Visibility</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="affectedChannel">Affected Channel</Label>
                      <Input
                        id="affectedChannel"
                        placeholder="e.g. email, website, CRM"
                        {...register("affectedChannel")}
                      />
                    </div>
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
                    "Create Opportunity"
                  )}
                </Button>
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {/* Score Preview */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm">Score Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <span className="text-4xl font-bold text-slate-100">
                    {liveScore.toFixed(1)}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Priority Score</p>
                </div>

                <div className="space-y-3">
                  <ScoreBar
                    value={watch("impact") || 5}
                    label="Impact (×0.35)"
                    color="bg-blue-500"
                  />
                  <ScoreBar
                    value={watch("urgency") || 5}
                    label="Urgency (×0.20)"
                    color="bg-yellow-500"
                  />
                  <ScoreBar
                    value={watch("confidence") || 5}
                    label="Confidence (×0.15)"
                    color="bg-green-500"
                  />
                  <ScoreBar
                    value={watch("pain") || 5}
                    label="Pain (×0.20)"
                    color="bg-red-500"
                  />
                  <ScoreBar
                    value={watch("effort") || 5}
                    label="Effort (−×0.10)"
                    color="bg-slate-500"
                  />
                </div>

                <p className="text-xs text-slate-600 text-center">
                  Score = Impact×0.35 + Urgency×0.20 + Confidence×0.15 + Pain×0.20 − Effort×0.10
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewOpportunityPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading...</div>}>
      <NewOpportunityForm />
    </Suspense>
  );
}
