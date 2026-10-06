import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useVoting } from "@/features/voting/context/VotingContext";
import {
  getElectionById,
  getElectionPositions,
  getApprovedCandidates,
  getStudentMatricNumber,
} from "@/features/elections/services/electionService";
import {
  getElectionStatus,
} from "@/features/elections/utils/electionUtils";
import type { Election, Position, Candidate } from "@/features/elections/types";
import { CandidateBallotCard } from "@/features/voting/components/CandidateBallotCard";
import { SelectedCandidatePreview } from "@/features/voting/components/SelectedCandidatePreview";

import { Breadcrumb } from "@/components/layouts/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription } from "@/components/ui/EmptyState";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  Info,
} from "lucide-react";

/**
 * BallotPage (B45, B46)
 * Route: /elections/:id/ballot
 *
 * Responsibilities:
 * - Load authoritative election, positions, and approved candidates.
 * - Verify election status is Active/Open.
 * - Render elective positions in sequence according to display_order.
 * - Enforce 1-selection-per-position using Radio + clickable candidate cards.
 * - Support explicit abstention by allowing any position to remain unselected.
 * - Persist selections in React context memory (no browser storage).
 * - Navigate to /elections/:id/review.
 */
export default function BallotPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selections, setCandidateSelection, clearSelection } = useVoting();

  const [election, setElection] = useState<Election | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBallotData() {
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
            `Ballot submission is unavailable. This election status is currently "${status}". Voting is permitted only during the active election window.`
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
        console.error("Failed to load ballot data:", err);
        setError("An unexpected error occurred while loading the ballot. Please retry.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBallotData();
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-28 w-full rounded-lg" />
        <div className="space-y-6 pt-4">
          <Skeleton className="h-36 w-full rounded-lg" />
          <Skeleton className="h-36 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Elections", href: "/elections" },
            { label: "Ballot Error" },
          ]}
        />
        <Alert variant="error">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Ballot Access Restricted</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>{error || "Election could not be loaded."}</p>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/elections/${id}`)}
                className="text-xs"
              >
                Back to Election Overview
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
          { label: "Official Ballot" },
        ]}
      />

      {/* Ballot Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>The Polytechnic, Ibadan &bull; Official Digital Ballot</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {election.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Make your selection for each contested office. Click a candidate card to select your choice.
          Leaving a position unselected is recorded as an explicit abstention.
        </p>
      </div>

      {/* Instructions & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-foreground">
              Ballot Progress: {selectedCount} of {totalPositions} Offices Selected
            </p>
            <p className="text-muted-foreground mt-0.5">
              {totalPositions - selectedCount > 0
                ? `${totalPositions - selectedCount} position(s) currently unselected (will count as abstention)`
                : "All offices have a candidate selected"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/elections/${election.id}`)}
            className="text-xs gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Cancel &amp; Exit
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/elections/${election.id}/review`)}
            className="text-xs gap-1.5 font-medium"
          >
            Review Ballot Selections
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Position Roster */}
      {positions.length === 0 ? (
        <Card className="border border-border bg-card">
          <CardContent className="py-12">
            <EmptyState>
              <EmptyStateIcon>
                <Info className="h-8 w-8 text-muted-foreground" />
              </EmptyStateIcon>
              <EmptyStateTitle>No Positions Configured</EmptyStateTitle>
              <EmptyStateDescription>
                No elective offices are configured for this ballot.
              </EmptyStateDescription>
            </EmptyState>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {positions.map((position, index) => {
            const positionCandidates = candidates.filter(
              (c) => c.position_id === position.id
            );
            const currentSelection = selections[position.id];
            const selectedCandidate = positionCandidates.find(
              (c) => c.id === currentSelection
            );

            return (
              <section
                key={position.id}
                aria-labelledby={`position-heading-${position.id}`}
                className="space-y-4 pt-2"
              >
                {/* Position Title & Abstention Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-2 border-primary pl-3 py-1">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Office {index + 1} of {totalPositions}
                    </span>
                    <h2
                      id={`position-heading-${position.id}`}
                      className="text-xl font-bold text-foreground"
                    >
                      {position.name}
                    </h2>
                    {position.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {position.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {currentSelection ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => clearSelection(election.id, position.id)}
                        className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7 px-2"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Clear Choice (Abstain)
                      </Button>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">
                        Unselected (Abstention)
                      </span>
                    )}
                  </div>
                </div>

                {/* Immediate Selected Candidate Photo Preview */}
                {selectedCandidate && (
                  <SelectedCandidatePreview
                    candidate={selectedCandidate}
                    position={position}
                    onClearSelection={() => clearSelection(election.id, position.id)}
                  />
                )}

                {/* Candidate Selection Cards */}
                {positionCandidates.length === 0 ? (
                  <div className="p-4 rounded-md border border-border bg-muted/20 text-xs text-muted-foreground italic">
                    No approved candidates contested for this position.
                  </div>
                ) : (
                  <div
                    role="radiogroup"
                    aria-labelledby={`position-heading-${position.id}`}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {positionCandidates.map((candidate) => (
                      <CandidateBallotCard
                        key={candidate.id}
                        candidate={candidate}
                        positionId={position.id}
                        isSelected={currentSelection === candidate.id}
                        onSelect={(candidateId) =>
                          setCandidateSelection(election.id, position.id, candidateId)
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Footer Submission Action Bar */}
      <div className="border-t border-border pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          <span>
            {selectedCount} of {totalPositions} positions selected.
          </span>
          <span className="block sm:inline sm:ml-2 text-foreground font-medium">
            Next step: Review your selections before final submission.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/elections/${election.id}`)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={() => navigate(`/elections/${election.id}/review`)}
            className="text-xs gap-2 font-semibold"
          >
            Proceed to Review
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
