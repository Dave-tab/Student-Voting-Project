import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Breadcrumb } from "@/components/layouts/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ResultsHeader } from "@/features/results/components/ResultsHeader";
import { PositionResultCard } from "@/features/results/components/PositionResultCard";
import { ResultsLoadingSkeleton } from "@/features/results/components/ResultsLoadingSkeleton";
import { ResultsUnavailableState } from "@/features/results/components/ResultsUnavailableState";
import { getElectionResults } from "@/features/results/services/resultService";
import type { ElectionResultResponse } from "@/features/results/types";
import {
  ArrowLeft,
  RefreshCw,
  Printer,
  ShieldCheck,
} from "lucide-react";

export default function ResultsPage() {
  const { id: electionId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resultResponse, setResultResponse] = useState<ElectionResultResponse | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchResults() {
      if (!electionId) return;
      setLoading(true);

      try {
        const response = await getElectionResults(electionId);
        if (isMounted) {
          setResultResponse(response);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load results:", err);
          setResultResponse({
            state: "error",
            election: null,
            results: null,
            error: err instanceof Error ? err.message : "Failed to load election results.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [electionId, refreshIndex]);

  const handlePrint = () => {
    window.print();
  };

  const electionTitle = resultResponse?.election?.title || "Election Results";

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6 print:p-0 print:m-0">
      {/* Breadcrumb Navigation */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Elections", href: "/elections" },
            { label: electionTitle, href: electionId ? `/elections/${electionId}` : "/elections" },
            { label: "Official Results" },
          ]}
        />
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => (electionId ? navigate(`/elections/${electionId}`) : navigate("/elections"))}
          className="gap-2 text-xs self-start"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Election Overview
        </Button>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {resultResponse?.state === "available" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRefreshIndex((p) => p + 1)}
            disabled={loading}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <ResultsLoadingSkeleton />
      ) : !resultResponse || resultResponse.state !== "available" ? (
        <ResultsUnavailableState
          state={resultResponse?.state || "no_results"}
          election={resultResponse?.election || null}
          message={resultResponse?.message}
          error={resultResponse?.error}
          onRetry={() => setRefreshIndex((p) => p + 1)}
        />
      ) : (
        <div className="space-y-6">
          {/* Header & Metrics */}
          {resultResponse.election && resultResponse.results && (
            <ResultsHeader
              election={resultResponse.election}
              results={resultResponse.results}
            />
          )}

          {/* Contested Positions Results */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Contested Offices & Final Tallies
              </h2>
              <span className="text-xs text-muted-foreground">
                {resultResponse.results?.positions.length || 0} Offices Evaluated
              </span>
            </div>

            {resultResponse.results?.positions.map((position, idx) => (
              <PositionResultCard
                key={position.position_id}
                position={position}
                positionNumber={idx + 1}
              />
            ))}
          </div>

          {/* Institutional Audit Disclaimer */}
          <div className="p-4 rounded-lg bg-muted/20 border border-border flex items-start gap-3 text-xs text-muted-foreground print:border-gray-300">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-foreground font-semibold block">
                Official Results Information
              </strong>
              <p className="leading-relaxed">
                These tallies are calculated authoritatively by the platform database engine from verified anonymous ballot selections recorded during the official voting window. In alignment with ballot secrecy standards, no individual voter identity is associated with any candidate selection.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
