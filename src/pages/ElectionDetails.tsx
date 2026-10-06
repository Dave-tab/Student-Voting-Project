import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import {
  getElectionById,
  getElectionPositions,
  getApprovedCandidates,
  getStudentMatricNumber,
  getStudentCandidacy,
  type StudentCandidacyStatus,
} from "@/features/elections/services/electionService";
import { CandidateApplicationDialog } from "@/features/elections/components/CandidateApplicationDialog";
import { supabase } from "@/lib/supabase";
import type { Election, Position, Candidate } from "@/features/elections/types";
import { getImageUrl } from "@/utils/imageUtils";
import {
  getElectionStatus,
  getElectionStatusBadgeConfig,
  formatElectionDate,
} from "@/features/elections/utils/electionUtils";
import { useLiveCountdown } from "@/features/elections/hooks/useLiveCountdown";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/EmptyState";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Breadcrumb } from "@/components/layouts/Breadcrumb";
import {
  Calendar,
  Clock,
  ArrowLeft,
  AlertTriangle,
  UserCheck,
  Building2,
  GraduationCap,
  FileText,
  Quote,
  ShieldAlert,
  Info,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Edit3,
  UserX,
  Award,
} from "lucide-react";

export default function ElectionDetails() {
  const { id: electionId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [election, setElection] = useState<Election | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Modal dialog state for candidate details
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Student candidate application states
  const [resolvedStudentId, setResolvedStudentId] = useState<string | null>(null);
  const [resolvedMatric, setResolvedMatric] = useState<string | null>(null);
  const [candidacy, setCandidacy] = useState<StudentCandidacyStatus | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "redo" | "edit">("create");

  interface CandidateAppSnapshot {
    mode: "create" | "redo" | "edit";
    positions: Position[];
    studentId: string;
    matricNumber: string;
    existingCandidateId?: string;
    initialPositionId?: string;
    initialCampaignSlogan: string;
    initialManifesto: string;
    initialPhotoPath: string;
    rejectionRemarks?: string;
  }

  const [applicationSnapshot, setApplicationSnapshot] = useState<CandidateAppSnapshot | null>(null);

  const [refreshIndex, setRefreshIndex] = useState(0);
  const countdownText = useLiveCountdown(election);

  const handleOpenApplyDialog = () => {
    setDialogMode("create");
    setApplicationSnapshot({
      mode: "create",
      positions,
      studentId: resolvedStudentId || "",
      matricNumber: resolvedMatric || "",
      initialCampaignSlogan: "",
      initialManifesto: "",
      initialPhotoPath: "",
    });
    setApplyDialogOpen(true);
  };

  const handleOpenRedoDialog = () => {
    setDialogMode("redo");
    setApplicationSnapshot({
      mode: "redo",
      positions,
      studentId: resolvedStudentId || "",
      matricNumber: resolvedMatric || "",
      existingCandidateId: candidacy?.id,
      initialPositionId: candidacy?.position_id,
      initialCampaignSlogan: candidacy?.campaign_slogan || "",
      initialManifesto: candidacy?.manifesto || "",
      initialPhotoPath: candidacy?.photo_path || "",
      rejectionRemarks: candidacy?.approval_remarks || undefined,
    });
    setApplyDialogOpen(true);
  };

  const handleOpenEditDialog = () => {
    setDialogMode("edit");
    setApplicationSnapshot({
      mode: "edit",
      positions,
      studentId: resolvedStudentId || "",
      matricNumber: resolvedMatric || "",
      existingCandidateId: candidacy?.id,
      initialPositionId: candidacy?.position_id,
      initialCampaignSlogan: candidacy?.campaign_slogan || "",
      initialManifesto: candidacy?.manifesto || "",
      initialPhotoPath: candidacy?.photo_path || "",
    });
    setApplyDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setApplyDialogOpen(false);
    setApplicationSnapshot(null);
  };

  const handleOnSuccess = useCallback(() => setRefreshIndex((p) => p + 1), []);

  const activeSnapshot = applicationSnapshot || {
    mode: dialogMode,
    positions,
    studentId: resolvedStudentId || "",
    matricNumber: resolvedMatric || "",
    existingCandidateId: candidacy?.id,
    initialPositionId: candidacy?.position_id,
    initialCampaignSlogan: candidacy?.campaign_slogan || "",
    initialManifesto: candidacy?.manifesto || "",
    initialPhotoPath: candidacy?.photo_path || "",
    rejectionRemarks: candidacy?.approval_remarks || undefined,
  };

  const applicationDialog = election ? (
    <CandidateApplicationDialog
      key={`candidate-app-${election.id}`}
      isOpen={applyDialogOpen}
      onClose={handleCloseDialog}
      electionId={election.id}
      electionTitle={election.title}
      positions={activeSnapshot.positions}
      studentId={activeSnapshot.studentId}
      matricNumber={activeSnapshot.matricNumber}
      mode={activeSnapshot.mode}
      existingCandidateId={activeSnapshot.existingCandidateId}
      initialPositionId={activeSnapshot.initialPositionId}
      initialCampaignSlogan={activeSnapshot.initialCampaignSlogan}
      initialManifesto={activeSnapshot.initialManifesto}
      initialPhotoPath={activeSnapshot.initialPhotoPath}
      rejectionRemarks={activeSnapshot.rejectionRemarks}
      onSuccess={handleOnSuccess}
    />
  ) : null;

  // Real-time synchronization for candidate filings and committee vetting determinations
  useEffect(() => {
    if (!electionId) return;

    const channel = supabase
      .channel(`election-${electionId}-live-sync`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "candidates",
          filter: `election_id=eq.${electionId}`,
        },
        () => {
          setRefreshIndex((p) => p + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "candidate_details",
        },
        () => {
          setRefreshIndex((p) => p + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [electionId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!electionId) return;
      setLoading(true);
      setError(null);

      try {
        const matricNumber = user
          ? await getStudentMatricNumber(user.id, user.email)
          : null;

        const electionData = await getElectionById(electionId, matricNumber);
        if (!isMounted) return;

        if (!electionData) {
          setElection(null);
          setLoading(false);
          return;
        }
        setElection(electionData);

        const positionsData = await getElectionPositions(electionId);
        if (!isMounted) return;
        setPositions(positionsData);

        const candidatesData = await getApprovedCandidates(electionId);
        if (!isMounted) return;
        setCandidates(candidatesData);

        // Fetch student's own candidacy if authenticated
        if (user?.id) {
          const { data: std } = await supabase
            .from("students")
            .select("id, matriculation_number")
            .eq("user_id", user.id)
            .maybeSingle();

          if (std?.id && isMounted) {
            setResolvedStudentId(std.id);
            setResolvedMatric(std.matriculation_number);
            const cand = await getStudentCandidacy(electionId, std.id);
            if (isMounted) setCandidacy(cand);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("Error loading election details:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unable to load election details from the database. Please verify connection.";
        setError(errorMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [electionId, user, refreshIndex]);

  const handleOpenCandidateDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6" aria-busy="true">
        {applicationDialog}
        <Skeleton className="h-6 w-48" />
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-7 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {applicationDialog}
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Elections", href: "/elections" },
            { label: "Election Details" },
          ]}
        />
        <Alert variant="error">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading election details</AlertTitle>
          <AlertDescription className="mt-1 flex flex-col gap-2">
            <span>{error}</span>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRefreshIndex((prev) => prev + 1)}
                className="mt-2 text-xs"
              >
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {applicationDialog}
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Elections", href: "/elections" },
            { label: "Not Found" },
          ]}
        />
        <Card className="border border-border bg-background">
          <EmptyState>
            <EmptyStateIcon>
              <ShieldAlert className="h-10 w-10" />
            </EmptyStateIcon>
            <EmptyStateTitle>Election Unavailable or Ineligible</EmptyStateTitle>
            <EmptyStateDescription>
              This election could not be found, or your matriculation credentials are not registered on the official voter register for this election.
            </EmptyStateDescription>
            <div className="mt-4">
              <Button
                onClick={() => navigate("/elections")}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Eligible Elections
              </Button>
            </div>
          </EmptyState>
        </Card>
      </div>
    );
  }

  const status = getElectionStatus(election);
  const badgeConfig = getElectionStatusBadgeConfig(status);
  const isCandidatePoolFrozen = status !== "Draft" && status !== "Scheduled" && status !== "Upcoming";

  // Group approved candidates by position
  const candidatesByPosition: Record<string, Candidate[]> = {};
  positions.forEach((pos) => {
    candidatesByPosition[pos.id] = candidates.filter(
      (c) => c.position_id === pos.id
    );
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {applicationDialog}
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Elections", href: "/elections" },
          { label: election.title },
        ]}
      />

      {/* Back Button */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/elections")}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Eligible Elections
        </Button>
      </div>

      {/* Lifecycle Banner (B44) */}
      {(status === "Scheduled" || status === "Upcoming") && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 text-sm">
          <Info className="h-5 w-5 shrink-0" />
          <div>
            <strong>Scheduled Election:</strong> Voting is not currently open. The
            ballot window begins on{" "}
            {formatElectionDate(election.start_datetime)}. Candidate manifestos are
            available for review below.
          </div>
        </div>
      )}

      {(status === "Open" || status === "Active") && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-green-500/20 bg-green-500/10 text-green-800 dark:text-green-300 text-sm">
          <div className="flex items-start sm:items-center gap-3">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <strong>Active Election:</strong> Voting is officially in progress.
              Review candidates below and proceed to the official ballot to cast your vote.
            </div>
          </div>
          <Button
            onClick={() => navigate(`/elections/${election.id}/ballot`)}
            className="w-full sm:w-auto shrink-0 font-semibold shadow-sm"
          >
            Proceed to Ballot
          </Button>
        </div>
      )}

      {(status === "Results Available" || status === "Published" || status === "Closed" || status === "Ended") && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-foreground/[0.03] text-foreground/80 text-sm">
          <div className="flex items-start sm:items-center gap-3">
            <Clock className="h-5 w-5 shrink-0 text-foreground/50 mt-0.5 sm:mt-0" />
            <div>
              <strong>Official Results Available:</strong> Voting has concluded and official results have been compiled.
            </div>
          </div>
          <Button
            onClick={() => navigate(`/elections/${election.id}/results`)}
            className="w-full sm:w-auto shrink-0 font-semibold shadow-xs text-xs gap-1.5"
            variant="default"
          >
            <Award className="h-4 w-4" />
            View Official Results
          </Button>
        </div>
      )}

      {status === "Archived" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-foreground/[0.02] text-foreground/70 text-sm">
          <div className="flex items-start sm:items-center gap-3">
            <Info className="h-5 w-5 shrink-0 text-foreground/40 mt-0.5 sm:mt-0" />
            <div>
              <strong>Archived Record:</strong> This election is permanently archived
              for institutional audit and historical records.
            </div>
          </div>
          <Button
            onClick={() => navigate(`/elections/${election.id}/results`)}
            className="w-full sm:w-auto shrink-0 text-xs gap-1.5"
            variant="outline"
          >
            <Award className="h-4 w-4" />
            View Archived Results
          </Button>
        </div>
      )}

      {/* Student Candidacy Filing Card */}
      {candidacy && (
        <Card className="border border-primary/30 bg-primary/5 p-5 rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Your Candidacy Filing
                </span>
                <Badge
                  variant={
                    candidacy.status_name.toLowerCase() === "approved"
                      ? "default"
                      : candidacy.status_name.toLowerCase().includes("pending")
                      ? "secondary"
                      : "destructive"
                  }
                  className={`text-[10px] font-bold ${
                    candidacy.status_name.toLowerCase() === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : candidacy.status_name.toLowerCase().includes("pending")
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : ""
                  }`}
                >
                  Status: {candidacy.status_name}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">
                  Contesting for: {candidacy.position_name}
                </h3>
                {candidacy.campaign_slogan && (
                  <p className="text-xs text-muted-foreground italic mt-0.5">
                    "{candidacy.campaign_slogan}"
                  </p>
                )}
              </div>

              {candidacy.manifesto && (
                <div className="text-xs text-foreground/80 line-clamp-3 bg-card/60 p-2.5 rounded-md border border-border/50">
                  <strong className="text-foreground">Manifesto Summary:</strong> {candidacy.manifesto}
                </div>
              )}

              {/* If Rejected: Show Vetting Remarks & Redo Action */}
              {candidacy.status_name.toLowerCase() === "rejected" && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 space-y-2 text-xs text-destructive">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                    <span>Nomination Determination: Disqualified / Rejected</span>
                  </div>
                  {candidacy.approval_remarks ? (
                    <div className="bg-background/80 p-2.5 rounded border border-destructive/20 text-foreground text-[11px] leading-relaxed">
                      <strong className="text-destructive font-semibold">Electoral Commission Remarks:</strong> "{candidacy.approval_remarks}"
                    </div>
                  ) : (
                    <p className="text-[11px] text-foreground/80">
                      Your application was not approved during vetting.
                    </p>
                  )}
                  <div className="pt-1">
                    {!isCandidatePoolFrozen ? (
                      <Button
                        size="sm"
                        onClick={handleOpenRedoDialog}
                        className="gap-1.5 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-white"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Redo &amp; Resubmit Application</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium pt-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>Candidate nomination window is permanently closed for this election.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* If Withdrawn: Show Notice and Re-apply Action */}
              {candidacy.status_name.toLowerCase() === "withdrawn" && (
                <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-muted-foreground">
                    <UserX className="h-4 w-4 shrink-0" />
                    <span>Candidacy Withdrawn</span>
                  </div>
                  {candidacy.withdrawal_reason && (
                    <p className="text-[11px] text-muted-foreground italic">
                      Recorded Reason: "{candidacy.withdrawal_reason}"
                    </p>
                  )}
                  <div className="pt-1">
                    {!isCandidatePoolFrozen ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleOpenRedoDialog}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Re-apply to Contest</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium pt-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>Candidate nomination window is permanently closed for this election.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* If Pending: Allow Editing prior to freeze */}
              {candidacy.status_name.toLowerCase().includes("pending") && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {!isCandidatePoolFrozen ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOpenEditDialog}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Nomination Filing</span>
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium pt-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>Nomination filings and determinations are permanently frozen for active/concluded elections.</span>
                    </div>
                  )}
                </div>
              )}

              {/* If Approved: Official Contestant Confirmation */}
              {candidacy.status_name.toLowerCase() === "approved" && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Official Ballot Contestant:</strong> Your candidacy has been officially approved by the Electoral Commission for <strong>{candidacy.position_name}</strong>. Your profile is published on the ballot and contestant roster below.
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground sm:text-right shrink-0">
              <span>Submitted: {new Date(candidacy.created_at).toLocaleDateString()}</span>
              {candidacy.status_name.toLowerCase().includes("pending") && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1">
                  Awaiting Electoral Officer Vetting
                </p>
              )}
              {candidacy.status_name.toLowerCase() === "approved" && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                  Ballot Qualified (Approved)
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Candidacy Application CTA if not already applied and prior to voting window opening */}
      {!candidacy && !isCandidatePoolFrozen && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-primary/30 bg-card shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Award className="h-4 w-4" />
              <span>Student Leadership &amp; Governance</span>
            </div>
            <h3 className="text-base font-bold text-foreground">
              Interested in Running for Office?
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              Eligible students appearing on the voter register may submit a candidate nomination for elective positions before the election opens.
            </p>
          </div>
          <Button
            onClick={handleOpenApplyDialog}
            disabled={!resolvedStudentId || positions.length === 0}
            className="shrink-0 gap-1.5 text-xs font-semibold"
            size="sm"
          >
            <Award className="h-3.5 w-3.5" />
            <span>File Candidacy Application</span>
          </Button>
        </div>
      )}

      {/* Candidacy Application Closed Message (Decision 2) */}
      {!candidacy && isCandidatePoolFrozen && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 text-muted-foreground text-sm italic">
          <Info className="h-4 w-4 shrink-0" />
          <span>Candidate applications are closed for this election.</span>
        </div>
      )}

      {/* Election Header Card (B42) */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                The Polytechnic, Ibadan &bull; Official Institutional Ballot
              </span>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                {election.title}
              </CardTitle>
            </div>
            <Badge variant={badgeConfig.variant} className="self-start text-xs shrink-0">
              {badgeConfig.label}
            </Badge>
          </div>

          {election.description && (
            <CardDescription className="text-base text-muted-foreground">
              {election.description}
            </CardDescription>
          )}

          {/* Timing & Presentation Countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                <strong className="text-foreground font-semibold">Timeline:</strong>{" "}
                {formatElectionDate(election.start_datetime)} &ndash;{" "}
                {formatElectionDate(election.end_datetime)}
              </span>
            </div>
            {countdownText && (
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>{countdownText}</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Elective Positions & Approved Candidates (B42 & B43) */}
      <div className="space-y-6">
        <div className="border-b border-border pb-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Elective Positions &amp; Candidates ({positions.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Contested offices arranged in ballot display sequence. Only committee-approved candidates appear below.
          </p>
        </div>

        {positions.length === 0 ? (
          <Card className="border border-border bg-card">
            <EmptyState>
              <EmptyStateIcon>
                <UserCheck className="h-8 w-8 text-muted-foreground" />
              </EmptyStateIcon>
              <EmptyStateTitle>No Positions Configured</EmptyStateTitle>
              <EmptyStateDescription>
                The platform has not yet published elective positions for this election.
              </EmptyStateDescription>
            </EmptyState>
          </Card>
        ) : (
          <div className="space-y-8">
            {positions.map((pos) => {
              const posCandidates = candidatesByPosition[pos.id] || [];

              return (
                <div key={pos.id} className="space-y-4">
                  {/* Position Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-l-2 border-primary pl-3 py-0.5">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {pos.name}
                      </h3>
                      {pos.description && (
                        <p className="text-xs text-muted-foreground">
                          {pos.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium self-start sm:self-auto">
                      {posCandidates.length}{" "}
                      {posCandidates.length === 1 ? "Candidate" : "Candidates"}
                    </span>
                  </div>

                  {/* Candidates Roster */}
                  {posCandidates.length === 0 ? (
                    <div className="p-4 rounded-md border border-border bg-muted/20 text-xs text-muted-foreground italic">
                      No approved candidates registered for this position.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {posCandidates.map((candidate: Candidate) => {
                        const candidateName = candidate.student
                          ? (candidate.student.full_name || 
                             `${candidate.student.first_name || ""} ${candidate.student.last_name || ""}`.trim() ||
                             candidate.student.matriculation_number ||
                             "Candidate")
                          : "Candidate";

                        const initials = candidateName
                          .split(" ")
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "C";

                        const slogan = candidate.candidate_details?.campaign_slogan;

                        return (
                          <Card
                            key={candidate.id}
                            className="border border-border bg-card shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
                          >
                            <CardHeader className="flex flex-row items-start gap-4 pb-3">
                              <Avatar className="h-12 w-12 border border-border shrink-0">
                                {candidate.candidate_details?.photo_path && (
                                  <AvatarImage
                                    src={getImageUrl(candidate.candidate_details.photo_path) || ""}
                                    alt={candidateName}
                                  />
                                )}
                                <AvatarFallback className="font-semibold text-sm">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>

                              <div className="space-y-1 overflow-hidden">
                                <CardTitle className="text-base font-bold text-foreground truncate">
                                  {candidateName}
                                </CardTitle>
                                {candidate.student?.matriculation_number && (
                                  <p className="text-xs font-mono text-muted-foreground">
                                    {candidate.student.matriculation_number}
                                  </p>
                                )}
                                {(candidate.student?.department ||
                                  candidate.student?.level) && (
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-0.5">
                                    {candidate.student.department && (
                                      <span className="inline-flex items-center gap-1">
                                        <Building2 className="h-3 w-3 text-muted-foreground" />
                                        {candidate.student.department}
                                      </span>
                                    )}
                                    {candidate.student.level && (
                                      <span className="inline-flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                                        {candidate.student.level}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardHeader>

                            <CardContent className="pt-0 space-y-3">
                              {slogan && (
                                <div className="p-2.5 rounded bg-muted/40 border border-border text-xs italic text-foreground flex items-start gap-1.5">
                                  <Quote className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
                                  <span className="line-clamp-2">"{slogan}"</span>
                                </div>
                              )}
                            </CardContent>

                            <div className="border-t border-border bg-muted/15 px-6 py-3 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground font-medium">
                                Status: Approved
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenCandidateDialog(candidate)}
                                className="gap-1.5 text-xs"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                View Manifesto &amp; Profile
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Details Dialog (B43) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedCandidate && (
          <DialogContent className="sm:max-w-xl">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-border shrink-0">
                  {selectedCandidate.candidate_details?.photo_path && (
                    <AvatarImage
                      src={getImageUrl(selectedCandidate.candidate_details.photo_path) || ""}
                      alt="Candidate"
                    />
                  )}
                  <AvatarFallback className="font-bold text-lg">
                    {selectedCandidate.student
                      ? (selectedCandidate.student.full_name || 
                         `${selectedCandidate.student.first_name || ""} ${selectedCandidate.student.last_name || ""}`.trim() ||
                         selectedCandidate.student.matriculation_number ||
                         "C")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    {selectedCandidate.student
                      ? (selectedCandidate.student.full_name ||
                         `${selectedCandidate.student.first_name || ""} ${selectedCandidate.student.last_name || ""}`.trim() ||
                         selectedCandidate.student.matriculation_number ||
                         "Candidate")
                      : "Candidate"}
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-1">
                    Candidate for{" "}
                    <strong>
                      {positions.find(
                        (p) => p.id === selectedCandidate.position_id
                      )?.name || "Elective Position"}
                    </strong>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              {/* Academic Details */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-md bg-muted/40 border border-border text-xs">
                <div>
                  <span className="text-muted-foreground block">Department</span>
                  <span className="font-semibold text-foreground">
                    {selectedCandidate.student?.department || "General"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Study Level</span>
                  <span className="font-semibold text-foreground">
                    {selectedCandidate.student?.level || "N/A"}
                  </span>
                </div>
                {selectedCandidate.student?.matriculation_number && (
                  <div>
                    <span className="text-muted-foreground block">Matric Number</span>
                    <span className="font-mono text-foreground font-semibold">
                      {selectedCandidate.student.matriculation_number}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground block">Candidate Status</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Approved Contender
                  </span>
                </div>
              </div>

              {/* Campaign Slogan */}
              {selectedCandidate.candidate_details?.campaign_slogan && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Campaign Slogan
                  </h4>
                  <p className="p-3 rounded-md bg-muted/40 border border-border text-sm italic text-foreground font-medium">
                    "{selectedCandidate.candidate_details.campaign_slogan}"
                  </p>
                </div>
              )}

              {/* Manifesto */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Candidate Manifesto
                </h4>
                <div className="max-h-60 overflow-y-auto p-4 rounded-md bg-muted/30 border border-border text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {selectedCandidate.candidate_details?.manifesto ||
                    "The candidate has not provided an extended manifesto statement."}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <DialogClose className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Close Profile
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Candidate Nomination Application Modal */}
      <CandidateApplicationDialog
        isOpen={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        electionId={election.id}
        electionTitle={election.title}
        positions={positions}
        studentId={resolvedStudentId || ""}
        matricNumber={resolvedMatric || ""}
        mode={dialogMode}
        existingCandidateId={candidacy?.id}
        initialPositionId={candidacy?.position_id}
        initialCampaignSlogan={candidacy?.campaign_slogan || ""}
        initialManifesto={candidacy?.manifesto || ""}
        initialPhotoPath={candidacy?.photo_path || ""}
        rejectionRemarks={candidacy?.approval_remarks || undefined}
        onSuccess={handleOnSuccess}
      />
    </div>
  );
}
