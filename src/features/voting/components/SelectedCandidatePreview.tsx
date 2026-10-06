import { useState } from "react";
import { CheckCircle2, ZoomIn, Building2, GraduationCap, Quote, User, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import type { Candidate, Position } from "@/features/elections/types";
import { getImageUrl } from "../../../utils/imageUtils";

interface SelectedCandidatePreviewProps {
  candidate: Candidate;
  position?: Position;
  onClearSelection?: () => void;
  compact?: boolean;
}

/**
 * SelectedCandidatePreview
 * Displays the selected candidate's verified photograph and profile immediately upon selection,
 * providing the voter with clear visual assurance before final ballot submission.
 */
export function SelectedCandidatePreview({
  candidate,
  position,
  onClearSelection,
  compact = false,
}: SelectedCandidatePreviewProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const candidateName = candidate.student
    ? (
        candidate.student.full_name ||
        `${candidate.student.first_name || ""} ${candidate.student.last_name || ""}`.trim() ||
        candidate.student.matriculation_number ||
        "Candidate"
      )
    : "Candidate Name Withheld";

  const initials =
    candidateName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";

  const photoUrl = getImageUrl(candidate.candidate_details?.photo_path);
  const slogan = candidate.candidate_details?.campaign_slogan;
  const matric = candidate.student?.matriculation_number;
  const department = candidate.student?.department;
  const level = candidate.student?.level;

  return (
    <>
      <div
        className={`rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 transition-all shadow-xs ${
          compact ? "py-3 px-4" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-primary/20 pb-3 mb-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs sm:text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            <span>Selected Candidate Preview</span>
            {position && (
              <span className="text-muted-foreground font-normal hidden sm:inline">
                &bull; {position.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              <Sparkles className="h-3 w-3" />
              Active Choice
            </span>
            {onClearSelection && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                Change
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Candidate Photograph with Interactive Lightbox Zoom */}
          <div className="relative group shrink-0 self-center sm:self-auto">
            <div
              onClick={() => setIsZoomOpen(true)}
              className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden border-2 border-primary/30 bg-muted/60 shadow-xs cursor-pointer group-hover:border-primary transition-all flex items-center justify-center"
              title="Click to enlarge candidate photo"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`Photograph of ${candidateName}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback if image fails to render
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-primary/70">
                  <User className="h-8 w-8" />
                  <span className="text-[10px] font-bold mt-1">{initials}</span>
                </div>
              )}

              {/* Hover Zoom Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ZoomIn className="h-5 w-5" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="mt-1 w-full text-center text-[10px] text-primary font-medium hover:underline flex items-center justify-center gap-1"
            >
              <ZoomIn className="h-2.5 w-2.5" />
              Enlarge Photo
            </button>
          </div>

          {/* Candidate Meta */}
          <div className="flex-1 min-w-0 space-y-1.5 w-full">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                {candidateName}
              </h3>
              {matric && (
                <p className="text-xs font-mono text-muted-foreground">{matric}</p>
              )}
            </div>

            {(department || level) && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {department && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {department}
                  </span>
                )}
                {level && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                    {level}
                  </span>
                )}
              </div>
            )}

            {slogan && (
              <div className="p-2 rounded-md bg-background/80 border border-primary/20 text-xs italic text-foreground flex items-start gap-1.5 mt-2">
                <Quote className="h-3.5 w-3.5 shrink-0 text-primary/70 mt-0.5" />
                <span className="line-clamp-2">"{slogan}"</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enlarged Photo Lightbox Dialog */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-md p-6 text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Candidate Photo Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official photograph of <strong className="text-foreground">{candidateName}</strong>
              {position && <span> &bull; Contesting for {position.name}</span>}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center justify-center">
            <div className="relative max-h-80 w-full overflow-hidden rounded-lg border border-border bg-muted/40 shadow-sm flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`Enlarged portrait of ${candidateName}`}
                  className="max-h-80 w-auto object-contain mx-auto"
                />
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-semibold">{candidateName}</p>
                  <p className="text-xs font-mono">{matric}</p>
                </div>
              )}
            </div>

            <div className="mt-4 text-left w-full space-y-1 text-xs bg-muted/30 p-3 rounded border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name:</span>
                <strong className="text-foreground">{candidateName}</strong>
              </div>
              {matric && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Matriculation:</span>
                  <span className="font-mono text-foreground">{matric}</span>
                </div>
              )}
              {position && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Office:</span>
                  <strong className="text-primary">{position.name}</strong>
                </div>
              )}
              {slogan && (
                <div className="pt-1.5 border-t border-border mt-1.5 italic text-foreground">
                  "{slogan}"
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsZoomOpen(false)}
              className="text-xs"
            >
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
