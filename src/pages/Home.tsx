import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { isAdministrativeRole } from "@/features/admin/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Vote,
  ShieldCheck,
  UserCheck,
  Calendar,
  ArrowRight,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getStudentMatricNumber,
  getEligibleElections,
  getStudentProfileDetails,
} from "@/features/elections/services/electionService";
import {
  formatElectionDateWAT,
  getElectionStatus,
  getElectionStatusBadgeConfig,
  getPresentationCountdown,
} from "@/features/elections/utils/electionUtils";
import type { Election } from "@/features/elections/types";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [matricNumber, setMatricNumber] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-redirect administrative accounts to /admin
  useEffect(() => {
    if (isAdministrativeRole(user?.role)) {
      navigate("/admin", { replace: true });
    }
  }, [user?.role, navigate]);

  useEffect(() => {
    let ignore = false;

    async function loadStudentData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Resolve student profile details to get their full name
        const profile = await getStudentProfileDetails(user.id, user.email || "");
        if (ignore) return;
        let activeMatric = null;
        if (profile) {
          setStudentName(profile.fullName);
          setMatricNumber(profile.matricNumber);
          activeMatric = profile.matricNumber;
        } else {
          const matric = await getStudentMatricNumber(user.id, user.email);
          if (ignore) return;
          setMatricNumber(matric);
          activeMatric = matric;
        }

        // 2. Fetch eligible elections
        if (activeMatric) {
          const eligible = await getEligibleElections(activeMatric);
          if (!ignore) setElections(eligible);
        } else {
          if (!ignore) setElections([]);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load student dashboard:", err);
          setError(err instanceof Error ? err.message : "Failed to load dashboard.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadStudentData();
    return () => {
      ignore = true;
    };
  }, [user?.id, user?.email]);

  // Categorize elections for student
  const openElections = elections.filter((e) => {
    const status = getElectionStatus(e);
    return status === "Open" || status === "Active";
  });

  const upcomingElections = elections.filter((e) => {
    const status = getElectionStatus(e);
    return status === "Scheduled" || status === "Upcoming" || status === "Draft";
  });

  const completedElections = elections.filter((e) => {
    const status = getElectionStatus(e);
    return status === "Closed" || status === "Ended" || status === "Published" || status === "Archived";
  });

  const isVerified = Boolean(matricNumber);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 rounded-xl border border-border bg-card shadow-xs">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Vote className="h-4 w-4 text-primary" />
            <span>Student Dashboard</span>
          </div>
          <div className="flex items-center gap-3.5">
            <img
              src="/images/branding/polytechnic-ibadan-logo.png"
              alt="The Polytechnic, Ibadan Seal"
              className="h-12 w-12 shrink-0 rounded-full object-contain border border-border bg-white p-0.5 shadow-xs"
            />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                The Polytechnic, Ibadan
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Welcome back, {studentName || (user?.email ? user.email.split("@")[0] : "Student")}
              </h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Your institutional portal for participating in student governance, examining candidate manifestos, casting secure ballots, and viewing certified election results.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!isVerified && (
            <Button onClick={() => navigate("/activate")} variant="outline" className="gap-2 text-xs">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Activate Voter Profile
            </Button>
          )}
          <Button onClick={() => navigate("/profile")} variant="outline" className="gap-2 text-xs">
            <UserCheck className="h-4 w-4" />
            View Profile
          </Button>
          <Button onClick={() => navigate("/elections")} className="gap-2 text-xs font-semibold">
            <Vote className="h-4 w-4" />
            Available Elections
          </Button>
        </div>
      </div>

      {/* Voter Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Voter Status */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Voter Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isVerified ? "Active & Verified" : "Activation Required"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isVerified
                ? `Matric: ${matricNumber} · Eligible to vote in assigned registers.`
                : "Complete voter verification to participate in institutional ballots."}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Active Contests */}
        <Card
          className="border border-border bg-card shadow-xs hover:border-primary/40 cursor-pointer transition-colors"
          onClick={() => navigate("/elections")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Contests</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : openElections.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {openElections.length === 1
                ? "1 election currently open for voting."
                : `${openElections.length} elections currently open for voting.`}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Democratic Security */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ballot Privacy</CardTitle>
            <Badge variant="default" className="text-[10px]">
              Anonymous
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Secret &amp; Verifiable</div>
            <p className="text-xs text-muted-foreground mt-1">
              Your votes are completely decoupled from your identity to guarantee privacy.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-xs flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <strong>Notice:</strong> {error}
          </div>
        </div>
      )}

      {/* Section 1: Available (Open) Elections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Available Elections</h2>
            <p className="text-xs text-muted-foreground">
              Elections currently open for voting in your institutional constituency.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs">
            Loading eligible elections...
          </div>
        ) : openElections.length === 0 ? (
          /* Empty state */
          <Card className="border border-border border-dashed p-8 text-center bg-card/50">
            <Vote className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
            <h3 className="text-sm font-bold text-foreground">No active elections open right now</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              When voting opens for an election in your department or constituency, it will appear here.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openElections.map((election) => {
              const badge = getElectionStatusBadgeConfig(getElectionStatus(election));
              const countdown = getPresentationCountdown(election, now);

              return (
                <Card
                  key={election.id}
                  className="border border-emerald-500/30 bg-card shadow-xs flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="success" className="text-[10px]">
                        {badge.label}
                      </Badge>
                      {countdown && (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {countdown}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold text-foreground line-clamp-1 mt-2">
                      {election.name || election.title}
                    </CardTitle>
                    {election.description && (
                      <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {election.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 border-t border-border/60 pt-2.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Closes: {formatElectionDateWAT(election.end_datetime)}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        onClick={() => navigate(`/elections/${election.id}/ballot`)}
                        className="w-full text-xs font-semibold gap-1.5"
                        size="sm"
                      >
                        <Vote className="h-3.5 w-3.5" />
                        <span>Vote Now</span>
                      </Button>
                      <Button
                        onClick={() => navigate(`/elections/${election.id}`)}
                        variant="outline"
                        className="text-xs"
                        size="sm"
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Upcoming & Completed Elections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Elections */}
        <Card className="border border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">
                Upcoming Elections
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Scheduled elections that will open in upcoming voting windows.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 flex-1">
            {loading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Checking upcoming schedules...
              </div>
            ) : upcomingElections.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-muted/10">
                <Calendar className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <h4 className="text-sm font-semibold text-foreground">No upcoming elections</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Scheduled elections will appear here before their voting window opens.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingElections.map((election) => (
                  <div
                    key={election.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">
                        {election.name || election.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Opens {formatElectionDateWAT(election.start_datetime)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/elections/${election.id}`)}
                      className="text-xs font-semibold gap-1 self-start sm:self-auto shrink-0"
                    >
                      <span>View Election</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed & Published Elections */}
        <Card className="border border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">
                Completed &amp; Published Results
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Concluded election cycles with certified results.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 flex-1">
            {loading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Loading completed election records...
              </div>
            ) : completedElections.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-muted/10">
                <FileText className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <h4 className="text-sm font-semibold text-foreground">No completed elections</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Certified results will be available here after election conclusion and publication.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedElections.map((election) => (
                  <div
                    key={election.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">
                        {election.name || election.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Concluded {formatElectionDateWAT(election.end_datetime)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/elections/${election.id}/results`)}
                      className="text-xs font-semibold gap-1 self-start sm:self-auto shrink-0"
                    >
                      <span>View Results</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
