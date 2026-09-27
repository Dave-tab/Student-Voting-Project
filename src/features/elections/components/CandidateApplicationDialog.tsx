import { useState } from "react";
import type { Position } from "../types";
import { submitCandidateApplication } from "../services/electionService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Award, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

interface CandidateApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  electionId: string;
  electionTitle: string;
  positions: Position[];
  studentId: string;
  matricNumber: string;
  onSuccess: () => void;
}

export function CandidateApplicationDialog({
  isOpen,
  onClose,
  electionId,
  electionTitle,
  positions,
  studentId,
  matricNumber,
  onSuccess,
}: CandidateApplicationDialogProps) {
  const [positionId, setPositionId] = useState(positions[0]?.id || "");
  const [campaignSlogan, setCampaignSlogan] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionId) {
      setError("Please select an elective position.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const res = await submitCandidateApplication({
        electionId,
        positionId,
        studentId,
        matricNumber,
        campaignSlogan,
        manifesto,
        photoPath,
      });

      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Application submission failed:", err);
      setError(err instanceof Error ? err.message : "Failed to submit candidate application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Award className="h-4 w-4" />
            <span>Candidate Nomination Filing</span>
          </div>
          <DialogTitle className="text-xl font-bold">Run for Office</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Election: <strong className="text-foreground">{electionTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="error" className="py-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertTitle className="text-xs">Submission Notice</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed mt-0.5">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert variant="success" className="py-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <AlertTitle className="text-xs">Filing Received</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed mt-0.5">
              {successMsg}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
          {/* Eligibility context */}
          <div className="p-3 rounded-md bg-muted/30 border border-border text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Voter Register Verification</span>
            </div>
            <p className="text-muted-foreground">
              Candidacy verified under matriculation number:{" "}
              <strong className="text-foreground font-mono">{matricNumber}</strong>. Status upon filing
              will be set to <strong>Pending Approval</strong>.
            </p>
          </div>

          {/* Position Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Elective Position <span className="text-destructive">*</span>
            </label>
            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              required
              className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {positions.length === 0 && (
                <option value="">No elective positions configured yet</option>
              )}
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Slogan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Campaign Slogan
            </label>
            <Input
              value={campaignSlogan}
              onChange={(e) => setCampaignSlogan(e.target.value)}
              placeholder="e.g. Integrity, Service & Innovation"
              className="h-9 text-xs"
              maxLength={150}
            />
          </div>

          {/* Candidate Photograph Path / URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Candidate Photograph URL
            </label>
            <Input
              value={photoPath}
              onChange={(e) => setPhotoPath(e.target.value)}
              placeholder="https://... or /images/candidates/..."
              className="h-9 text-xs"
            />
          </div>

          {/* Manifesto / Vision */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Candidate Manifesto
            </label>
            <Textarea
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
              placeholder="State your policy goals, student welfare proposals, and qualifications..."
              className="text-xs min-h-[100px]"
              maxLength={2000}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || positions.length === 0}
              className="text-xs font-semibold gap-1.5"
            >
              <Award className="h-3.5 w-3.5" />
              <span>{submitting ? "Submitting Filing..." : "Submit Application"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
