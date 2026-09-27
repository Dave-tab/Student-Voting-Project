import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import {
  getEligibleElections,
  getStudentMatricNumber,
} from "@/features/elections/services/electionService";
import type { Election } from "@/features/elections/types";
import {
  getElectionStatus,
  getElectionStatusBadgeConfig,
  getPresentationCountdown,
  formatElectionDate,
} from "@/features/elections/utils/electionUtils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/EmptyState";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Breadcrumb } from "@/components/layouts/Breadcrumb";
import {
  Vote,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  Inbox,
  AlertTriangle,
  Award,
} from "lucide-react";

export default function Elections() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [matricNumber, setMatricNumber] = useState<string | null>(null);

  const [refreshIndex, setRefreshIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const resolvedMatric = await getStudentMatricNumber(user.id, user.email);
        if (!isMounted) return;
        setMatricNumber(resolvedMatric);

        const data = await getEligibleElections(resolvedMatric);
        if (!isMounted) return;
        setElections(data);
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("Error loading eligible elections:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "Unable to load eligible elections from the database. Please verify your connection.";
        setError(msg);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, refreshIndex]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Elections" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Vote className="h-4 w-4 text-primary" />
            <span>The Polytechnic, Ibadan &bull; Official Voter Register Discovery</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Eligible Elections
          </h1>
          <p className="text-sm text-muted-foreground">
            Institutional ballots for which your credentials appear on the verified voter register.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setRefreshIndex((p) => p + 1)}
          disabled={loading}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Registry
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="error">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to retrieve election registry</AlertTitle>
          <AlertDescription className="mt-1 flex flex-col gap-2">
            <span>{error}</span>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRefreshIndex((p) => p + 1)}
                className="mt-2 text-xs"
              >
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy="true">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-border bg-background p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/5" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && elections.length === 0 && (
        <Card className="border border-border bg-background">
          <EmptyState>
            <EmptyStateIcon>
              <Inbox className="h-10 w-10" />
            </EmptyStateIcon>
            <EmptyStateTitle>No Eligible Elections Found</EmptyStateTitle>
            <EmptyStateDescription>
              {matricNumber
                ? `Matriculation number ${matricNumber} is not currently registered for any scheduled or active elections.`
                : "Your account is not yet linked to an institutional matriculation number on the voter register."}
            </EmptyStateDescription>
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/activate")}
                className="text-xs"
              >
                Verify Register Activation
              </Button>
              <Button
                variant="outline"
                onClick={() => setRefreshIndex((p) => p + 1)}
                className="text-xs"
              >
                Check Again
              </Button>
            </div>
          </EmptyState>
        </Card>
      )}

      {/* Data Available: Responsive Grid of Eligible Elections */}
      {!loading && !error && elections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.map((election) => {
            const status = getElectionStatus(election);
            const badgeConfig = getElectionStatusBadgeConfig(status);
            const countdownText = getPresentationCountdown(election, now);

            return (
              <Card
                key={election.id}
                className="border border-border bg-card shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-xl font-bold leading-snug">
                      {election.title}
                    </CardTitle>
                    <Badge variant={badgeConfig.variant} className="shrink-0">
                      {badgeConfig.label}
                    </Badge>
                  </div>
                  {election.description && (
                    <CardDescription className="line-clamp-2 text-muted-foreground">
                      {election.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-md border border-border">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>
                        <strong className="text-foreground font-semibold">Voting Window:</strong>{" "}
                        {formatElectionDate(election.start_datetime)} &ndash;{" "}
                        {formatElectionDate(election.end_datetime)}
                      </span>
                    </div>
                    {countdownText && (
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{countdownText}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border bg-muted/15 px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    Verified Register Match
                  </span>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {(status === "Closed" || status === "Ended" || status === "Archived") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/elections/${election.id}/results`)}
                        className="gap-1.5 text-xs"
                      >
                        <Award className="h-3.5 w-3.5 text-primary" />
                        Results
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate(`/elections/${election.id}`)}
                      className="gap-2 text-sm"
                      size="sm"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
