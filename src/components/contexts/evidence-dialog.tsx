"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { evidenceSchema, type EvidenceInput } from "@/lib/validations/evidence";

interface EvidenceDialogProps {
  contextId: string;
}

export function EvidenceDialog({ contextId }: EvidenceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EvidenceInput>({
    resolver: zodResolver(evidenceSchema),
    defaultValues: {
      contextId,
      type: "note",
      tags: [],
    },
  });

  const onSubmit = async (data: EvidenceInput) => {
    setError(null);
    const res = await fetch("/api/evidences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to add evidence");
      return;
    }

    reset({ contextId, type: "note", tags: [] });
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Add Evidence
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Evidence</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-red-800 bg-red-900/30 px-3 py-2">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("contextId")} />

          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              defaultValue="note"
              onValueChange={(val) => setValue("type", val as EvidenceInput["type"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="observation">Observation</SelectItem>
                <SelectItem value="finding">Finding</SelectItem>
                <SelectItem value="competitor">Competitor</SelectItem>
                <SelectItem value="manual_process">Manual Process</SelectItem>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="screenshot_desc">Screenshot Desc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief description"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Detailed information, observations, notes..."
              rows={4}
              {...register("content")}
            />
            {errors.content && (
              <p className="text-xs text-red-400">{errors.content.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://..."
              {...register("url")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Evidence"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
