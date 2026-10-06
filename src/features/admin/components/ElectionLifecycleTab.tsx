import { useState } from "react";
import type { AdminElection, LookupStatus } from "../types";
import type { ElectionResultsData } from "@/features/results/types";
import {
  transitionElectionStatus,
  reviewElectionResults,
} from "../services/adminLifecycleService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  Calculator,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ElectionLifecycleTabProps {
  election: AdminElection;
  statuses: LookupStatus[];
  onRefresh: () => Promise<void>;
}

export function ElectionLifecycleTab({
  election,
  statuses,
  onRefresh,
}: ElectionLifecycleTabProps) {
  const navigate = useNavigate();

  const [selectedStatusId, setSelectedStatusId] = useState(election.election_status_id);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionSuccess, setTransitionSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Authoritative Results Calculation state
  const [calculating, setCalculating] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState<ElectionResultsData | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const normalizedStatus = election.status_name.trim().toLowerCase();
  const isResultsAvailable =
    normalizedStatus === "results available" || normalizedStatus === "published";
  const isResultsPending = normalizedStatus === "results pending";
  const isOpen = normalizedStatus === "open" || normalizedStatus === "active";

  // Approved canonical lifecycle stages (OD-10.1, Results Architecture Package)
  const lifecycleStages = [
    { name: "Draft", desc: "Configuration & office setup" },
    { name: "Scheduled", desc: "Timelines locked, awaiting voting window" },
    { name: "Open", desc: "Voting active, student ballots accepted" },
    { name: "Results Pending", desc: "Voting ended, calculating results" },
    { name: "Results Available", desc: "Official calculated results available" },
  ];

  const handleTransition = async () => {
    if (selectedStatusId === election.election_status_id) return;

    const targetStatus = statuses.find((s) => s.id === selectedStatusId);
    if (!targetStatus) return;

    if (
      !confirm(
        `Are you sure you want to transition this election to '${targetStatus.name}'? This may alter voter access and ballot acceptance.`
      )
    ) {
      return;
    }

    try {
      setTransitioning(true);
      setError(null);
      await transitionElectionStatus(election.id, selectedStatusId);
      setTransitionSuccess(`Lifecycle state successfully transitioned to '${targetStatus.name}'.`);
      await onRefresh();
      setTimeout(() => setTransitionSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to transition lifecycle status:", err);
      setError(err instanceof Error ? err.message : "Failed to transition election status.");
    } finally {
      setTransitioning(false);
    }
  };

  const handleCalculateResults = async () => {
    try {
      setCalculating(true);
      setCalcError(null);
      const results = await reviewElectionResults(election.id);
      setCalculatedResults(results);
      await onRefresh();
    } catch (err) {
      console.error("Failed to calculate results:", err);
      setCalcError(
        err instanceof Error ? err.message : "Failed to calculate authoritative results."
      );
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Election Lifecycle & Results</h2>
            <Badge variant="secondary" className="text-xs font-semibold">
              Current: {election.status_name}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational progression from candidate setup through voting and automatic results availability.
          </p>
        </div>

        {isResultsAvailable && (
          <Button
            size="sm"
            onClick={() => navigate(`/elections/${election.id}/results`)}
            className="gap-1.5 text-xs font-bold"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Official Results
          </Button>
        )}
      </div>

      {/* Notifications */}
      {transitionSuccess && (
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{transitionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Visual Lifecycle Pipeline */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-foreground">
            Electoral Progression Pipeline
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Approved lifecycle: Scheduled &rarr; Open &rarr; Results Pending &rarr; Results Available
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
            {lifecycleStages.map((stage, idx) => {
              const stageNorm = stage.name.toLowerCase();
              const isCurrent =
                normalizedStatus === stageNorm ||
                (stageNorm === "open" && normalizedStatus === "active") ||
                (stageNorm === "results available" && normalizedStatus === "published");

              return (
                <div
                  key={stage.name}
                  className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-colors ${
                    isCurrent
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                      : "border-border bg-muted/20 opacity-80"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground">0{idx + 1}</span>
                      {isCurrent && (
                        <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4">
                          Current
                        </Badge>
                      )}
                    </div>
                    <span className="font-bold block text-foreground">{stage.name}</span>
                    <p className="text-[11px] text-muted-foreground leading-tight">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manual Lifecycle Transition Control (for administrative exceptions) */}
      {!isResultsAvailable && (
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-foreground">
              Transition Lifecycle Status
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Advance the election forward into its operational stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedStatusId}
                onChange={(e) => setSelectedStatusId(e.target.value)}
                className="w-full sm:w-72 h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <Button
                onClick={handleTransition}
                disabled={transitioning || selectedStatusId === election.election_status_id}
                size="sm"
                className="h-9 text-xs font-semibold gap-1.5 w-full sm:w-auto"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                {transitioning ? "Transitioning..." : "Update Lifecycle Stage"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automatic Results Calculation Section */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground">
                Authoritative Results Engine
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-mono">
                RPC: calculate_election_results
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Deterministic results calculation directly from anonymous ballot selections. No manual intervention or human-in-the-loop review.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {(isResultsPending || isResultsAvailable || isOpen) && (
              <Button
                onClick={handleCalculateResults}
                disabled={calculating}
                size="sm"
                variant={isResultsPending ? "default" : "outline"}
                className="gap-1.5 text-xs font-semibold"
              >
                {isResultsPending ? (
                  <Calculator className="h-3.5 w-3.5" />
                ) : (
                  <RefreshCw className={`h-3.5 w-3.5 ${calculating ? "animate-spin" : ""}`} />
                )}
                {calculating
                  ? "Computing Tallies..."
                  : isResultsPending
                  ? "Execute Final Calculation"
                  : "Recalculate Results"}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/elections/${election.id}/results`)}
              className="gap-1.5 text-xs"
              title="Open Official Results View"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View Results Page</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {calcError && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-semibold">{calcError}</span>
            </div>
          )}

          {isResultsAvailable ? (
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Official Results Available</p>
                <p className="leading-relaxed">
                  Post-election calculation has completed authoritatively. All verified ballot tallies, percentages, and outcome statuses are publicly available to students and administrators.
                </p>
              </div>
            </div>
          ) : isResultsPending ? (
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3">
              <RefreshCw className="h-5 w-5 shrink-0 text-amber-600 mt-0.5 animate-spin" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Results Pending Calculation</p>
                <p className="leading-relaxed">
                  Voting has concluded. Automatic authoritative calculation is processing to advance the election to <strong>Results Available</strong>. You can also click "Execute Final Calculation" above to run the calculation immediately.
                </p>
              </div>
            </div>
          ) : isOpen ? (
            <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200 text-xs flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Voting Active</p>
                <p className="leading-relaxed">
                  Ballots are actively being accepted from verified eligible students. In compliance with election integrity bylaws, candidate tallies remain confidential until voting concludes.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-border bg-muted/20 text-muted-foreground text-xs flex items-start gap-3">
              <Lock className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-foreground">Awaiting Voting Window</p>
                <p className="leading-relaxed">
                  This election has not yet opened for voting. Results calculation will automatically initiate once the voting period concludes.
                </p>
              </div>
            </div>
          )}

          {/* Non-Manipulation Governance Notice */}
          <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Automatic Non-Manipulation Invariant:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Results are computed exclusively by the database execution engine directly from anonymous, tamper-evident ballot selections. There is no human-in-the-loop publication stage, manual tie-breaking, or score alteration.
            </p>
          </div>

          {/* Calculated Results Display if available */}
          {calculatedResults && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
                <span>Offices Computed: <strong>{calculatedResults.positions.length}</strong></span>
                <span className="font-mono text-[11px]">
                  Timestamp: {new Date(calculatedResults.calculated_at).toLocaleTimeString()}
                </span>
              </div>

              {calculatedResults.positions.map((pos) => (
                <div
                  key={pos.position_id}
                  className="p-3.5 rounded-lg border border-border bg-muted/10 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground">{pos.position_name}</h4>
                    <Badge variant={pos.status === "Decided" ? "default" : "secondary"}>
                      {pos.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 pt-1">
                    {pos.candidates.map((c) => (
                      <div
                        key={c.candidate_id}
                        className={`p-2 rounded flex items-center justify-between ${
                          c.is_winner ? "bg-emerald-500/10 font-bold" : "bg-card"
                        }`}
                      >
                        <span>{c.candidate_name || `Candidate ${c.candidate_id.slice(0, 8)}`}</span>
                        <span>
                          {c.votes} votes ({c.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
