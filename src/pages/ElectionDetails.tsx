import { useEffect, useState } from "react";
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

  const [refreshIndex, setRefreshIndex] = useState(0);
  const countdownText = useLiveCountdown(election);

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

  // Group approved candidates by position
  const candidatesByPosition: Record<string, Candidate[]> = {};
  positions.forEach((pos) => {
    candidatesByPosition[pos.id] = candidates.filter(
      (c) => c.position_id === pos.id
    );
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
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

      {(status === "Closed" || status === "Ended") && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-foreground/[0.03] text-foreground/80 text-sm">
          <div className="flex items-start sm:items-center gap-3">
            <Clock className="h-5 w-5 shrink-0 text-foreground/50 mt-0.5 sm:mt-0" />
            <div>
              <strong>Voting Concluded:</strong> This election officially closed at{" "}
              {formatElectionDate(election.end_datetime)}. Ballot submissions are no
              longer accepted.
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
        <Card className="border border-primary/30 bg-primary/5 p-4 rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Your Candidacy Filing
                </span>
                <Badge
                  variant={
                    candidacy.status_name.toLowerCase() === "approved"
                      ? "success"
                      : candidacy.status_name.toLowerCase().includes("pending")
                      ? "warning"
                      : "destructive"
                  }
                  className="text-[10px]"
                >
                  Status: {candidacy.status_name}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">
                Contesting for: {candidacy.position_name}
              </h3>
              {candidacy.campaign_slogan && (
                <p className="text-xs text-muted-foreground italic">
                  "{candidacy.campaign_slogan}"
                </p>
              )}
              {candidacy.manifesto && (
                <div className="pt-1 text-xs text-foreground/80 line-clamp-2">
                  <strong>Manifesto:</strong> {candidacy.manifesto}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground sm:text-right shrink-0">
              <span>Submitted: {new Date(candidacy.created_at).toLocaleDateString()}</span>
              {candidacy.status_name.toLowerCase().includes("pending") && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                  Awaiting Electoral Officer Vetting
                </p>
              )}
              {candidacy.status_name.toLowerCase() === "approved" && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                  Ballot Eligible (Approved)
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Candidacy Application CTA if not already applied and prior to voting window opening */}
      {!candidacy && (status === "Draft" || status === "Scheduled" || status === "Upcoming") && (
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
            onClick={() => setApplyDialogOpen(true)}
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
      {!candidacy && (status === "Open" || status === "Active" || status === "Closed" || status === "Ended" || status === "Published") && (
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
                The electoral committee has not yet published elective positions for this election.
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
                      {posCandidates.map((candidate) => {
                        const candidateName = candidate.student
                          ? (candidate.student.full_name || 
                             `${candidate.student.first_name || ""} ${candidate.student.last_name || ""}`.trim() ||
                             candidate.student.matriculation_number ||
                             "Candidate")
                          : "Candidate";

                        const initials = candidateName
                          .split(" ")
                          .map((n) => n[0])
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
                                    src={candidate.candidate_details.photo_path}
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
                      src={selectedCandidate.candidate_details.photo_path}
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
      {resolvedStudentId && resolvedMatric && (
        <CandidateApplicationDialog
          isOpen={applyDialogOpen}
          onClose={() => setApplyDialogOpen(false)}
          electionId={election.id}
          electionTitle={election.title}
          positions={positions}
          studentId={resolvedStudentId}
          matricNumber={resolvedMatric}
          onSuccess={() => setRefreshIndex((p) => p + 1)}
        />
      )}
    </div>
  );
}
