import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import {
  isAdministrativeRole,
  getRoleDisplayName,
  type AdminCandidate,
  type AdminElection,
  type LookupStatus,
} from "@/features/admin/types";
import {
  getAdminCandidates,
  updateCandidateStatus,
  getCandidateStatuses,
} from "@/features/admin/services/adminCandidateService";
import { getAdminElections } from "@/features/admin/services/adminElectionService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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
  Vote,
  ExternalLink,
  RefreshCw,
  Clock,
  Filter,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/utils/imageUtils";

export default function AdminCandidateVettingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [elections, setElections] = useState<AdminElection[]>([]);
  const [statuses, setStatuses] = useState<LookupStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const selectedElectionId = searchParams.get("election") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog State
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState<{
    id: string;
    name: string;
    status: string;
    position: string;
  } | null>(null);
  const [remarksText, setRemarksText] = useState("");
  const [remarksError, setRemarksError] = useState<string | null>(null);

  const roleName = getRoleDisplayName(user?.role);
  const isAdmin = isAdministrativeRole(user?.role);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [candidatesData, electionsData, statusesData] = await Promise.all([
        getAdminCandidates(selectedElectionId === "all" ? undefined : selectedElectionId),
        getAdminElections(),
        getCandidateStatuses(),
      ]);
      setCandidates(candidatesData);
      setElections(electionsData);
      setStatuses(statusesData);
    } catch (err) {
      console.error("Failed to load candidate approval data:", err);
      setError(err instanceof Error ? err.message : "Failed to load candidate approvals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const [candidatesData, electionsData, statusesData] = await Promise.all([
          getAdminCandidates(selectedElectionId === "all" ? undefined : selectedElectionId),
          getAdminElections(),
          getCandidateStatuses(),
        ]);
        if (!ignore) {
          setCandidates(candidatesData);
          setElections(electionsData);
          setStatuses(statusesData);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load candidate approval data:", err);
          setError(err instanceof Error ? err.message : "Failed to load candidate approvals.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    async function refreshSilently() {
      try {
        const candidatesData = await getAdminCandidates(
          selectedElectionId === "all" ? undefined : selectedElectionId
        );
        if (!ignore) {
          setCandidates(candidatesData);
        }
      } catch {
        // Keep existing data on background sync failures
      }
    }

    fetchData();

    // Real-time synchronization: automatically updates whenever students submit or revise applications
    const channel = supabase
      .channel("admin-candidate-vetting-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
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

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [selectedElectionId]);

  const isCandidateFrozen = (candidate: AdminCandidate) => {
    const election = elections.find((e) => e.id === candidate.election_id);
    const electionStatus = (election?.status_name || "").toLowerCase();
    if (!electionStatus) return false;
    return !["draft", "scheduled", "upcoming", "planning"].includes(electionStatus);
  };

  const handleStatusChange = async (candidateId: string, newStatusName: string, remarks?: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate && isCandidateFrozen(candidate)) {
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
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      console.error("Failed to update candidate status:", err);
      setError(err instanceof Error ? err.message : "Failed to update candidate status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openRemarksDialog = (candidate: AdminCandidate, newStatus: string) => {
    if (isCandidateFrozen(candidate)) {
      setError("Candidate applications and vetting determinations are permanently frozen for this election.");
      return;
    }

    setTargetCandidate({
      id: candidate.id,
      name: candidate.full_name,
      status: newStatus,
      position: candidate.position_name,
    });
    setRemarksText("");
    setRemarksError(null);
    setRemarksDialogOpen(true);
  };

  const submitWithRemarks = async () => {
    if (!targetCandidate) return;

    if (
      (targetCandidate.status === "Rejected" || targetCandidate.status === "Withdrawn") &&
      !remarksText.trim()
    ) {
      setRemarksError("A detailed, mandatory remark is required for this action.");
      return;
    }

    await handleStatusChange(targetCandidate.id, targetCandidate.status, remarksText);
    setRemarksDialogOpen(false);
  };

  const handleElectionFilterChange = (electionId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (electionId === "all") {
      newParams.delete("election");
    } else {
      newParams.set("election", electionId);
    }
    setSearchParams(newParams);
  };

  const handleStatusFilterChange = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status === "all") {
      newParams.delete("status");
    } else {
      newParams.set("status", status);
    }
    setSearchParams(newParams);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = candidates.length;
    const pending = candidates.filter(
      (c) =>
        c.status_name.toLowerCase() === "pending_approval" ||
        c.status_name.toLowerCase() === "pending" ||
        c.status_name.toLowerCase() === "nominated"
    ).length;
    const approved = candidates.filter(
      (c) => c.status_name.toLowerCase() === "approved"
    ).length;
    const rejected = candidates.filter(
      (c) =>
        c.status_name.toLowerCase() === "rejected" ||
        c.status_name.toLowerCase() === "withdrawn"
    ).length;
    return { total, pending, approved, rejected };
  }, [candidates]);

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.full_name.toLowerCase().includes(q) ||
        c.matriculation_number.toLowerCase().includes(q) ||
        c.position_name.toLowerCase().includes(q) ||
        (c.election_name && c.election_name.toLowerCase().includes(q));

      const statusLower = c.status_name.toLowerCase();
      let matchesStatus = true;
      if (statusFilter !== "all") {
        if (statusFilter === "pending") {
          matchesStatus =
            statusLower === "pending_approval" ||
            statusLower === "pending" ||
            statusLower === "nominated";
        } else {
          matchesStatus = statusLower === statusFilter.toLowerCase();
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Electoral Commission
                </span>
                <Badge variant="secondary" className="text-[10px] font-bold border-primary text-primary">
                  {roleName}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                Candidate Approval & Vetting Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Presiding review console for screening student nominations, examining manifestos and campaign media, and issuing binding ballot qualification rulings.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="gap-1.5 text-xs h-9"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/admin/elections")}
              className="gap-1.5 text-xs h-9"
            >
              <Vote className="h-3.5 w-3.5" />
              <span>All Elections</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Filed
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-foreground">{metrics.total}</span>
              <Award className="h-4 w-4 text-muted-foreground opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/30 bg-amber-500/5 shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
              Awaiting Vetting
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {metrics.pending}
              </span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
              Approved on Ballot
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {metrics.approved}
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-destructive/30 bg-destructive/5 shadow-xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-destructive uppercase tracking-wider block">
              Withheld / Rejected
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-destructive">{metrics.rejected}</span>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
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

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, matriculation number, office, or election..."
            className="pl-9 text-xs h-9"
          />
        </div>

        {/* Election Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedElectionId}
            onChange={(e) => handleElectionFilterChange(e.target.value)}
            aria-label="Filter by election"
            className="h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto"
          >
            <option value="all">All Contested Elections ({elections.length})</option>
            {elections.map((elec) => (
              <option key={elec.id} value={elec.id}>
                {elec.name} ({elec.status_name})
              </option>
            ))}
          </select>
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Statuses" },
            { id: "pending", label: "Pending Review" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
            { id: "withdrawn", label: "Withdrawn" },
          ].map((pill) => {
            const isSelected = statusFilter.toLowerCase() === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handleStatusFilterChange(pill.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidate Dossier List */}
      {loading ? (
        <div className="p-12 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs space-y-2">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary" />
          <p>Retrieving candidate vetting files from database...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card className="border border-border border-dashed p-10 text-center">
          <Award className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-foreground">
            {searchQuery || statusFilter !== "all" || selectedElectionId !== "all"
              ? "No Candidates Match the Filter Criteria"
              : "No Candidate Nominations on Record"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {searchQuery || statusFilter !== "all" || selectedElectionId !== "all"
              ? "Adjust your search terms, election scope, or status filter."
              : "Students will appear here once they complete candidate filing via the election contest portal."}
          </p>
          {(searchQuery || statusFilter !== "all" || selectedElectionId !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSearchParams({});
              }}
              className="text-xs mt-4 gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Reset All Filters</span>
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => {
            const statusLower = candidate.status_name.toLowerCase();
            const isApproved = statusLower === "approved";
            const isRejected = statusLower === "rejected";
            const isWithdrawn = statusLower === "withdrawn";
            const isPending =
              statusLower === "pending_approval" ||
              statusLower === "pending" ||
              statusLower === "nominated";
            const imageUrl = getImageUrl(candidate.photo_path);

            return (
              <Card
                key={candidate.id}
                className="border border-border bg-card shadow-xs transition-colors hover:border-primary/40 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Photo & Identity Column */}
                  <div className="w-full md:w-52 bg-muted/40 shrink-0 border-b md:border-b-0 md:border-r border-border p-4 flex flex-col items-center justify-center text-center">
                    <div className="h-28 w-28 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shadow-xs">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={candidate.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/60 gap-1">
                          <User className="h-8 w-8" />
                          <span className="text-[9px] uppercase font-bold tracking-wider">No Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block font-mono">
                        {candidate.matriculation_number}
                      </span>
                      <span className="text-[11px] font-medium text-foreground/80 block mt-0.5">
                        {candidate.department || "General Student Body"}
                      </span>
                    </div>
                  </div>

                  {/* Vetting Dossier Body */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <CardHeader className="p-5 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant={
                                  isApproved
                                    ? "default"
                                    : isPending
                                    ? "secondary"
                                    : "destructive"
                                }
                                className={`text-[10px] font-bold ${
                                  isApproved
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : isPending
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                    : ""
                                }`}
                              >
                                {candidate.status_name}
                              </Badge>

                              <Badge variant="secondary" className="text-[10px] font-semibold text-primary border-primary/30 bg-primary/5">
                                {candidate.election_name || "Active Election"}
                              </Badge>

                              <span className="text-xs font-bold text-primary">
                                Office: {candidate.position_name}
                              </span>
                            </div>

                            <CardTitle className="text-lg font-bold text-foreground mt-1.5">
                              {candidate.full_name}
                            </CardTitle>
                          </div>

                          {/* Quick Decision Actions (Admin & Electoral Officers) */}
                          {isAdmin && (
                            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto shrink-0">
                              {isCandidateFrozen(candidate) ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted/80 border border-border text-muted-foreground text-xs font-medium">
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                                  <span>Candidate Pool Frozen</span>
                                </div>
                              ) : (
                                <>
                                  {!isApproved && (
                                    <Button
                                      size="sm"
                                      onClick={() => openRemarksDialog(candidate, "Approved")}
                                      disabled={updatingId === candidate.id}
                                      className="h-8 text-xs gap-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Approve for Ballot</span>
                                    </Button>
                                  )}

                                  {!isRejected && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openRemarksDialog(candidate, "Rejected")}
                                      disabled={updatingId === candidate.id}
                                      className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10 border-destructive/30"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      <span>Reject</span>
                                    </Button>
                                  )}

                                  {!isWithdrawn && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openRemarksDialog(candidate, "Withdrawn")}
                                      disabled={updatingId === candidate.id}
                                      className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                    >
                                      <UserX className="h-3.5 w-3.5" />
                                      <span>Withdraw</span>
                                    </Button>
                                  )}

                                  {!isPending && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openRemarksDialog(candidate, "Pending_Approval")}
                                      disabled={updatingId === candidate.id}
                                      className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                      title="Reset candidate nomination back to Pending Approval"
                                    >
                                      <RotateCcw className="h-3.5 w-3.5" />
                                      <span>Reset</span>
                                    </Button>
                                  )}
                                </>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/admin/elections/${candidate.election_id}?tab=candidates`)}
                                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                title="Open election candidates console"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 pt-2 space-y-3">
                        {/* Campaign Slogan */}
                        {candidate.campaign_slogan && (
                          <div className="rounded-md bg-primary/5 border border-primary/15 px-3 py-1.5 text-xs text-primary font-semibold italic">
                            "{candidate.campaign_slogan}"
                          </div>
                        )}

                        {/* Manifesto */}
                        {candidate.manifesto ? (
                          <div className="rounded-md border border-border/70 bg-muted/20 p-3 text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1 text-[11px]">
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              <span>Candidate Manifesto & Vision:</span>
                            </div>
                            <p className="text-foreground/90 leading-relaxed italic text-[11px] whitespace-pre-wrap">
                              "{candidate.manifesto}"
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs italic">
                            No candidate manifesto submitted.
                          </p>
                        )}

                        {/* Remarks Box */}
                        {(candidate.approval_remarks || candidate.withdrawal_reason) && (
                          <div className="rounded-md border border-border/40 bg-muted/40 p-3 text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1 text-[11px]">
                              <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                              <span>
                                {isWithdrawn ? "Recorded Withdrawal Reason:" : "Official Vetting Remarks:"}
                              </span>
                            </div>
                            <p className="text-foreground/80 text-[11px]">
                              {candidate.approval_remarks || candidate.withdrawal_reason}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </div>

                    {/* Footer Timestamps */}
                    <div className="px-5 py-2.5 bg-muted/10 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
                      <span>Nominated: {new Date(candidate.created_at).toLocaleString()}</span>
                      {candidate.updated_at && (
                        <span>Last Vetting Action: {new Date(candidate.updated_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Vetting Determination Dialog */}
      <Dialog open={remarksDialogOpen} onOpenChange={setRemarksDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Vetting Ruling</DialogTitle>
            <DialogDescription>
              Transition nomination of <strong>{targetCandidate?.name}</strong> (Contesting:{" "}
              <strong>{targetCandidate?.position}</strong>) to status{" "}
              <Badge
                variant={
                  targetCandidate?.status === "Approved"
                    ? "default"
                    : targetCandidate?.status === "Rejected"
                    ? "destructive"
                    : "secondary"
                }
                className="ml-1 text-[10px] font-bold"
              >
                {targetCandidate?.status}
              </Badge>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
                <span>
                  {targetCandidate?.status === "Rejected" || targetCandidate?.status === "Withdrawn"
                    ? "Mandatory Reason / Vetting Remarks *"
                    : "Official Approval Remarks (Optional)"}
                </span>
                {(targetCandidate?.status === "Rejected" || targetCandidate?.status === "Withdrawn") && (
                  <span className="text-[10px] text-destructive font-semibold">Required</span>
                )}
              </label>
              <Textarea
                placeholder={
                  targetCandidate?.status === "Rejected"
                    ? "Document the specific grounds for disqualification (e.g. academic standing, incomplete screening)..."
                    : targetCandidate?.status === "Withdrawn"
                    ? "Document the grounds or authorization of candidate withdrawal..."
                    : "Enter any notes or stipulations regarding this qualification..."
                }
                value={remarksText}
                onChange={(e) => {
                  setRemarksText(e.target.value);
                  if (remarksError) setRemarksError(null);
                }}
                className="text-xs min-h-[110px]"
              />
              {remarksError && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{remarksError}</span>
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose className="h-9 px-3 rounded-md border border-border bg-background text-xs hover:bg-muted transition-colors">
              Cancel
            </DialogClose>
            <Button
              size="sm"
              onClick={submitWithRemarks}
              disabled={
                updatingId !== null ||
                ((targetCandidate?.status === "Rejected" || targetCandidate?.status === "Withdrawn") &&
                  !remarksText.trim())
              }
              className={`text-xs ${
                targetCandidate?.status === "Approved"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : targetCandidate?.status === "Rejected"
                  ? "bg-destructive hover:bg-destructive/90 text-white"
                  : ""
              }`}
            >
              Confirm Vetting Ruling
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
