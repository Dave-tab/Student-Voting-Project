/**
 * PositionResultCard (B52)
 * Renders individual position results, candidates, votes, percentages, winner badges, and tie alerts.
 * 
 * ARCHITECTURAL GOVERNANCE:
 * - Decision G: Tie Handling (If tied, status = 'Tied', winner = null, no winner badge rendered).
 * - Decision H: Percentage Denominator = total valid candidate selections for that position.
 * - Zero Division Safety: If total_valid_selections === 0, percentage is rendered as 0.0% / N/A.
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import type { PositionResultItem, CandidateResultItem } from "../types";
import { Trophy, AlertTriangle, Users, MinusCircle } from "lucide-react";

interface PositionResultCardProps {
  position: PositionResultItem;
  positionNumber: number;
}

export function PositionResultCard({ position, positionNumber }: PositionResultCardProps) {
  const isTied = position.status === "Tied";
  const hasNoSelections = position.status === "No Selections" || position.total_valid_selections === 0;

  const statusBadgeVariant =
    position.status === "Decided"
      ? "success"
      : position.status === "Tied"
      ? "warning"
      : "secondary";

  const statusLabel =
    position.status === "Decided"
      ? "Decided"
      : position.status === "Tied"
      ? "Tied Result"
      : "No Selections";

  return (
    <Card className="border border-border bg-card shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60 bg-muted/10 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              {positionNumber}
            </span>
            <CardTitle className="text-xl font-bold text-foreground">
              {position.position_name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusBadgeVariant}>
              {statusLabel}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>
            Total Valid Selections:{" "}
            <strong className="text-foreground font-semibold">
              {position.total_valid_selections.toLocaleString()}
            </strong>
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Tied Result Notice (Decision G) */}
        {isTied && (
          <div className="flex items-start gap-3 p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block">Official Tie Recorded</strong>
              <span>
                Two or more candidates share the highest vote tally. Under institutional electoral rules, no single winner is declared pending resolution by the Electoral Commission.
              </span>
            </div>
          </div>
        )}

        {/* Zero Selections Notice */}
        {hasNoSelections && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/20 text-muted-foreground text-xs text-center justify-center">
            <MinusCircle className="h-4 w-4 shrink-0" />
            <span>No valid candidate selections were cast for this office.</span>
          </div>
        )}

        {/* Candidates List Breakdown */}
        {position.candidates && position.candidates.length > 0 ? (
          <div className="space-y-3 pt-1">
            {position.candidates.map((cand: CandidateResultItem) => {
              const pctValue = cand.percentage !== null && cand.percentage !== undefined ? cand.percentage : 0;
              const formattedPct = cand.percentage !== null && cand.percentage !== undefined
                ? `${cand.percentage.toFixed(1)}%`
                : "0.0%";

              const initials = cand.candidate_name
                ? cand.candidate_name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "C";

              // Winner is only valid if position is Decided and not Tied
              const showWinnerBadge = cand.is_winner && !isTied;

              return (
                <div
                  key={cand.candidate_id}
                  className={`p-3.5 sm:p-4 rounded-lg border transition-colors ${
                    showWinnerBadge
                      ? "border-emerald-500/40 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5">
                    {/* Candidate Identity */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        {cand.photo_path && (
                          <AvatarImage src={cand.photo_path} alt={cand.candidate_name} />
                        )}
                        <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">
                            {cand.candidate_name}
                          </span>
                          {showWinnerBadge && (
                            <Badge
                              variant="success"
                              className="gap-1 text-[10px] uppercase tracking-wider py-0.5"
                            >
                              <Trophy className="h-3 w-3" />
                              Winner
                            </Badge>
                          )}
                        </div>

                        {(cand.department || cand.matric_number) && (
                          <div className="text-xs text-muted-foreground">
                            {cand.department && <span>{cand.department}</span>}
                            {cand.department && cand.matric_number && <span> &bull; </span>}
                            {cand.matric_number && <span>{cand.matric_number}</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vote Counts and Percentage */}
                    <div className="flex items-baseline sm:flex-col sm:items-end justify-between sm:justify-center shrink-0">
                      <div className="text-sm sm:text-base font-extrabold text-foreground">
                        {cand.votes.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {cand.votes === 1 ? "vote" : "votes"}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-primary">
                        {formattedPct}
                      </div>
                    </div>
                  </div>

                  {/* Accessible Visual Progress Bar */}
                  <div className="space-y-1">
                    <div
                      role="progressbar"
                      aria-valuenow={pctValue}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${cand.candidate_name} vote share: ${formattedPct}`}
                      className="w-full h-2 rounded-full bg-muted overflow-hidden"
                    >
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          showWinnerBadge
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : isTied
                            ? "bg-amber-500"
                            : "bg-primary/80"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, pctValue))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !hasNoSelections && (
            <p className="text-xs text-muted-foreground">No candidate breakdown available.</p>
          )
        )}
      </CardContent>
    </Card>
  );
}
