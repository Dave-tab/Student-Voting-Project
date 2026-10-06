import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import {
  isSuperAdmin,
  isElectoralOfficer,
  type AdminElection,
  type LookupStatus,
} from "@/features/admin/types";
import {
  getAdminElectionById,
  getElectionStatuses,
} from "@/features/admin/services/adminElectionService";
import { ElectionOverviewTab } from "@/features/admin/components/ElectionOverviewTab";
import { ElectionPositionsTab } from "@/features/admin/components/ElectionPositionsTab";
import { ElectionCandidatesTab } from "@/features/admin/components/ElectionCandidatesTab";
import { ElectionRegisterTab } from "@/features/admin/components/ElectionRegisterTab";
import { ElectionOfficersTab } from "@/features/admin/components/ElectionOfficersTab";
import { ElectionLifecycleTab } from "@/features/admin/components/ElectionLifecycleTab";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Award,
  Users,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatElectionDate } from "@/features/elections/utils/electionUtils";

type TabKey = "overview" | "positions" | "candidates" | "register" | "officers" | "lifecycle";

export default function AdminElectionManagePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [election, setElection] = useState<AdminElection | null>(null);
  const [statuses, setStatuses] = useState<LookupStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeTab = (searchParams.get("tab") as TabKey) || "overview";

  const superAdmin = isSuperAdmin(user?.role);
  const electoralOfficer = isElectoralOfficer(user?.role);

  const isValidUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  const loadData = useCallback(async () => {
    if (!id || !isValidUuid(id)) return;
    try {
      setLoading(true);
      setError(null);
      const [electionData, statusesData] = await Promise.all([
        getAdminElectionById(id),
        getElectionStatuses(),
      ]);

      if (!electionData) {
        setError("Election record could not be found in the database.");
      } else {
        setElection(electionData);
        setStatuses(statusesData);
      }
    } catch (err) {
      console.error("Failed to load election management data:", err);
      setError(err instanceof Error ? err.message : "Failed to load election.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      if (!id || !isValidUuid(id)) {
        if (!ignore) {
          setError("Invalid or placeholder election ID. Please select a valid election from the Elections management dashboard.");
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Step 1: Synchronize authoritative database lifecycle status
        try {
          await supabase.rpc("check_and_advance_election_lifecycle", {
            p_election_id: id,
          });
        } catch (advErr) {
          console.warn("check_and_advance_election_lifecycle notice:", advErr);
        }

        const [electionData, statusesData] = await Promise.all([
          getAdminElectionById(id),
          getElectionStatuses(),
        ]);

        if (!electionData) {
          setError("Election record could not be found in the database.");
        } else {
          if (!ignore) {
            setElection(electionData);
            setStatuses(statusesData);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load election management data:", err);
          setError(err instanceof Error ? err.message : "Failed to load election.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [id]);

  // --- REAL-TIME AUTHORITATIVE LIFECYCLE MONITORING (Synced with Timer) ---
  useEffect(() => {
    if (!election) return;
    const statusName = election.status_name.toLowerCase();
    if (statusName !== "open" && statusName !== "active" && statusName !== "scheduled") {
      return;
    }

    const checkAuthoritativeLifecycle = async () => {
      const now = new Date();
      const start = new Date(election.start_datetime);
      const end = new Date(election.end_datetime);

      // Check if timeline boundaries are crossed
      if ((statusName === "scheduled" && now >= start) || ((statusName === "open" || statusName === "active") && now > end)) {
        try {
          console.log("Boundary reached: synchronizing authoritative database lifecycle...");
          await supabase.rpc("check_and_advance_election_lifecycle", {
            p_election_id: election.id,
          });
          await loadData();
        } catch (err) {
          console.error("Lifecycle background check failed:", err);
        }
      }
    };

    const timer = setInterval(checkAuthoritativeLifecycle, 15000); // Check every 15 seconds
    return () => clearInterval(timer);
  }, [election, statuses, id, loadData]);
  // -----------------------------------------------------------

  const setTab = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-muted-foreground">
        Loading election administration console...
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/elections")}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Elections</span>
        </Button>

        <div className="p-6 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="h-5 w-5" />
            <span>Election Record Error</span>
          </div>
          <p>{error || "The requested election does not exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            onClick={() => navigate("/admin/elections")}
            className="hover:text-foreground transition-colors"
          >
            Elections
          </button>
          <span>/</span>
          <span className="font-semibold text-foreground truncate max-w-xs">
            {election.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/elections/${election.id}`)}
            className="text-xs gap-1.5 h-8"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Contest View</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/elections")}
            className="text-xs gap-1.5 h-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Elections</span>
          </Button>
        </div>
      </div>

      {/* Main Election Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider">
                {election.status_name}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
              {election.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Start: {formatElectionDate(election.start_datetime)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                End: {formatElectionDate(election.end_datetime)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center rounded-lg border border-border bg-muted/20 p-3 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Presiding Scope
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">
                {superAdmin ? "Platform Administrator" : electoralOfficer ? "Assigned Election" : "Administrator"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto gap-1">
        <button
          onClick={() => setTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Election Details</span>
        </button>

        <button
          onClick={() => setTab("positions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "positions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Offices ({election.position_count || 0})</span>
        </button>

        <button
          onClick={() => setTab("candidates")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "candidates"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Candidates ({election.candidate_count || 0})</span>
        </button>

        <button
          onClick={() => setTab("register")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "register"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Voter Register ({election.voter_count || 0})</span>
        </button>

        <button
          onClick={() => setTab("officers")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "officers"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Electoral Officers</span>
        </button>

        <button
          onClick={() => setTab("lifecycle")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "lifecycle"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Lifecycle & Results</span>
        </button>
      </div>

      {/* Active Tab Body */}
      <div>
        {activeTab === "overview" && (
          <ElectionOverviewTab
            election={election}
            statuses={statuses}
            onRefresh={loadData}
          />
        )}

        {activeTab === "positions" && (
          <ElectionPositionsTab electionId={election.id} />
        )}

        {activeTab === "candidates" && (
          <ElectionCandidatesTab
            electionId={election.id}
          />
        )}

        {activeTab === "register" && (
          <ElectionRegisterTab electionId={election.id} />
        )}

        {activeTab === "officers" && (
          <ElectionOfficersTab electionId={election.id} />
        )}

        {activeTab === "lifecycle" && (
          <ElectionLifecycleTab
            election={election}
            statuses={statuses}
            onRefresh={loadData}
          />
        )}
      </div>
    </div>
  );
}
