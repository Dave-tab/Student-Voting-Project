import { useState } from "react";
import type { AdminElection, LookupStatus } from "../types";
import { updateAdminElection } from "../services/adminElectionService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  Layers,
  Users,
  Award,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Edit3,
} from "lucide-react";
import { formatElectionDate, convertToWATISO } from "@/features/elections/utils/electionUtils";
import { DateTimePickerWAT } from "@/components/ui/DateTimePickerWAT";

interface ElectionOverviewTabProps {
  election: AdminElection;
  statuses: LookupStatus[];
  onRefresh: () => Promise<void>;
}

export function ElectionOverviewTab({
  election,
  statuses,
  onRefresh,
}: ElectionOverviewTabProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(election.name);
  const [description, setDescription] = useState(election.description || "");
  const [startDatetime, setStartDatetime] = useState(
    election.start_datetime ? election.start_datetime.slice(0, 16) : ""
  );
  const [endDatetime, setEndDatetime] = useState(
    election.end_datetime ? election.end_datetime.slice(0, 16) : ""
  );
  const [statusId, setStatusId] = useState(election.election_status_id);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Election title is required.");
      return;
    }

    if (startDatetime && endDatetime) {
      if (new Date(endDatetime) <= new Date(startDatetime)) {
        setError("Voting conclusion must occur after voting commencement.");
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);
      await updateAdminElection(election.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        start_datetime: startDatetime ? convertToWATISO(startDatetime) : undefined,
        end_datetime: endDatetime ? convertToWATISO(endDatetime) : undefined,
        election_status_id: statusId,
      });

      setSaveSuccess(true);
      setEditing(false);
      await onRefresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update election:", err);
      setError(err instanceof Error ? err.message : "Failed to update election.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Configured Offices</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold mt-1 text-foreground">
              {election.position_count || 0}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Offices open for student contest
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Registered Candidates</span>
              <Award className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold mt-1 text-foreground">
              {election.candidate_count || 0}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Vetted aspirants and contenders
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Eligible Voters</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold mt-1 text-foreground">
              {election.voter_count || 0}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              On election voter register
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Election details successfully updated.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Election Details Card / Edit Form */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Election Details
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Election schedule, description, and operational status.
            </CardDescription>
          </div>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="text-xs gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setName(election.name);
                setDescription(election.description || "");
              }}
              className="text-xs"
            >
              Cancel Editing
            </Button>
          )}
        </CardHeader>

        <CardContent className="pt-5">
          {!editing ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Official Title:</span>
                  <p className="font-bold text-foreground text-sm">{election.name}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <div>
                    <Badge variant="secondary" className="font-bold text-xs">
                      {election.status_name}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Voting Opens:</span>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatElectionDate(election.start_datetime, { withDayOfWeek: true })}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Voting Closes:</span>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatElectionDate(election.end_datetime, { withDayOfWeek: true })}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-1">
                <span className="text-muted-foreground font-medium">Description:</span>
                <p className="text-foreground/80 leading-relaxed">
                  {election.description || "No supplementary description provided."}
                </p>
              </div>

              <div className="border-t border-border pt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                <span>Created: {new Date(election.created_at).toLocaleDateString()}</span>
                <span>Last Updated: {new Date(election.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Official Election Title <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Description / Purpose
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 rounded-md border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-3">
                <DateTimePickerWAT
                  id="edit-start"
                  label="Voting Opens (Start)"
                  value={startDatetime}
                  onChange={setStartDatetime}
                  required
                />

                <DateTimePickerWAT
                  id="edit-end"
                  label="Voting Closes (End)"
                  value={endDatetime}
                  onChange={setEndDatetime}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Lifecycle Status</label>
                <select
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="text-xs font-semibold gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
