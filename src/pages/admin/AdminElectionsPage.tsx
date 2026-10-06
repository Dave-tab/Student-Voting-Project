import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type AdminElection,
  type LookupStatus,
} from "@/features/admin/types";
import {
  getAdminElections,
  createAdminElection,
  getElectionStatuses,
  getAcademicSessions,
  getDepartments,
  deleteAdminElection,
  type LookupAcademicSession,
} from "@/features/admin/services/adminElectionService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Vote,
  Search,
  Plus,
  Calendar,
  ArrowRight,
  AlertCircle,
  Clock,
  X,
  CheckCircle2,
  Globe,
  ArrowLeft,
  Trash2,
  UserCheck,
  UserPlus,
  Shield,
} from "lucide-react";
import {
  formatElectionDateWAT,
  getDefaultElectionScheduleWAT,
  convertToWATISO,
} from "@/features/elections/utils/electionUtils";
import { DateTimePickerWAT } from "@/components/ui/DateTimePickerWAT";
import {
  getAvailableElectoralOfficers,
  assignElectoralOfficer,
  type ElectoralOfficerUser,
} from "@/features/admin/services/adminOfficerService";
import { provisionAdminAccount } from "@/features/admin/services/adminProvisioningService";

export default function AdminElectionsPage() {
  const navigate = useNavigate();

  const [elections, setElections] = useState<AdminElection[]>([]);
  const [statuses, setStatuses] = useState<LookupStatus[]>([]);
  const [academicSessions, setAcademicSessions] = useState<LookupAcademicSession[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Election Dialog & Review Step state (Section 11 Requirement)
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [step, setStep] = useState<"configure" | "review">("configure");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Deletion state
  const [deletingElection, setDeletingElection] = useState<AdminElection | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteElection = async () => {
    if (!deletingElection) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await deleteAdminElection(deletingElection.id);
      setShowDeleteConfirm(false);
      setDeletingElection(null);
      await loadData();
    } catch (err) {
      console.error("Failed to delete election:", err);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete election.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Dynamic default schedule evaluated from current time
  const defaultSchedule = getDefaultElectionScheduleWAT();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_datetime: defaultSchedule.start_datetime,
    end_datetime: defaultSchedule.end_datetime,
    election_status_id: "",
    academic_session_id: "",
    department_id: "",
  });

  const [availableOfficers, setAvailableOfficers] = useState<ElectoralOfficerUser[]>([]);
  const [electoralAdminMode, setElectoralAdminMode] = useState<"existing" | "new" | "none">("existing");
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const [newOfficerEmail, setNewOfficerEmail] = useState<string>("");
  const [newOfficerPassword, setNewOfficerPassword] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [electionsData, statusesData, sessionsData, deptsData] = await Promise.all([
        getAdminElections(),
        getElectionStatuses(),
        getAcademicSessions(),
        getDepartments(),
      ]);
      setElections(electionsData);
      setStatuses(statusesData);
      setAcademicSessions(sessionsData);
      setDepartments(deptsData);
      setFormData((prev) => ({
        ...prev,
        election_status_id: prev.election_status_id || statusesData[0]?.id || "",
        academic_session_id: prev.academic_session_id || sessionsData[0]?.id || "",
        department_id: prev.department_id || deptsData[0]?.id || "",
      }));
    } catch (err) {
      console.error("Failed to load elections:", err);
      setError(err instanceof Error ? err.message : "Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([getAdminElections(), getElectionStatuses(), getAcademicSessions(), getDepartments()])
      .then(([electionsData, statusesData, sessionsData, deptsData]) => {
        if (!ignore) {
          setElections(electionsData);
          setStatuses(statusesData);
          setAcademicSessions(sessionsData);
          setDepartments(deptsData);
          setFormData((prev) => ({
            ...prev,
            election_status_id: prev.election_status_id || statusesData[0]?.id || "",
            academic_session_id: prev.academic_session_id || sessionsData[0]?.id || "",
            department_id: prev.department_id || deptsData[0]?.id || "",
          }));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load elections:", err);
          setError(err instanceof Error ? err.message : "Failed to load elections");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const openCreateModal = () => {
    const freshSchedule = getDefaultElectionScheduleWAT();
    setFormData({
      name: "",
      description: "",
      start_datetime: freshSchedule.start_datetime,
      end_datetime: freshSchedule.end_datetime,
      election_status_id: statuses[0]?.id || "",
      academic_session_id: academicSessions[0]?.id || "",
      department_id: departments[0]?.id || "",
    });
    setNewOfficerEmail("");
    setNewOfficerPassword("");
    getAvailableElectoralOfficers()
      .then((officers) => {
        setAvailableOfficers(officers);
        if (officers.length > 0) {
          setSelectedOfficerId(officers[0].id);
          setElectoralAdminMode("existing");
        } else {
          setElectoralAdminMode("new");
        }
      })
      .catch((err) => {
        console.warn("Failed to load available electoral officers:", err);
      });
    setStep("configure");
    setCreateError(null);
    setShowCreateDialog(true);
  };

  // Step 1: Validate and move to Review step
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!formData.name.trim()) {
      setCreateError("Election title is required.");
      return;
    }
    if (!formData.academic_session_id) {
      setCreateError("An academic session must be selected.");
      return;
    }
    if (!formData.start_datetime || !formData.end_datetime) {
      setCreateError("Both start and end voting schedules are required.");
      return;
    }

    const startObj = new Date(formData.start_datetime);
    const endObj = new Date(formData.end_datetime);

    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      setCreateError("Please provide valid start and end dates.");
      return;
    }

    if (endObj <= startObj) {
      setCreateError("Voting conclusion (End time) must occur after voting commencement (Start time).");
      return;
    }

    // Validate Electoral Admin provisioning according to OD-04
    if (electoralAdminMode === "new") {
      if (!newOfficerEmail.trim() || !newOfficerEmail.includes("@")) {
        setCreateError("Please provide a valid email address for the proposed Electoral Admin.");
        return;
      }
      if (!newOfficerPassword || newOfficerPassword.length < 8) {
        setCreateError("Electoral Admin temporary password must be at least 8 characters long.");
        return;
      }
    } else if (electoralAdminMode === "existing" && availableOfficers.length > 0 && !selectedOfficerId) {
      setCreateError("Please select an existing Electoral Admin to assign, or choose Path B to provision a new one.");
      return;
    }

    setStep("review");
  };

  // Step 2: Final submission from Review step (Strict transaction boundary conforming to OD-04)
  const handleFinalSubmit = async () => {
    let provisionedUserId: string | null = null;
    try {
      setCreating(true);
      setCreateError(null);

      // Path B: Provision New Electoral Admin FIRST (conforming to OD-04)
      if (electoralAdminMode === "new" && newOfficerEmail.trim() && newOfficerPassword) {
        const provRes = await provisionAdminAccount({
          email: newOfficerEmail.trim(),
          password: newOfficerPassword,
          role: "electoral_admin",
          action: "provision",
        });

        if (!provRes.success) {
          throw new Error(`Failed to provision new Electoral Admin: ${provRes.message}`);
        }

        const newUserId = provRes.userId || provRes.user_id;
        if (!newUserId || typeof newUserId !== "string") {
          throw new Error("Failed to provision new Electoral Admin: No user identity reference returned.");
        }
        provisionedUserId = newUserId;
      }

      // If provisioning succeeded or we are assigning an existing officer, create election and link officer
      let electionId: string | null = null;
      try {
        const res = await createAdminElection({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          start_datetime: convertToWATISO(formData.start_datetime),
          end_datetime: convertToWATISO(formData.end_datetime),
          election_status_id: formData.election_status_id || statuses[0]?.id || "",
          academic_session_id: formData.academic_session_id,
          department_id: formData.department_id,
        });
        electionId = res.id;

        // Assign the officer
        if (electoralAdminMode === "new" && provisionedUserId) {
          await assignElectoralOfficer(electionId, provisionedUserId);
        } else if (electoralAdminMode === "existing" && selectedOfficerId) {
          await assignElectoralOfficer(electionId, selectedOfficerId);
        }
      } catch (err) {
        // Downstream failure: if we provisioned a new admin in Path B, we MUST roll back and delete that identity
        if (provisionedUserId) {
          console.warn("Downstream election creation/assignment failed. Rolling back provisioned administrator identity:", provisionedUserId);
          try {
            await provisionAdminAccount({
              action: "delete",
              userId: provisionedUserId,
            });
          } catch (rollbackErr) {
            console.error("Compensating rollback action failed for user:", provisionedUserId, rollbackErr);
          }
        }
        throw err; // Propagate original error to display in administrative interface
      }

      setShowCreateDialog(false);
      await loadData();
      if (electionId) {
        navigate(`/admin/elections/${electionId}`);
      }
    } catch (err) {
      console.error("Failed to create election:", err);
      setCreateError(err instanceof Error ? err.message : "Failed to create election.");
    } finally {
      setCreating(false);
    }
  };

  // Filtered elections
  const filteredElections = elections.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      e.status_name.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const selectedSession = academicSessions.find((s) => s.id === formData.academic_session_id);
  const selectedStatus = statuses.find((s) => s.id === formData.election_status_id);

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Elections
            </h1>
            <Badge variant="secondary" className="text-xs font-semibold">
              {elections.length} Total
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional elective contests, timelines, candidate quotas, and voter registers.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="gap-1.5 text-xs font-semibold shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Create Election
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search elections by title..."
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Filter by lifecycle status"
          >
            <option value="all">All Lifecycle States</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.name.toLowerCase()}>
                {s.name}
              </option>
            ))}
          </select>

          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-xs h-9 px-2"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-xs flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Elections List */}
      {loading ? (
        <div className="p-12 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs">
          Loading institutional election records...
        </div>
      ) : filteredElections.length === 0 ? (
        <Card className="border border-border border-dashed p-10 text-center">
          <Vote className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-bold text-foreground">
            {searchQuery || statusFilter !== "all"
              ? "No matching elections found"
              : "No elections yet"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Adjust your search terms or filter criteria to view available elections."
              : "Create an election to begin."}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button
              onClick={openCreateModal}
              size="sm"
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create Election
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredElections.map((election) => (
            <Card
              key={election.id}
              className="border border-border bg-card hover:border-primary/40 transition-colors shadow-xs flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-[10px] font-semibold">
                    {election.status_name}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-foreground line-clamp-1 mt-2">
                  {election.name}
                </CardTitle>
                {election.description && (
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {election.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4 pt-0 text-xs">
                <div className="space-y-1.5 border-t border-border/50 pt-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Start: {formatElectionDateWAT(election.start_datetime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>End: {formatElectionDateWAT(election.end_datetime)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/20 p-2.5 text-center text-xs">
                  <div>
                    <span className="block font-bold text-foreground">{election.position_count || 0}</span>
                    <span className="text-[10px] text-muted-foreground">Positions</span>
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">{election.candidate_count || 0}</span>
                    <span className="text-[10px] text-muted-foreground">Candidates</span>
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">{election.voter_count || 0}</span>
                    <span className="text-[10px] text-muted-foreground">Voters</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1.5">
                  <Button
                    onClick={() => navigate(`/admin/elections/${election.id}`)}
                    className="w-full text-xs font-semibold gap-1.5"
                    size="sm"
                  >
                    <span>Manage Election</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  {election.status_name.toLowerCase() === "draft" && (
                    <Button
                      onClick={() => {
                        setDeletingElection(election);
                        setDeleteError(null);
                        setShowDeleteConfirm(true);
                      }}
                      variant="outline"
                      className="w-full text-xs font-semibold gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:hover:bg-red-950/20"
                      size="sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Draft</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Election Modal with Section 11 Review Step */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-xs p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-lg border-border shadow-xl my-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold text-foreground">
                    {step === "configure" ? "Create Election" : "Review Election Schedule"}
                  </CardTitle>
                  <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                    Step {step === "configure" ? "1 of 2" : "2 of 2"}
                  </span>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {step === "configure"
                    ? "Set election title, voting period in West Africa Time, and academic session."
                    : "Confirm the election details and timezone before initialization."}
                </CardDescription>
              </div>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            {step === "configure" ? (
              <form onSubmit={handleProceedToReview}>
                <CardContent className="space-y-4 pt-4 text-xs">
                  {createError && (
                    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Election Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Students' Union Executive Elections"
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Description / Guidelines
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Official description, eligibility notes, or electoral guidelines..."
                      className="w-full h-20 rounded-md border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Academic Session <span className="text-destructive">*</span>
                    </label>
                    {academicSessions.length === 0 ? (
                      <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20">
                        No academic sessions found in the system. An academic session must exist before creating an election.
                      </div>
                    ) : (
                      <select
                        value={formData.academic_session_id}
                        onChange={(e) =>
                          setFormData({ ...formData, academic_session_id: e.target.value })
                        }
                        required
                        className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {academicSessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Authoritative Department <span className="text-destructive">*</span>
                    </label>
                    {departments.length === 0 ? (
                      <div className="p-2.5 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20">
                        No departments found.
                      </div>
                    ) : (
                      <select
                        value={formData.department_id}
                        onChange={(e) =>
                          setFormData({ ...formData, department_id: e.target.value })
                        }
                        required
                        className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Section 10 DateTimePickerWAT */}
                  <div className="space-y-3 pt-1">
                    <DateTimePickerWAT
                      id="election-start"
                      label="Voting Opens (Start)"
                      value={formData.start_datetime}
                      onChange={(val) => setFormData({ ...formData, start_datetime: val })}
                      required
                    />

                    <DateTimePickerWAT
                      id="election-end"
                      label="Voting Closes (End)"
                      value={formData.end_datetime}
                      onChange={(val) => setFormData({ ...formData, end_datetime: val })}
                      required
                    />
                  </div>

                  {/* Electoral Admin Assignment Section (Owner Decision 4) */}
                  <div className="space-y-2.5 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                        <span>Electoral Admin Assignment</span>
                      </label>
                      <Badge variant="secondary" className="text-[10px]">
                        Owner Decision 4
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setElectoralAdminMode("existing")}
                        disabled={availableOfficers.length === 0}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                          electoralAdminMode === "existing"
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-border bg-card text-muted-foreground hover:border-border/80"
                        } ${availableOfficers.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <UserCheck className="h-4 w-4 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold leading-tight">Path A: Existing</div>
                          <div className="text-[10px] text-muted-foreground font-normal">
                            Select assigned officer ({availableOfficers.length})
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setElectoralAdminMode("new")}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                          electoralAdminMode === "new"
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-border bg-card text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        <UserPlus className="h-4 w-4 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold leading-tight">Path B: Provision New</div>
                          <div className="text-[10px] text-muted-foreground font-normal">
                            Create &amp; assign officer
                          </div>
                        </div>
                      </button>
                    </div>

                    {electoralAdminMode === "existing" && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] text-muted-foreground font-medium">
                          Select Existing Electoral Admin
                        </label>
                        {availableOfficers.length === 0 ? (
                          <div className="p-2.5 rounded-md bg-muted/40 text-muted-foreground text-xs border border-border">
                            No existing Electoral Admins found. Please use Path B to provision one.
                          </div>
                        ) : (
                          <select
                            value={selectedOfficerId}
                            onChange={(e) => setSelectedOfficerId(e.target.value)}
                            className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            {availableOfficers.map((officer) => (
                              <option key={officer.id} value={officer.id}>
                                {officer.email} ({officer.role.replace("_", " ")})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {electoralAdminMode === "new" && (
                      <div className="space-y-2 pt-1 p-3 rounded-lg border border-primary/20 bg-primary/5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-foreground">
                            Proposed Electoral Admin Email <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="email"
                            placeholder="electoral.admin@polyibadan.edu.ng"
                            value={newOfficerEmail}
                            onChange={(e) => setNewOfficerEmail(e.target.value)}
                            className="text-xs bg-background h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-foreground">
                            Proposed Temporary Password <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="password"
                            placeholder="Min. 8 characters"
                            value={newOfficerPassword}
                            onChange={(e) => setNewOfficerPassword(e.target.value)}
                            className="text-xs bg-background h-8"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          This administrator will be securely provisioned with the <strong>Electoral Admin</strong> role and automatically assigned to this election upon creation.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Initial Status
                    </label>
                    <select
                      value={formData.election_status_id}
                      onChange={(e) =>
                        setFormData({ ...formData, election_status_id: e.target.value })
                      }
                      className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>

                <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateDialog(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={academicSessions.length === 0}
                    className="text-xs font-semibold gap-1"
                  >
                    <span>Continue to Review</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            ) : (
              /* Section 11 Review Step */
              <div>
                <CardContent className="space-y-4 pt-4 text-xs">
                  {createError && (
                    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Election Name
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-0.5">
                        {formData.name}
                      </h3>
                      {formData.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Academic Session
                        </span>
                        <p className="text-xs font-semibold text-foreground mt-0.5">
                          {selectedSession?.name || "None"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Initial Status
                        </span>
                        <p className="text-xs font-semibold text-foreground mt-0.5">
                          {selectedStatus?.name || "Draft"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Voting Schedule
                        </span>
                        <Badge variant="secondary" className="text-[10px] font-medium gap-1">
                          <Globe className="h-2.5 w-2.5" />
                          West Africa Time
                        </Badge>
                      </div>

                      <div className="space-y-1.5 rounded-lg bg-background p-3 border border-border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-emerald-500" />
                            Opens
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatElectionDateWAT(formData.start_datetime, {
                              longDate: true,
                              separator: " · ",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/50">
                          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            Closes
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatElectionDateWAT(formData.end_datetime, {
                              longDate: true,
                              separator: " · ",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Assigned Electoral Administrator (OD-04)
                      </span>
                      <p className="text-xs font-semibold text-foreground mt-0.5">
                        {electoralAdminMode === "existing"
                          ? availableOfficers.find((o) => o.id === selectedOfficerId)?.email || "Selected Existing Officer"
                          : electoralAdminMode === "new"
                          ? `New: ${newOfficerEmail} (Role: electoral_admin)`
                          : "None"}
                      </p>
                    </div>
                  </div>
                </CardContent>

                <div className="flex items-center justify-between p-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStep("configure")}
                    disabled={creating}
                    className="text-xs gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Edit</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleFinalSubmit}
                    disabled={creating}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{creating ? "Creating..." : "Create Election"}</span>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
      {/* Delete Draft Election Confirmation Modal */}
      {showDeleteConfirm && deletingElection && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-xs p-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-md border-border shadow-xl my-auto">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Delete Draft Election?</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                This action is permanent and cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              {deleteError && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs border border-destructive/20 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <p className="text-sm text-foreground/80 leading-relaxed">
                Are you sure you want to delete the draft election <strong className="text-foreground">"{deletingElection.name}"</strong>?
              </p>
              
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3.5 space-y-1.5 text-[11px] text-red-700 dark:text-red-400 leading-normal">
                <p className="font-bold flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>The following dependent configurations will be deleted:</span>
                </p>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li>Election record details</li>
                  <li>All configured elective positions</li>
                  <li>All candidate applications/approvals associated with this election</li>
                  <li>All matching records in the election-specific student register</li>
                </ul>
              </div>
            </CardContent>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingElection(null);
                }}
                disabled={deleteLoading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteElection}
                disabled={deleteLoading}
                className="text-xs font-semibold gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{deleteLoading ? "Deleting..." : "Delete Permanently"}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
