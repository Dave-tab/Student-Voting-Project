import { useEffect, useState } from "react";
import type { AdminCandidate, LookupStatus } from "../types";
import {
  getAdminCandidates,
  updateCandidateStatus,
  getCandidateStatuses,
} from "../services/adminCandidateService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserX,
  FileText,
  Search,
  Check,
  User,
  MessageSquare,
  RotateCcw,
  RefreshCw,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/utils/imageUtils";

interface ElectionCandidatesTabProps {
  electionId: string;
}

export function ElectionCandidatesTab({ electionId }: ElectionCandidatesTabProps) {
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [statuses, setStatuses] = useState<LookupStatus[]>([]);
  const [electionStatus, setElectionStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Vetting Dialog State
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState<{ id: string; name: string; status: string } | null>(null);
  const [remarksText, setRemarksText] = useState("");
  const [remarksError, setRemarksError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [candsData, statusesData, electionRes] = await Promise.all([
        getAdminCandidates(electionId),
        getCandidateStatuses(),
        supabase
          .from("elections")
          .select("election_statuses(name)")
          .eq("id", electionId)
          .maybeSingle(),
      ]);
      setCandidates(candsData);
      setStatuses(statusesData);
      const sName = (electionRes?.data?.election_statuses as unknown as { name?: string } | null)?.name || "";
      setElectionStatus(sName);
    } catch (err) {
      console.error("Failed to load candidates:", err);
      setError(err instanceof Error ? err.message : "Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const [candsData, statusesData, electionRes] = await Promise.all([
          getAdminCandidates(electionId),
          getCandidateStatuses(),
          supabase
            .from("elections")
            .select("election_statuses(name)")
            .eq("id", electionId)
            .maybeSingle(),
        ]);
        if (!ignore) {
          setCandidates(candsData);
          setStatuses(statusesData);
          const sName = (electionRes?.data?.election_statuses as unknown as { name?: string } | null)?.name || "";
          setElectionStatus(sName);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load candidates:", err);
          setError(err instanceof Error ? err.message : "Failed to load candidates.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    async function refreshSilently() {
      try {
        const candsData = await getAdminCandidates(electionId);
        if (!ignore) {
          setCandidates(candsData);
        }
      } catch {
        // keep existing on background sync error
      }
    }

    fetchData();

    // Real-time synchronization on candidates table for this election
    const channel = supabase
      .channel(`election-${electionId}-admin-candidates`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates", filter: `election_id=eq.${electionId}` },
        () => {
          refreshSilently();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidate_details" },
        () => {
          refreshSilently();
        }
      )
      .subscribe();

    const timer = setInterval(() => {
      refreshSilently();
    }, 8000);

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [electionId]);

  const isFrozen =
    Boolean(electionStatus) &&
    !["draft", "scheduled", "upcoming", "planning"].includes(electionStatus.toLowerCase());

  const handleStatusChange = async (candidateId: string, newStatusName: string, remarks?: string) => {
    if (isFrozen) {
      setError("Candidate applications and vetting determinations are permanently frozen once an election is open or concluded.");
      return;
    }

    const statusObj = statuses.find(
      (s) => s.name.toLowerCase() === newStatusName.toLowerCase()
    );
    if (!statusObj) {
      setError(`Candidate status '${newStatusName}' not recognized in database.`);
      return;
    }

    try {
      setUpdatingId(candidateId);
      setError(null);
      await updateCandidateStatus(candidateId, statusObj.id, remarks);
      setActionSuccess(`Candidate status updated to '${newStatusName}'.`);
      await loadData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to update candidate status:", err);
      setError(err instanceof Error ? err.message : "Failed to update candidate status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openRemarksDialog = (candidate: AdminCandidate, newStatus: string) => {
    if (isFrozen) {
      setError("Candidate applications and vetting determinations are permanently frozen for this election.");
      return;
    }

    setTargetCandidate({ id: candidate.id, name: candidate.full_name, status: newStatus });
    setRemarksText("");
    setRemarksError(null);
    setRemarksDialogOpen(true);
  };

  const submitWithRemarks = async () => {
    if (!targetCandidate) return;
    if ((targetCandidate.status === "Rejected" || targetCandidate.status === "Withdrawn") && !remarksText.trim()) {
      setRemarksError("A mandatory remark or reason is required for this action.");
      return;
    }

    await handleStatusChange(targetCandidate.id, targetCandidate.status, remarksText);
    setRemarksDialogOpen(false);
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.matriculation_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      c.status_name.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Candidate Vetting & Administration</h2>
            <Badge variant="secondary" className="text-xs font-semibold">
              {candidates.length} Registered
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review candidate profiles, manifestos, and approve or withdraw candidates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {isFrozen && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs font-medium">
          <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Authoritative Candidate Freeze Enforced:</strong> This election is currently <strong>{electionStatus}</strong>. In accordance with election integrity governance, candidate applications, eligibility determinations, and vetting decisions are permanently frozen.
          </span>
        </div>
      )}

      {/* Vetting Rule Notice */}
      <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Award className="h-4 w-4 text-primary" />
          <span>Candidate Status & Ballot Invariant:</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Only candidates whose status is <strong>Approved</strong> will be presented on the student ballot. 
          Rejections and withdrawals require mandatory remarks for audit and candidate feedback.
        </p>
      </div>

      {/* Feedback alerts */}
      {actionSuccess && (
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates or offices..."
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Nomination States</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.name.toLowerCase()}>
                {s.name}
              </option>
            ))}
          </select>

          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-xs h-9 px-2"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Candidate List */}
      {loading ? (
        <div className="p-8 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs">
          Loading candidate filings...
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card className="border border-border border-dashed p-8 text-center">
          <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-sm font-bold text-foreground">
            {searchQuery || statusFilter !== "all"
              ? "No Matching Candidates"
              : "No Candidates Registered Yet"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search criteria."
              : "Candidate nominations will populate here for administrative screening and approval."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => {
            const isApproved = candidate.status_name.toLowerCase() === "approved";
            const isRejected = candidate.status_name.toLowerCase() === "rejected";
            const isWithdrawn = candidate.status_name.toLowerCase() === "withdrawn";
            const isPending =
              candidate.status_name.toLowerCase().includes("pending") ||
              candidate.status_name.toLowerCase() === "nominated";
            const imageUrl = getImageUrl(candidate.photo_path);

            return (
              <Card
                key={candidate.id}
                className="border border-border bg-card shadow-xs transition-colors hover:border-primary/30 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Photo Section */}
                  <div className="w-full md:w-48 h-48 md:h-auto bg-muted shrink-0 border-b md:border-b-0 md:border-r border-border flex items-center justify-center relative group">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={candidate.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <User className="h-10 w-10 opacity-20" />
                        <span className="text-[10px] uppercase font-bold">No Photo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isApproved ? "default" : isRejected || isWithdrawn ? "destructive" : "secondary"}
                              className="text-[10px] font-bold"
                            >
                              {candidate.status_name}
                            </Badge>
                            <span className="text-xs font-semibold text-primary">
                              Contesting: {candidate.position_name}
                            </span>
                          </div>
                          <CardTitle className="text-base font-bold text-foreground mt-1">
                            {candidate.full_name}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground font-mono">
                            Matriculation No: {candidate.matriculation_number}
                          </CardDescription>
                        </div>

                        {/* Vetting Action Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                          {isFrozen ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted border border-border text-muted-foreground text-xs font-medium">
                              <Clock className="h-3 w-3 text-muted-foreground/70" />
                              <span>Candidate Pool Frozen</span>
                            </div>
                          ) : (
                            <>
                              {!isApproved && (
                                <Button
                                  size="sm"
                                  onClick={() => openRemarksDialog(candidate, "Approved")}
                                  disabled={updatingId === candidate.id}
                                  className="h-7 text-xs gap-1 font-semibold"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Approve</span>
                                </Button>
                              )}

                              {!isRejected && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openRemarksDialog(candidate, "Rejected")}
                                  disabled={updatingId === candidate.id}
                                  className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10"
                                >
                                  <XCircle className="h-3 w-3" />
                                  <span>Reject</span>
                                </Button>
                              )}

                              {!isWithdrawn && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openRemarksDialog(candidate, "Withdrawn")}
                                  disabled={updatingId === candidate.id}
                                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                >
                                  <UserX className="h-3 w-3" />
                                  <span>Withdraw</span>
                                </Button>
                              )}

                              {!isPending && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openRemarksDialog(candidate, "Pending_Approval")}
                                  disabled={updatingId === candidate.id}
                                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                  title="Reset status back to Pending Approval"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  <span>Reset</span>
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-2 space-y-3">
                      {/* Campaign Slogan */}
                      {candidate.campaign_slogan && (
                        <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
                          "{candidate.campaign_slogan}"
                        </div>
                      )}

                      {/* Manifesto */}
                      {candidate.manifesto ? (
                        <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1 text-[11px]">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Submitted Manifesto / Vision:</span>
                          </div>
                          <p className="text-foreground/80 leading-relaxed italic text-[11px]">
                            "{candidate.manifesto}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-[11px] italic">
                          No candidate manifesto submitted.
                        </p>
                      )}

                      {/* Remarks Display */}
                      {(candidate.approval_remarks || candidate.withdrawal_reason) && (
                        <div className="rounded-md border border-border/40 bg-amber-500/5 p-3">
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold mb-1 text-[11px]">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{isWithdrawn ? "Withdrawal Reason:" : "Vetting Remarks:"}</span>
                          </div>
                          <p className="text-foreground/70 text-[11px]">
                            {candidate.approval_remarks || candidate.withdrawal_reason}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Vetting Remarks Dialog */}
      <Dialog open={remarksDialogOpen} onOpenChange={setRemarksDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Candidate Vetting Status</DialogTitle>
            <DialogDescription>
              Set <strong>{targetCandidate?.name}</strong> to <strong>{targetCandidate?.status}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                {targetCandidate?.status === "Rejected" || targetCandidate?.status === "Withdrawn" 
                  ? "Mandatory Remarks / Reason" 
                  : "Approval Remarks (Optional)"}
              </label>
              <Textarea
                placeholder={targetCandidate?.status === "Rejected" ? "State the specific reason for disqualification..." : "Provide any relevant notes for this action..."}
                value={remarksText}
                onChange={(e) => {
                  setRemarksText(e.target.value);
                  if (remarksError) setRemarksError(null);
                }}
                className="text-xs min-h-[100px]"
              />
              {remarksError ? (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{remarksError}</span>
                </p>
              ) : (targetCandidate?.status === "Rejected" || targetCandidate?.status === "Withdrawn") && !remarksText.trim() ? (
                <p className="text-[10px] text-destructive font-medium">This action requires a documented reason.</p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <DialogClose className="h-9 px-3 rounded-md border border-border bg-background text-xs hover:bg-muted transition-colors">
              Cancel
            </DialogClose>
            <Button 
              size="sm" 
              onClick={submitWithRemarks}
              disabled={updatingId !== null || ((targetCandidate?.status === "Rejected" || targetCandidate?.status === "Withdrawn") && !remarksText.trim())}
              className="text-xs"
            >
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
