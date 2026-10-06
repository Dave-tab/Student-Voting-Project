/**
 * ResultsHeader (B52)
 * Displays election header, institutional seal, official result badges, and high-level metrics.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatElectionDate } from "@/features/elections/utils/electionUtils";
import type { Election } from "@/features/elections/types";
import type { ElectionResultsData } from "../types";
import {
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Vote,
} from "lucide-react";

interface ResultsHeaderProps {
  election: Election;
  results: ElectionResultsData;
}

export function ResultsHeader({ election, results }: ResultsHeaderProps) {
  const totalPositions = results.positions.length;
  const totalValidSelections = results.positions.reduce(
    (acc, pos) => acc + pos.total_valid_selections,
    0
  );

  const hasTiedPositions = results.positions.some((p) => p.status === "Tied");
  const allDecided = results.positions.every((p) => p.status === "Decided");

  return (
    <Card className="border border-border bg-card shadow-xs">
      <CardHeader className="space-y-4 pb-4">
        {/* Institutional Branding Line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/branding/polytechnic-ibadan-logo.png"
              alt="The Polytechnic, Ibadan Seal"
              className="h-10 w-10 shrink-0 rounded-full object-contain border border-border bg-white p-0.5 shadow-xs"
            />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                The Polytechnic, Ibadan &bull; Directorate of Student Affairs
              </span>
              <span className="text-xs font-semibold text-foreground">
                Authoritative Platform Results
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1.5 py-1 px-3">
              <Award className="h-3.5 w-3.5" />
              Official Results
            </Badge>
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Vote className="h-3.5 w-3.5" />
            <span>Authoritative Aggregate Tallies</span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {election.title}
          </CardTitle>
          {election.description && (
            <CardDescription className="text-sm text-muted-foreground pt-1 max-w-2xl">
              {election.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Election Metadata and Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-muted/30 p-3.5 rounded-lg border border-border">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[11px]">Voting Concluded</span>
              <span className="font-semibold text-foreground">
                {formatElectionDate(election.end_datetime)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[11px]">Calculation Recorded</span>
              <span className="font-semibold text-foreground">
                {new Date(results.calculated_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[11px]">Contested Offices</span>
              <span className="font-semibold text-foreground">
                {totalPositions} {totalPositions === 1 ? "Position" : "Positions"}
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-lg border border-border bg-background flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium">Contested Positions</span>
            <span className="text-2xl font-bold text-foreground mt-1">{totalPositions}</span>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-background flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total Valid Selections</span>
            <span className="text-2xl font-bold text-primary mt-1">
              {totalValidSelections.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-background flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium">Results Review Status</span>
            <div className="flex items-center gap-2 mt-1">
              {allDecided ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    All Offices Decided
                  </span>
                </>
              ) : hasTiedPositions ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    Tied Contests Pending
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">Published</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
