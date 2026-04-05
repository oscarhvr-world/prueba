"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { contextSchema, type ContextInput } from "@/lib/validations/context";

export default function NewContextPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContextInput>({
    resolver: zodResolver(contextSchema),
    defaultValues: {
      urgency: "medium",
      technicalLevel: "intermediate",
      status: "active",
      digitalChannels: [],
      tools: [],
    },
  });

  const onSubmit = async (data: ContextInput) => {
    setError(null);
    const res = await fetch("/api/contexts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to create context");
      return;
    }

    const json = await res.json();
    router.push(`/contexts/${json.data.id}`);
  };

  return (
    <div className="flex flex-col">
      <Header
        title="New Context"
        description="Capture information about a person or business environment"
      />

      <div className="p-6 max-w-3xl">
        {error && (
          <div className="mb-4 rounded-md border border-red-800 bg-red-900/30 px-3 py-2">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <ChevronRight className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Basic Information
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pl-6">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Context Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Local Consulting Ops"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="userType">User Type</Label>
                <Input
                  id="userType"
                  placeholder="e.g. Freelancer, SME Owner"
                  {...register("userType")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g. Madrid"
                  {...register("city")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  placeholder="e.g. Consulting, E-commerce"
                  {...register("sector")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mainActivity">Main Activity</Label>
                <Input
                  id="mainActivity"
                  placeholder="e.g. Business consulting"
                  {...register("mainActivity")}
                />
              </div>
            </div>
          </section>

          {/* Context Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <ChevronRight className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Context Details
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 pl-6">
              <div className="space-y-1.5">
                <Label htmlFor="previousExperience">Previous Experience</Label>
                <Textarea
                  id="previousExperience"
                  placeholder="Background, previous roles, relevant experience..."
                  rows={3}
                  {...register("previousExperience")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currentAssets">Current Assets</Label>
                <Textarea
                  id="currentAssets"
                  placeholder="Existing tools, systems, databases, team..."
                  rows={3}
                  {...register("currentAssets")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mainPains">Main Pains</Label>
                <Textarea
                  id="mainPains"
                  placeholder="Key problems, frustrations, bottlenecks..."
                  rows={3}
                  {...register("mainPains")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="repetitiveTasks">Repetitive Tasks</Label>
                <Textarea
                  id="repetitiveTasks"
                  placeholder="Tasks done manually and repeatedly..."
                  rows={2}
                  {...register("repetitiveTasks")}
                />
              </div>
            </div>
          </section>

          {/* Technical & Resources */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <ChevronRight className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Technical & Resources
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pl-6">
              <div className="space-y-1.5">
                <Label>Technical Level</Label>
                <Select
                  defaultValue="intermediate"
                  onValueChange={(val) =>
                    setValue("technicalLevel", val as "basic" | "intermediate" | "advanced")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Urgency</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(val) =>
                    setValue("urgency", val as "low" | "medium" | "high" | "critical")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="approxBudget">Approximate Budget</Label>
                <Input
                  id="approxBudget"
                  placeholder="e.g. €500/month, €5k project"
                  {...register("approxBudget")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="availableTime">Available Time</Label>
                <Input
                  id="availableTime"
                  placeholder="e.g. 10h/week for 3 months"
                  {...register("availableTime")}
                />
              </div>
            </div>
          </section>

          {/* Goals */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <ChevronRight className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Goals & Restrictions
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 pl-6">
              <div className="space-y-1.5">
                <Label htmlFor="objectives">Objectives</Label>
                <Textarea
                  id="objectives"
                  placeholder="What does success look like? What are the main goals?"
                  rows={3}
                  {...register("objectives")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="restrictions">Restrictions</Label>
                <Textarea
                  id="restrictions"
                  placeholder="Budget limits, technical constraints, compliance requirements..."
                  rows={2}
                  {...register("restrictions")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other relevant information..."
                  rows={2}
                  {...register("notes")}
                />
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Context"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
