import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useVoting } from "@/features/voting/context/VotingContext";
import { submitBallot } from "@/features/voting/services/votingService";
import {
  getElectionById,
  getElectionPositions,
  getApprovedCandidates,
  getStudentMatricNumber,
} from "@/features/elections/services/electionService";
import { getElectionStatus } from "@/features/elections/utils/electionUtils";
import type { Election, Position, Candidate } from "@/features/elections/types";

import { Breadcrumb } from "@/components/layouts/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Send,
  Loader2,
  Check,
  CircleSlash,
  Edit3,
} from "lucide-react";

/**
 * ReviewPage (B47, B48)
 * Route: /elections/:id/review
 *
 * Responsibilities:
 * - Display all positions in the election.
 * - For a selected position: display chosen candidate with details.
 * - For an unselected position: display "No candidate selected — Abstention".
 * - Allow the voter to navigate back to /elections/:id/ballot to change selections.
 * - Final confirmation dialog (B47):
 *     Ballot -> Review -> Confirmation Dialog -> Final Submission
 * - Submission UX (B48):
 *     Validate payload, call submitBallot service abstraction, handle errors.
 *     NO-MOCK RULE: Real completion (/elections/:id/completed) is reached ONLY
 *     upon an authentic backend success response.
 */
export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selections, setSubmissionResult } = useVoting();

  const [election, setElection] = useState<Election | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog & Submission States
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviewData() {
      if (!id) return;
      setIsLoading(true);
      setError(null);

      try {
        const matricNumber = user ? await getStudentMatricNumber(user.id, user.email) : null;
        const electionData = await getElectionById(id, matricNumber);
        if (!electionData) {
          setError("The requested election could not be found.");
          setIsLoading(false);
          return;
        }

        const status = getElectionStatus(electionData);
        if (status !== "Open" && status !== "Active") {
          setError(
            `Review unavailable. Election is not currently active (status: ${status}).`
          );
          setElection(electionData);
          setIsLoading(false);
          return;
        }

        const [positionsData, candidatesData] = await Promise.all([
          getElectionPositions(id),
          getApprovedCandidates(id),
        ]);

        setElection(electionData);
        setPositions(positionsData);
        setCandidates(candidatesData);
      } catch (err) {
        console.error("Failed to load review data:", err);
        setError("Failed to load ballot data for review. Please retry.");
      } finally {
        setIsLoading(false);
      }
    }

    loadReviewData();
  }, [id, user]);

  const handleConfirmSubmit = async () => {
    if (!election) return;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Dispatch to voting service boundary
      const result = await submitBallot({
        electionId: election.id,
        selections,
      });

      if (result.success) {
        // Authoritative backend success received
        setSubmissionResult(result);
        setIsConfirmDialogOpen(false);
        navigate(`/elections/${election.id}/completed`);
      } else {
        // Submission failed or backend engine not yet deployed
        // Preserve in-memory selections so user does not lose their ballot
        setSubmissionError(
          result.error ||
            "Unable to record vote submission. Please verify your connection and retry."
        );
        setIsConfirmDialogOpen(false);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmissionError(
        "A network or system error occurred during submission. Your selections are preserved."
      );
      setIsConfirmDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-28 w-full rounded-lg" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <Alert variant="error">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Review Unavailable</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>{error || "Election could not be loaded."}</p>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/elections/${id}`)}
                className="text-xs"
              >
                Return to Election Overview
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedCount = Object.keys(selections).length;
  const totalPositions = positions.length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Elections", href: "/elections" },
          { label: election.title, href: `/elections/${election.id}` },
          { label: "Ballot", href: `/elections/${election.id}/ballot` },
          { label: "Review Choices" },
        ]}
      />

      {/* Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>The Polytechnic, Ibadan &bull; Official Ballot Review</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Review Your Selections
        </h1>
        <p className="text-sm text-muted-foreground">
          Please carefully verify your choices for each contested office. Once submitted, this submission is final.
        </p>
      </div>

      {/* Submission Error Banner */}
      {submissionError && (
        <Alert variant="error">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Submission Not Completed</AlertTitle>
          <AlertDescription className="mt-1.5 space-y-2 text-xs">
            <p>{submissionError}</p>
            <p className="font-medium text-foreground">
              Your ballot selections remain intact in memory. You may review them or retry when the service is ready.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Irreversible Submission Notice Card */}
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Final Vote Confirmation</p>
          <p className="leading-relaxed">
            Pursuant to approved institutional election regulations (SRS Section 9.2.3), submitted votes cannot be altered, recalled, or re-cast. Ensure all selections below accurately reflect your intent before confirming.
          </p>
        </div>
      </div>

      {/* Review Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-lg font-bold text-foreground">
            Offices &amp; Selected Candidates ({selectedCount} of {totalPositions} selected)
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/elections/${election.id}/ballot`)}
            className="text-xs gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Selections on Ballot
          </Button>
        </div>

        <div className="space-y-3">
          {positions.map((position) => {
            const selectedCandidateId = selections[position.id];
            const candidate = candidates.find((c) => c.id === selectedCandidateId);

            return (
              <Card
                key={position.id}
                className={`border transition-all ${
                  candidate
                    ? "border-border bg-card shadow-xs"
                    : "border-dashed border-border bg-muted/20"
                }`}
              >
                <CardHeader className="py-4 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Elective Office
                      </span>
                      <CardTitle className="text-base font-bold text-foreground">
                        {position.name}
                      </CardTitle>
                    </div>

                    {candidate ? (
                      /* Selected Candidate Display */
                      <div className="flex items-center gap-3 p-2 rounded-md bg-primary/5 border border-primary/20">
                        <Avatar className="h-9 w-9 border border-primary/30 shrink-0">
                          {candidate.candidate_details?.photo_path && (
                            <AvatarImage
                              src={candidate.candidate_details.photo_path}
                              alt={
                                candidate.student
                                  ? `${candidate.student.first_name || ""} ${candidate.student.last_name || ""}`.trim()
                                  : "Candidate"
                              }
                            />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {candidate.student
                              ? `${candidate.student.first_name?.[0] || ""}${candidate.student.last_name?.[0] || ""}`
                              : "C"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {candidate.student
                              ? `${candidate.student.first_name || ""} ${candidate.student.last_name || ""}`.trim()
                              : "Candidate Name"}
                          </p>
                          {candidate.student?.matric_number && (
                            <p className="text-[11px] font-mono text-muted-foreground">
                              {candidate.student.matric_number}
                            </p>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded ml-auto shrink-0">
                          <Check className="h-3 w-3" />
                          Selected
                        </span>
                      </div>
                    ) : (
                      /* Abstention Display (B47 requirement) */
                      <div className="flex items-center gap-2 text-xs italic text-muted-foreground py-1 px-3 rounded bg-muted/40 border border-border">
                        <CircleSlash className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>No candidate selected &mdash; Abstention</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-border pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/elections/${election.id}/ballot`)}
          className="text-xs gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ballot
        </Button>

        <Button
          onClick={() => setIsConfirmDialogOpen(true)}
          disabled={isSubmitting}
          className="text-xs gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Vote...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Official Ballot
            </>
          )}
        </Button>
      </div>

      {/* Final Submission Confirmation Dialog (B47) */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Permanent Final Action
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Confirm Final Vote Submission
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-2 space-y-2">
              <p>
                You are about to submit your official ballot for{" "}
                <strong className="text-foreground">{election.title}</strong>.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>
                  <strong>{selectedCount}</strong> office(s) selected;{" "}
                  <strong>{totalPositions - selectedCount}</strong> office(s) abstained.
                </li>
                <li>This submission is final.</li>
                <li>Submitted selections cannot be edited, recalled, or re-cast.</li>
                <li>Your ballot is anonymized and unlinked from your student identity.</li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel &amp; Review Again
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="text-xs gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Recording Vote...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Confirm &amp; Submit Ballot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
