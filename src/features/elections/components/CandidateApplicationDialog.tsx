import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Position } from "../types";
import { submitCandidateApplication, resubmitCandidateApplication } from "../services/electionService";
import { supabase } from "@/lib/supabase";
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
import { Award, AlertCircle, CheckCircle2, ShieldCheck, Upload, RotateCcw, Edit3, Loader2 } from "lucide-react";

const candidateAppSchema = z.object({
  positionId: z.string().min(1, "Please select an elective position."),
  campaignSlogan: z.string().max(150, "Campaign slogan must be under 150 characters.").optional(),
  manifesto: z.string().max(2000, "Manifesto must be under 2000 characters.").optional(),
  photoPath: z.string().optional(),
});

type CandidateAppSchemaType = z.infer<typeof candidateAppSchema>;

interface CandidateApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  electionId: string;
  electionTitle: string;
  positions: Position[];
  studentId: string;
  matricNumber: string;
  onSuccess: () => void;
  mode?: "create" | "redo" | "edit";
  existingCandidateId?: string;
  initialPositionId?: string;
  initialCampaignSlogan?: string;
  initialManifesto?: string;
  initialPhotoPath?: string;
  rejectionRemarks?: string;
}

export const CandidateApplicationDialog = React.memo(function CandidateApplicationDialog(
  props: CandidateApplicationDialogProps
) {
  return <CandidateApplicationDialogInner {...props} />;
});

function CandidateApplicationDialogInner({
  isOpen,
  onClose,
  electionId,
  electionTitle,
  positions,
  studentId,
  matricNumber,
  onSuccess,
  mode = "create",
  existingCandidateId,
  initialPositionId,
  initialCampaignSlogan = "",
  initialManifesto = "",
  initialPhotoPath = "",
  rejectionRemarks,
}: CandidateApplicationDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhotoPath || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CandidateAppSchemaType>({
    resolver: zodResolver(candidateAppSchema),
    defaultValues: {
      positionId: initialPositionId || positions[0]?.id || "",
      campaignSlogan: initialCampaignSlogan,
      manifesto: initialManifesto,
      photoPath: initialPhotoPath,
    },
  });

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onClose();
    },
    [onClose]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Invalid file type. Please upload a JPEG, PNG, or WEBP image.");
      return;
    }

    // Validate file size (Max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg("File size exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const onSubmit = async (data: CandidateAppSchemaType) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let finalPhotoPath = (data.photoPath || initialPhotoPath || "").trim();

      // If a file is selected, upload strictly to candidate-media bucket
      if (selectedFile) {
        if (!electionId || !studentId) {
          throw new Error("Missing required identification (Election/Student ID) for secure storage upload.");
        }

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("Authentication required. Please sign in to upload your photograph.");
        }

        const fileExt = selectedFile.name.split(".").pop() || "jpg";
        const timestamp = new Date().getTime();
        const fileName = `${electionId}/${studentId}/${timestamp}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("candidate-media")
          .upload(fileName, selectedFile, {
            contentType: selectedFile.type,
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Failed to upload portrait photograph to secure storage: ${uploadError.message}`);
        }

        finalPhotoPath = fileName;
      }

      if (mode === "redo" || mode === "edit") {
        if (!existingCandidateId) {
          throw new Error("Missing candidate filing reference for update.");
        }

        const res = await resubmitCandidateApplication({
          candidateId: existingCandidateId,
          electionId,
          positionId: data.positionId,
          campaignSlogan: data.campaignSlogan,
          manifesto: data.manifesto,
          photoPath: finalPhotoPath,
        });

        setSuccessMsg(res.message);
      } else {
        const res = await submitCandidateApplication({
          electionId,
          positionId: data.positionId,
          studentId,
          matricNumber,
          campaignSlogan: data.campaignSlogan,
          manifesto: data.manifesto,
          photoPath: finalPhotoPath,
        });

        setSuccessMsg(res.message);
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error("Application submission failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit candidate application.");
    }
  };

  const isRedo = mode === "redo";
  const isEdit = mode === "edit";

  useEffect(() => {
    console.log("[CANDIDATE_DIALOG] MOUNT");
    return () => {
      console.log("[CANDIDATE_DIALOG] UNMOUNT");
    };
  }, []);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            {isRedo ? (
              <RotateCcw className="h-4 w-4" />
            ) : isEdit ? (
              <Edit3 className="h-4 w-4" />
            ) : (
              <Award className="h-4 w-4" />
            )}
            <span>
              {isRedo
                ? "Redo Candidacy Application"
                : isEdit
                ? "Edit Nomination Filing"
                : "Candidate Nomination Filing"}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">
            {isRedo
              ? "Revise & Resubmit Candidacy"
              : isEdit
              ? "Update Your Nomination"
              : "Run for Office"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Election: <strong className="text-foreground">{electionTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Rejection remarks guidance banner */}
        {isRedo && rejectionRemarks && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Electoral Commission Remarks to Address:</span>
            </div>
            <p className="italic text-[11px] leading-relaxed">
              "{rejectionRemarks}"
            </p>
          </div>
        )}

        {errorMsg && (
          <Alert variant="error" className="py-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertTitle className="text-xs">Submission Notice</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed mt-0.5">
              {errorMsg}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1 text-xs">
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
              {...register("positionId")}
              disabled={isSubmitting}
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
            {errors.positionId && (
              <p className="text-xs text-red-600 font-medium" role="alert">
                {errors.positionId.message}
              </p>
            )}
          </div>

          {/* Campaign Slogan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Campaign Slogan
            </label>
            <Input
              {...register("campaignSlogan")}
              placeholder="e.g. Integrity, Service & Innovation"
              disabled={isSubmitting}
              className="h-9 text-xs"
              maxLength={150}
            />
            {errors.campaignSlogan && (
              <p className="text-xs text-red-600 font-medium" role="alert">
                {errors.campaignSlogan.message}
              </p>
            )}
          </div>

          {/* Candidate Photograph Upload & Validation */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Candidate Photograph (JPEG, PNG, WEBP &bull; Max 5MB)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-muted/40 hover:bg-muted text-xs font-medium text-foreground transition-colors">
                <Upload className="h-3.5 w-3.5 text-primary" />
                <span>Choose Image File</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
              </label>
              {selectedFile ? (
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No file chosen
                </span>
              )}
            </div>

            {previewUrl && (
              <div className="mt-2 flex items-center gap-3 p-2 rounded border border-border bg-muted/20">
                <img
                  src={previewUrl}
                  alt="Candidate Preview"
                  className="h-12 w-12 rounded object-cover border border-border"
                />
                <span className="text-[11px] text-muted-foreground">Preview Image Ready</span>
              </div>
            )}
          </div>

          {/* Manifesto / Vision */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Candidate Manifesto
            </label>
            <Textarea
              {...register("manifesto")}
              placeholder="State your policy goals, student welfare proposals, and qualifications..."
              disabled={isSubmitting}
              className="text-xs min-h-[100px]"
              maxLength={2000}
            />
            {errors.manifesto && (
              <p className="text-xs text-red-600 font-medium" role="alert">
                {errors.manifesto.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || positions.length === 0}
              className="text-xs font-semibold gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  <span>Submitting Filing...</span>
                </>
              ) : (
                <>
                  {isRedo ? (
                    <RotateCcw className="h-3.5 w-3.5" />
                  ) : isEdit ? (
                    <Edit3 className="h-3.5 w-3.5" />
                  ) : (
                    <Award className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {isRedo
                      ? "Resubmit Nomination Filing"
                      : isEdit
                      ? "Save & Update Filing"
                      : "Submit Application"}
                  </span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
