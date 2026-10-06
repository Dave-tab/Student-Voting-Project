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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { getImageUrl } from "@/utils/imageUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { SelectedCandidatePreview } from "@/features/voting/components/SelectedCandidatePreview";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Send,
  Loader2,
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
              <div key={position.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Elective Office:
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {position.name}
                    </span>
                  </div>
                </div>

                {candidate ? (
                  <SelectedCandidatePreview candidate={candidate} position={position} />
                ) : (
                  <div className="flex items-center gap-2 text-xs italic text-muted-foreground py-3 px-4 rounded-xl bg-muted/30 border border-dashed border-border">
                    <CircleSlash className="h-4 w-4 text-muted-foreground" />
                    <span>No candidate selected for this office &mdash; Abstention</span>
                  </div>
                )}
              </div>
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

      {/* Final Submission Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Official Ballot Confirmation
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Confirm Final Vote Submission
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-2 space-y-3">
              <div>
                You are about to submit your official ballot for{" "}
                <strong className="text-foreground">{election.title}</strong>.
              </div>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>
                  <strong>{selectedCount}</strong> office(s) selected;{" "}
                  <strong>{totalPositions - selectedCount}</strong> office(s) abstained.
                </li>
                <li>This submission is final.</li>
                <li>Submitted selections cannot be edited, recalled, or re-cast.</li>
                <li>Your ballot is anonymized and unlinked from your student identity.</li>
              </ul>

              {/* Photo Preview of Selected Candidates */}
              {selectedCount > 0 && (
                <div className="pt-2 border-t border-border space-y-2">
                  <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                    Selected Candidates Photo Review:
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 rounded-md bg-muted/40 border border-border">
                    {positions
                      .filter((p) => selections[p.id])
                      .map((p) => {
                        const cand = candidates.find((c) => c.id === selections[p.id]);
                        if (!cand) return null;
                        const name =
                          cand.student?.full_name ||
                          `${cand.student?.first_name || ""} ${cand.student?.last_name || ""}`.trim() ||
                          "Candidate";
                        const photo = cand.candidate_details?.photo_path;
                        return (
                          <div
                            key={p.id}
                            className="flex items-center gap-2 p-1.5 rounded-md bg-background border border-border text-xs"
                          >
                            <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                              {photo && <AvatarImage src={getImageUrl(photo) || ""} alt={name} />}
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                {name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 pr-1">
                              <p className="text-[11px] font-semibold text-foreground truncate">{name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{p.name}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
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
