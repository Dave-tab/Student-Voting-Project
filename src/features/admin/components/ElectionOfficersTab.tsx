import { useState, useEffect } from "react";
import {
  getElectionOfficerAssignments,
  getAvailableElectoralOfficers,
  assignElectoralOfficer,
  removeElectoralOfficer,
  type ElectionOfficerAssignment,
  type ElectoralOfficerUser,
} from "../services/adminOfficerService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  Loader2,
  Info,
} from "lucide-react";
import { formatElectionDate } from "@/features/elections/utils/electionUtils";

interface ElectionOfficersTabProps {
  electionId: string;
}

export function ElectionOfficersTab({ electionId }: ElectionOfficersTabProps) {
  const [assignments, setAssignments] = useState<ElectionOfficerAssignment[]>([]);
  const [availableOfficers, setAvailableOfficers] = useState<ElectoralOfficerUser[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignedData, officersData] = await Promise.all([
        getElectionOfficerAssignments(electionId),
        getAvailableElectoralOfficers(),
      ]);
      setAssignments(assignedData);
      setAvailableOfficers(officersData);

      // Default selected officer
      const unassigned = officersData.filter(
        (o) => !assignedData.some((a) => a.user_id === o.id)
      );
      if (unassigned.length > 0) {
        setSelectedOfficerId(unassigned[0].id);
      } else {
        setSelectedOfficerId("");
      }
    } catch (err) {
      console.error("Failed to load officer assignments:", err);
      setError(err instanceof Error ? err.message : "Failed to load officer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function fetchAssignments() {
      try {
        setError(null);
        const [assignedData, officersData] = await Promise.all([
          getElectionOfficerAssignments(electionId),
          getAvailableElectoralOfficers(),
        ]);
        if (!ignore) {
          setAssignments(assignedData);
          setAvailableOfficers(officersData);

          const unassigned = officersData.filter(
            (o) => !assignedData.some((a) => a.user_id === o.id)
          );
          if (unassigned.length > 0) {
            setSelectedOfficerId(unassigned[0].id);
          } else {
            setSelectedOfficerId("");
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load officer assignments:", err);
          setError(err instanceof Error ? err.message : "Failed to load officer data.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchAssignments();

    return () => {
      ignore = true;
    };
  }, [electionId]);

  const handleAssign = async () => {
    if (!selectedOfficerId) return;

    try {
      setAssigning(true);
      setError(null);
      await assignElectoralOfficer(electionId, selectedOfficerId);
      setSuccess("Electoral Officer successfully assigned to this election.");
      await refreshData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to assign officer:", err);
      setError(err instanceof Error ? err.message : "Failed to assign officer.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (assignmentId: string, email: string) => {
    if (
      !confirm(
        `Are you sure you want to revoke Electoral Officer assignment for '${email}'?`
      )
    ) {
      return;
    }

    try {
      setRemovingId(assignmentId);
      setError(null);
      await removeElectoralOfficer(assignmentId);
      setSuccess("Electoral Officer assignment revoked.");
      await refreshData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to revoke assignment:", err);
      setError(err instanceof Error ? err.message : "Failed to revoke assignment.");
    } finally {
      setRemovingId(null);
    }
  };

  const unassignedOfficers = availableOfficers.filter(
    (o) => !assignments.some((a) => a.user_id === o.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Electoral Officer Assignments</h2>
            <Badge variant="secondary" className="text-xs font-semibold">
              Assigned: {assignments.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Authorized administrative officers assigned to oversee and coordinate the formal administration of this specific election.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Assign New Officer Card */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <span>Assign Presiding Electoral Officer</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Designate a registered Electoral Officer to oversee this election.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {unassignedOfficers.length === 0 ? (
            <div className="p-3 rounded-md bg-muted/30 border border-border text-xs text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                {availableOfficers.length === 0
                  ? "No users with the 'electoral_officer' role were found in the database."
                  : "All registered Electoral Officers are already assigned to this election."}
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className="w-full sm:w-80 h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {unassignedOfficers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.email}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                onClick={handleAssign}
                disabled={assigning || !selectedOfficerId}
                size="sm"
                className="h-9 text-xs font-semibold gap-1.5 w-full sm:w-auto"
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    Assign Officer
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Officers List */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-border">
          <CardTitle className="text-sm font-bold text-foreground">
            Current Presiding Officers ({assignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading officer assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
              No Electoral Officers currently assigned.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-3 rounded-lg border border-border bg-muted/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{assignment.user_email}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        Assigned: {formatElectionDate(assignment.assigned_at)}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(assignment.id, assignment.user_email)}
                    disabled={removingId === assignment.id}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    title="Revoke Assignment"
                  >
                    {removingId === assignment.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
