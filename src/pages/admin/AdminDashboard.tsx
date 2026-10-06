import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import {
  getRoleDisplayName,
  type AdminElection,
} from "@/features/admin/types";
import { getAdminElections } from "@/features/admin/services/adminElectionService";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Vote,
  Users,
  Calendar,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Activity,
  Award,
} from "lucide-react";
import { formatElectionDateWAT } from "@/features/elections/utils/electionUtils";
import { ParticipationChart } from "@/components/admin/ParticipationChart";

interface RecentActivityItem {
  id: string;
  type: "election_created" | "status_change" | "results";
  title: string;
  description: string;
  timestamp: string;
  electionId: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [elections, setElections] = useState<AdminElection[]>([]);
  const [totalParticipation, setTotalParticipation] = useState<number>(0);
  const [resultsAwaitingReview, setResultsAwaitingReview] = useState<AdminElection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roleName = getRoleDisplayName(user?.role);

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [electionsData, { count: participationCount }] = await Promise.all([
          getAdminElections(),
          supabase.from("voter_participation").select("id", { count: "exact", head: true }),
        ]);

        if (!ignore) {
          setElections(electionsData);
          setTotalParticipation(participationCount || 0);

          // Elections that are closed/concluded but not yet published
          const awaitingReview = electionsData.filter((e) => {
            const status = e.status_name.toLowerCase();
            return status === "closed" || status === "ended" || status === "calculated";
          });
          setResultsAwaitingReview(awaitingReview);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load admin dashboard:", err);
          setError(err instanceof Error ? err.message : "Failed to load administrative overview.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      ignore = true;
    };
  }, []);

  // Compute aggregate stats
  const totalElections = elections.length;
  const activeElections = elections.filter((e) => {
    const status = e.status_name.toLowerCase();
    return status === "open" || status === "active";
  }).length;
  const totalVoters = elections.reduce((acc, e) => acc + (e.voter_count || 0), 0);

  // Derive real recent activities from elections data
  const recentActivities: RecentActivityItem[] = elections
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      type: "election_created",
      title: `Election Created: ${e.name}`,
      description: `Initial state: ${e.status_name} · ${e.position_count || 0} position(s) configured`,
      timestamp: e.created_at,
      electionId: e.id,
    }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Vote className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Electoral Administration
                </span>
                <Badge variant="secondary" className="text-[10px] font-bold border-primary text-primary">
                  {roleName}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                Election Operations Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Oversee student elections, monitor voter participation, configure candidate rosters, and publish verified results.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/candidates")}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Award className="h-4 w-4 text-primary" />
              Candidate Approval & Vetting
            </Button>
            <Button
              onClick={() => navigate("/admin/elections")}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <PlusCircle className="h-4 w-4" />
              Manage Elections
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Summary Cards (Section 4 Requirement) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Elections */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Elections</span>
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-2xl font-bold mt-1 text-foreground">
              {loading ? "..." : activeElections}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Voting currently in progress
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Card 2: Registered Voters */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Registered Voters</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold mt-1 text-foreground">
              {loading ? "..." : totalVoters.toLocaleString()}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Across verified voter registers
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Card 3: Voter Participation */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Voter Participation</span>
              <Vote className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold mt-1 text-foreground">
              {loading ? "..." : totalParticipation.toLocaleString()}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Total ballots recorded
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Card 4: Results Awaiting Review */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Awaiting Review</span>
              <FileText className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-bold mt-1 text-foreground">
              {loading ? "..." : resultsAwaitingReview.length}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Concluded elections pending sign-off
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-xs flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Real Participation Chart (Section 5 Requirement) */}
      <ParticipationChart
        elections={elections.map((e) => ({ id: e.id, name: e.name, voter_count: e.voter_count }))}
      />

      {/* Two-Column Operational Layout: Results Awaiting Attention & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results Requiring Attention (Section 6 Requirement) */}
        <Card className="border border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Results Review & Publication
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {resultsAwaitingReview.length} Pending
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Concluded voting cycles awaiting certification and official publication.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 flex-1">
            {loading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Checking election status...
              </div>
            ) : resultsAwaitingReview.length === 0 ? (
              /* Empty state (Section 8 Requirement) */
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-muted/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <h4 className="text-sm font-semibold text-foreground">No results awaiting review</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  You&apos;re all caught up. Concluded elections requiring certification will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {resultsAwaitingReview.map((election) => (
                  <div
                    key={election.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">
                        {election.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Concluded on {formatElectionDateWAT(election.end_datetime)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/admin/elections/${election.id}`)}
                      className="text-xs font-semibold gap-1 self-start sm:self-auto shrink-0"
                    >
                      <span>Review Results</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Operational Activity (Section 7 Requirement) */}
        <Card className="border border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Recent Activity
                </CardTitle>
              </div>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Operational updates and recent institutional election changes.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 flex-1">
            {loading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Loading activity log...
              </div>
            ) : recentActivities.length === 0 ? (
              /* Empty state (Section 8 Requirement) */
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-muted/10">
                <Activity className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <h4 className="text-sm font-semibold text-foreground">No recent activity</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Election activity will appear here as the system is used.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-muted/15"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Vote className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                          {formatElectionDateWAT(act.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {act.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Elections Overview Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Election Portfolio</h2>
            <p className="text-xs text-muted-foreground">
              Select an election to manage positions, approve candidates, verify registers, or monitor live voting.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/elections")}
            className="text-xs gap-1.5"
          >
            <span>View All ({totalElections})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs">
            Loading elections portfolio...
          </div>
        ) : elections.length === 0 ? (
          /* Empty state (Section 8 Requirement) */
          <Card className="border border-border border-dashed p-8 text-center">
            <Vote className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-base font-bold text-foreground">No elections yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
              Create an election to begin.
            </p>
            <Button
              onClick={() => navigate("/admin/elections")}
              size="sm"
              className="gap-1.5 text-xs font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              Create Election
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {elections.slice(0, 6).map((election) => (
              <Card
                key={election.id}
                className="border border-border bg-card hover:border-primary/40 transition-colors shadow-xs flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                      {election.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] shrink-0 font-semibold">
                      {election.status_name}
                    </Badge>
                  </div>
                  {election.description && (
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {election.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 border-t border-border/50 pt-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatElectionDateWAT(election.start_datetime)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 rounded-md bg-muted/20 p-2 text-center text-[11px]">
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

                  <Button
                    onClick={() => navigate(`/admin/elections/${election.id}`)}
                    className="w-full text-xs font-semibold gap-1.5"
                    size="sm"
                    variant="default"
                  >
                    <span>Manage Election</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
