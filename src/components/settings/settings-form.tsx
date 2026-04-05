"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePriorityScore } from "@/lib/utils/scoring";

const settingsSchema = z.object({
  impactWeight: z.number().min(0).max(1),
  urgencyWeight: z.number().min(0).max(1),
  confidenceWeight: z.number().min(0).max(1),
  painWeight: z.number().min(0).max(1),
  effortWeight: z.number().min(0).max(1),
});

type SettingsForm = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialSettings: SettingsForm;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings,
  });

  const weights = watch();
  const totalWeight =
    (weights.impactWeight || 0) +
    (weights.urgencyWeight || 0) +
    (weights.confidenceWeight || 0) +
    (weights.painWeight || 0);

  const exampleScore = calculatePriorityScore(8, 7, 7, 8, 4, {
    impactWeight: weights.impactWeight || 0,
    urgencyWeight: weights.urgencyWeight || 0,
    confidenceWeight: weights.confidenceWeight || 0,
    painWeight: weights.painWeight || 0,
    effortWeight: weights.effortWeight || 0,
  });

  const onSubmit = async (data: SettingsForm) => {
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to save settings");
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="rounded-md border border-green-800 bg-green-900/30 px-3 py-2">
          <p className="text-sm text-green-300">Settings saved successfully</p>
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-800 bg-red-900/30 px-3 py-2">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Priority Score Weights</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <p className="text-xs text-slate-400">
              Formula:{" "}
              <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-300">
                Score = (Impact × w₁) + (Urgency × w₂) + (Confidence × w₃) + (Pain × w₄) − (Effort × w₅)
              </code>
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  name: "impactWeight" as const,
                  label: "Impact Weight",
                  desc: "Business value coefficient",
                },
                {
                  name: "urgencyWeight" as const,
                  label: "Urgency Weight",
                  desc: "Time-sensitivity coefficient",
                },
                {
                  name: "confidenceWeight" as const,
                  label: "Confidence Weight",
                  desc: "Certainty coefficient",
                },
                {
                  name: "painWeight" as const,
                  label: "Pain Weight",
                  desc: "Pain severity coefficient",
                },
                {
                  name: "effortWeight" as const,
                  label: "Effort Weight",
                  desc: "Cost coefficient (subtracted)",
                },
              ].map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name}>
                    {field.label}
                    <span className="ml-1 text-xs text-slate-500">
                      ({field.desc})
                    </span>
                  </Label>
                  <Input
                    id={field.name}
                    type="number"
                    step="0.05"
                    min={0}
                    max={1}
                    {...register(field.name)}
                  />
                  {errors[field.name] && (
                    <p className="text-xs text-red-400">
                      {errors[field.name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Live preview */}
            <div className="rounded-md border border-slate-800 bg-slate-900/30 p-4 space-y-3">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Preview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Total positive weight
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      Math.abs(totalWeight - 1) < 0.01
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {totalWeight.toFixed(2)}{" "}
                    {Math.abs(totalWeight - 1) < 0.01 ? "(balanced)" : "(unbalanced)"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Example score (8,7,7,8 pain/effort=4)
                  </p>
                  <p className="text-sm font-medium text-blue-400">
                    {exampleScore.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
