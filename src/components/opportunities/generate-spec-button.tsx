"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateSpecButtonProps {
  opportunityId: string;
}

export function GenerateSpecButton({ opportunityId }: GenerateSpecButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/generate-spec`, {
        method: "POST",
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Failed to generate spec");
        return;
      }

      const json = await res.json();
      router.push(`/specs/${json.data.id}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="text-xs text-red-400 mb-1">{error}</p>}
      <Button
        variant="primary"
        size="sm"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Spec
          </>
        )}
      </Button>
    </div>
  );
}
