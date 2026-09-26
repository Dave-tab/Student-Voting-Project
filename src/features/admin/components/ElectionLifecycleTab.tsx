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
  FileCheck,
  AlertCircle,
  ExternalLink,
  Lock,
  ArrowRight,
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

  // Authoritative Results Calculation Review state
  const [calculating, setCalculating] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState<ElectionResultsData | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const currentStatusName = election.status_name.toLowerCase();

  // Canonical lifecycle stages
  const lifecycleStages = [
    { name: "Draft", desc: "Configuration & office setup" },
    { name: "Scheduled", desc: "Timelines locked, candidates approved" },
    { name: "Active", desc: "Voting window open for student ballots" },
    { name: "Closed", desc: "Ballot intake concluded" },
    { name: "Results Calculated", desc: "Authoritative RPC tally computed" },
    { name: "Published", desc: "Official results visible publicly" },
  ];

  const handleTransition = async () => {
    if (selectedStatusId === election.election_status_id) return;

    const targetStatus = statuses.find((s) => s.id === selectedStatusId);
    if (!targetStatus) return;

    if (!confirm(`Are you sure you want to transition this election to '${targetStatus.name}'? This may alter voter access and ballot acceptance.`)) {
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

  const handleReviewResults = async () => {
    try {
      setCalculating(true);
      setCalcError(null);
      const results = await reviewElectionResults(election.id);
      setCalculatedResults(results);
    } catch (err) {
      console.error("Failed to calculate results:", err);
      setCalcError(err instanceof Error ? err.message : "Failed to calculate authoritative results.");
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
            <h2 className="text-lg font-bold text-foreground">Election Lifecycle & Publication</h2>
            <Badge variant="secondary" className="text-xs font-semibold">
              Current: {election.status_name}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage stage transitions from preparation through ballot closing and authoritative results publication.
          </p>
        </div>
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
            Strict lifecycle progression governed by institutional electoral bylaws.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {lifecycleStages.map((stage, idx) => {
              const isActive = currentStatusName.includes(stage.name.toLowerCase());
              return (
                <div
                  key={stage.name}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border bg-muted/10 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold">
                      0{idx + 1}
                    </span>
                    {isActive && <CheckCircle2 className="h-3 w-3 text-primary" />}
                  </div>
                  <span className={`block text-xs font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                    {stage.name}
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {stage.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Transition Control */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-foreground">
            Transition Lifecycle Status
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Advance the election into its next operational stage.
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

          <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary shrink-0" />
            <span>
              <strong>Integrity Rule:</strong> Once an election is moved to <em>Published</em>, official results are finalized and publicly accessible to all students.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Authoritative Results Review & Calculation Section */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground">
                Authoritative Results Review & Publication
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-mono">
                RPC: calculate_election_results
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Execute authoritative results calculation directly from anonymous ballot selections without manual intervention.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleReviewResults}
              disabled={calculating}
              size="sm"
              className="gap-1.5 text-xs font-semibold"
            >
              <FileCheck className="h-3.5 w-3.5" />
              {calculating ? "Calculating Official Tallies..." : "Calculate & Review Results"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/elections/${election.id}/results`)}
              className="gap-1.5 text-xs"
              title="Open Public Results View"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Public View</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {calcError && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{calcError}</span>
            </div>
          )}

          {/* Strict Governance Notice */}
          <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Non-Manipulation Governance Invariant:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Results are computed exclusively by the database execution engine directly from anonymous, tamper-evident ballot selections. Administrators cannot manually edit vote totals, invent winners, or break ties. Any tie must remain recorded as Tied until official institutional runoff bylaws are executed.
            </p>
          </div>

          {/* Calculated Results Display */}
          {calculating ? (
            <div className="p-8 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs">
              Executing authoritative calculation engine...
            </div>
          ) : calculatedResults ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
                <span>Contests Computed: <strong>{calculatedResults.positions.length}</strong></span>
                <span className="font-mono text-[11px]">
                  Timestamp: {new Date(calculatedResults.calculated_at).toLocaleTimeString()}
                </span>
              </div>

              {calculatedResults.positions.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  No elective positions have cast votes recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {calculatedResults.positions.map((pos) => (
                    <div
                      key={pos.position_id}
                      className="p-4 rounded-lg border border-border bg-muted/10 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{pos.position_name}</h4>
                          <span className="text-[11px] text-muted-foreground">
                            Total Valid Selections: {pos.total_valid_selections}
                          </span>
                        </div>
                        <Badge
                          variant={pos.status === "Decided" ? "default" : pos.status === "Tied" ? "destructive" : "secondary"}
                          className="text-[10px] font-semibold self-start sm:self-auto"
                        >
                          Status: {pos.status}
                        </Badge>
                      </div>

                      {/* Candidates breakdown */}
                      <div className="space-y-2 pt-1">
                        {pos.candidates.map((cand) => {
                          const isWinner = pos.winner_candidate_id === cand.candidate_id;
                          return (
                            <div
                              key={cand.candidate_id}
                              className={`p-2.5 rounded-md border text-xs flex items-center justify-between gap-3 ${
                                isWinner
                                  ? "border-emerald-500/40 bg-emerald-500/10 font-semibold"
                                  : "border-border/60 bg-card"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isWinner && (
                                  <Badge className="text-[9px] px-1.5 py-0 bg-emerald-600 text-white">
                                    Leading
                                  </Badge>
                                )}
                                <span className="text-foreground font-medium text-xs">
                                  Contender
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                <span className="font-bold text-foreground">
                                  {cand.votes} Vote{cand.votes === 1 ? "" : "s"}
                                </span>
                                <span className="text-muted-foreground font-mono text-[11px] w-12 text-right">
                                  {cand.percentage}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
              Click "Calculate & Review Results" above to execute the database tally engine and inspect official tallies.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
