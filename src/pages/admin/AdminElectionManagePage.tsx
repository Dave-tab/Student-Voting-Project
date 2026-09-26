import { useEffect, useState } from "react";
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
import { ElectionLifecycleTab } from "@/features/admin/components/ElectionLifecycleTab";
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

type TabKey = "overview" | "positions" | "candidates" | "register" | "lifecycle";

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

  const loadData = async () => {
    if (!id) return;
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
  };

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    Promise.all([
      getAdminElectionById(id),
      getElectionStatuses(),
    ])
      .then(([electionData, statusesData]) => {
        if (!ignore) {
          if (!electionData) {
            setError("Election record could not be found in the database.");
          } else {
            setElection(electionData);
            setStatuses(statusesData);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load election management data:", err);
          setError(err instanceof Error ? err.message : "Failed to load election.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

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
