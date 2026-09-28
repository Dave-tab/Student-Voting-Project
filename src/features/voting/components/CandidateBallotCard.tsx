import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Radio } from "@/components/ui/Radio";
import { Building2, GraduationCap, Quote } from "lucide-react";
import type { Candidate } from "@/features/elections/types";

interface CandidateBallotCardProps {
  candidate: Candidate;
  positionId: string;
  isSelected: boolean;
  onSelect: (candidateId: string) => void;
  disabled?: boolean;
}

/**
 * CandidateBallotCard (B46)
 * Implements approved ADR-P4-02: "Radio + clickable candidate card"
 *
 * Rules:
 * - Card is an interactive selection surface.
 * - Selecting the card selects the candidate's radio control.
 * - Native keyboard radio semantics are preserved.
 * - Does NOT mutate the generic Card or Radio primitives.
 */
export function CandidateBallotCard({
  candidate,
  positionId,
  isSelected,
  onSelect,
  disabled = false,
}: CandidateBallotCardProps) {
  const radioId = `candidate-radio-${candidate.id}`;
  const radioGroupName = `position-group-${positionId}`;

  const candidateName = candidate.student
    ? (candidate.student.full_name || 
       `${candidate.student.first_name || ""} ${candidate.student.last_name || ""}`.trim() ||
       candidate.student.matriculation_number ||
       "Candidate")
    : "Candidate Name Withheld";

  const initials = candidateName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "C";

  const slogan = candidate.candidate_details?.campaign_slogan;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onSelect(candidate.id);
    }
  };

  return (
    <Card
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      onClick={() => {
        if (!disabled) onSelect(candidate.id);
      }}
      onKeyDown={handleKeyDown}
      className={`relative cursor-pointer transition-all border select-none ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <CardHeader className="flex flex-row items-start gap-4 pb-2 pt-4 px-4 sm:px-6">
        <div className="pt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Radio
            id={radioId}
            name={radioGroupName}
            value={candidate.id}
            checked={isSelected}
            disabled={disabled}
            onChange={() => onSelect(candidate.id)}
            aria-label={`Vote for ${candidateName}`}
            className="cursor-pointer"
          />
        </div>

        <Avatar className="h-12 w-12 border border-border shrink-0">
          {candidate.candidate_details?.photo_path ? (
            <AvatarImage
              src={candidate.candidate_details.photo_path}
              alt={candidateName}
            />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold text-foreground truncate">
              {candidateName}
            </CardTitle>
            {isSelected && (
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider shrink-0 bg-primary/10 px-2 py-0.5 rounded">
                Selected
              </span>
            )}
          </div>

          {candidate.student?.matriculation_number && (
            <p className="text-xs font-mono text-muted-foreground">
              {candidate.student.matriculation_number}
            </p>
          )}

          {(candidate.student?.department || candidate.student?.level) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
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

      {slogan && (
        <CardContent className="px-4 sm:px-6 pb-4 pt-1">
          <div className="p-2 rounded bg-muted/40 border border-border text-xs italic text-foreground flex items-start gap-1.5 ml-8 sm:ml-9">
            <Quote className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
            <span className="line-clamp-2">"{slogan}"</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
