/**
 * ResultsUnavailableState (B51)
 * Handles results access lifecycle states:
 * - voting_ongoing: Voting is currently active.
 * - not_yet_published: Awaiting authoritative review and publication by Electoral Committee (ODR-002).
 * - no_results: No recorded votes or positions.
 * - error: Request failure.
 */

import { useNavigate } from "react-router-dom";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Election } from "@/features/elections/types";
import type { ResultAccessState } from "../types";
import {
  Clock,
  ShieldAlert,
  Inbox,
  AlertTriangle,
  ArrowLeft,
  Vote,
} from "lucide-react";
import { formatElectionDate } from "@/features/elections/utils/electionUtils";

interface ResultsUnavailableStateProps {
  state: ResultAccessState;
  election: Election | null;
  message?: string;
  error?: string | null;
  onRetry?: () => void;
}

export function ResultsUnavailableState({
  state,
  election,
  message,
  error,
  onRetry,
}: ResultsUnavailableStateProps) {
  const navigate = useNavigate();

  if (state === "voting_ongoing") {
    return (
      <Card className="border border-border bg-card shadow-xs text-center p-6 sm:p-10 space-y-6">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Clock className="h-7 w-7" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <Badge variant="default" className="text-xs uppercase tracking-wider">
            Ballot In Progress
          </Badge>
          <CardTitle className="text-2xl font-bold text-foreground">
            Voting Is Currently Active
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {message ||
              "In accordance with institutional election security regulations, aggregate election tallies are calculated and released only after the voting window officially concludes."}
          </CardDescription>
        </div>

        {election && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border max-w-md mx-auto text-xs text-muted-foreground space-y-2">
            <div className="flex items-center justify-between">
              <span>Election Title:</span>
              <span className="font-semibold text-foreground">{election.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Voting Concludes:</span>
              <span className="font-semibold text-foreground">
                {formatElectionDate(election.end_datetime)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {election && (
            <Button
              onClick={() => navigate(`/elections/${election.id}/ballot`)}
              className="gap-2 w-full sm:w-auto"
            >
              <Vote className="h-4 w-4" />
              Proceed to Ballot
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => (election ? navigate(`/elections/${election.id}`) : navigate("/elections"))}
            className="w-full sm:w-auto"
          >
            Return to Election Overview
          </Button>
        </div>
      </Card>
    );
  }

  if (state === "not_yet_published") {
    return (
      <Card className="border border-border bg-card shadow-xs text-center p-6 sm:p-10 space-y-6">
        <div className="mx-auto h-14 w-14 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <Badge variant="warning" className="text-xs uppercase tracking-wider">
            Review in Progress
          </Badge>
          <CardTitle className="text-2xl font-bold text-foreground">
            Results Under Committee Review
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {message ||
              "Ballot tallies for this election are currently undergoing authoritative review and publication by the Independent Electoral Committee. Official results will be published once review is complete."}
          </CardDescription>
        </div>

        {election && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border max-w-md mx-auto text-xs text-muted-foreground space-y-2">
            <div className="flex items-center justify-between">
              <span>Election:</span>
              <span className="font-semibold text-foreground">{election.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Closed At:</span>
              <span className="font-semibold text-foreground">
                {formatElectionDate(election.end_datetime)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => (election ? navigate(`/elections/${election.id}`) : navigate("/elections"))}
            className="gap-2 w-full sm:w-auto text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Election Details
          </Button>
          {onRetry && (
            <Button onClick={onRetry} variant="default" className="w-full sm:w-auto text-xs">
              Check for Updates
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (state === "no_results") {
    return (
      <Card className="border border-border bg-card shadow-xs text-center p-6 sm:p-10 space-y-6">
        <div className="mx-auto h-14 w-14 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
          <Inbox className="h-7 w-7" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <Badge variant="secondary" className="text-xs uppercase tracking-wider">
            No Records
          </Badge>
          <CardTitle className="text-2xl font-bold text-foreground">
            No Results Recorded
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {message ||
              "No valid ballot selections or position records were compiled for this election cycle."}
          </CardDescription>
        </div>

        <div className="flex items-center justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => (election ? navigate(`/elections/${election.id}`) : navigate("/elections"))}
            className="gap-2 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Election Overview
          </Button>
        </div>
      </Card>
    );
  }

  // Error State
  return (
    <Card className="border border-red-500/30 bg-card shadow-xs text-center p-6 sm:p-10 space-y-6">
      <div className="mx-auto h-14 w-14 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <Badge variant="destructive" className="text-xs uppercase tracking-wider">
          Query Failed
        </Badge>
        <CardTitle className="text-2xl font-bold text-foreground">
          Unable to Load Results
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {error || message || "A network or service disruption occurred while querying the official results."}
        </CardDescription>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onRetry && (
          <Button onClick={onRetry} variant="default" className="w-full sm:w-auto text-xs">
            Retry Loading Results
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => navigate("/elections")}
          className="w-full sm:w-auto text-xs gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Elections
        </Button>
      </div>
    </Card>
  );
}
