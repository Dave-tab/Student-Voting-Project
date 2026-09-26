import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { BarChart3, Users, Clock, Loader2, TrendingUp } from "lucide-react";
import { INSTITUTIONAL_TIMEZONE } from "@/features/elections/utils/electionUtils";

interface ParticipationChartProps {
  electionId?: string;
  elections?: Array<{ id: string; name: string; voter_count?: number }>;
  className?: string;
}

type TimeFilter = "today" | "7d" | "30d" | "all";

interface TimeBucket {
  label: string;
  count: number;
  dateKey: string;
}

export function ParticipationChart({
  electionId: initialElectionId,
  elections = [],
  className = "",
}: ParticipationChartProps) {
  const [selectedElectionId, setSelectedElectionId] = useState<string>(
    initialElectionId || (elections[0]?.id ?? "all")
  );
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [participationRecords, setParticipationRecords] = useState<Array<{ participated_at: string; election_id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBucket, setHoveredBucket] = useState<TimeBucket | null>(null);

  // Fetch real participation data from public.voter_participation
  useEffect(() => {
    let ignore = false;
    async function fetchParticipation() {
      try {
        setLoading(true);
        let query = supabase
          .from("voter_participation")
          .select("participated_at, election_id")
          .order("participated_at", { ascending: true });

        if (selectedElectionId && selectedElectionId !== "all") {
          query = query.eq("election_id", selectedElectionId);
        }

        const { data, error } = await query;
        if (error) {
          console.warn("Could not query voter_participation:", error);
          if (!ignore) setParticipationRecords([]);
        } else if (!ignore) {
          setParticipationRecords(data || []);
        }
      } catch (err) {
        console.warn("Participation fetch error:", err);
        if (!ignore) setParticipationRecords([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchParticipation();
    return () => {
      ignore = true;
    };
  }, [selectedElectionId]);

  // Filter records based on time window
  const filteredRecords = useMemo(() => {
    if (participationRecords.length === 0) return [];
    const now = new Date();

    if (timeFilter === "today") {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      return participationRecords.filter((r) => new Date(r.participated_at) >= startOfDay);
    }

    if (timeFilter === "7d") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return participationRecords.filter((r) => new Date(r.participated_at) >= sevenDaysAgo);
    }

    if (timeFilter === "30d") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return participationRecords.filter((r) => new Date(r.participated_at) >= thirtyDaysAgo);
    }

    return participationRecords;
  }, [participationRecords, timeFilter]);

  // Group into time buckets
  const buckets = useMemo(() => {
    if (filteredRecords.length === 0) return [];

    const bucketMap = new Map<string, number>();

    // For "today", group by hour in WAT
    if (timeFilter === "today") {
      // Initialize all 24 hours of today
      for (let h = 0; h < 24; h++) {
        const hourLabel = `${h.toString().padStart(2, "0")}:00`;
        bucketMap.set(hourLabel, 0);
      }

      filteredRecords.forEach((r) => {
        const d = new Date(r.participated_at);
        const hour = new Intl.DateTimeFormat("en-US", {
          timeZone: INSTITUTIONAL_TIMEZONE,
          hour: "2-digit",
          hour12: false,
        }).format(d);
        const key = `${hour}:00`;
        bucketMap.set(key, (bucketMap.get(key) || 0) + 1);
      });
    } else {
      // Group by day (e.g. "26 Sep") in WAT
      filteredRecords.forEach((r) => {
        const d = new Date(r.participated_at);
        const dayKey = new Intl.DateTimeFormat("en-GB", {
          timeZone: INSTITUTIONAL_TIMEZONE,
          day: "numeric",
          month: "short",
        }).format(d);
        bucketMap.set(dayKey, (bucketMap.get(dayKey) || 0) + 1);
      });
    }

    const result: TimeBucket[] = [];
    bucketMap.forEach((count, label) => {
      result.push({
        label,
        count,
        dateKey: label,
      });
    });

    return result;
  }, [filteredRecords, timeFilter]);

  const totalParticipation = filteredRecords.length;
  const maxBucketCount = Math.max(...buckets.map((b) => b.count), 1);
  const peakBucket = buckets.reduce(
    (max, b) => (b.count > (max?.count || 0) ? b : max),
    null as TimeBucket | null
  );

  return (
    <Card className={`border border-border bg-card shadow-xs ${className}`}>
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">
                Voter Participation
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Verified turnout over time derived authoritatively from voter participation records.
            </CardDescription>
          </div>

          {/* Controls: Election selector & Time range */}
          <div className="flex flex-wrap items-center gap-2">
            {elections.length > 0 && (
              <select
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Filter by election"
              >
                <option value="all">All Elections</option>
                {elections.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.name}
                  </option>
                ))}
              </select>
            )}

            <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-xs">
              {(["today", "7d", "30d", "all"] as TimeFilter[]).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setTimeFilter(filterKey)}
                  className={`rounded-sm px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    timeFilter === filterKey
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filterKey === "today"
                    ? "Today"
                    : filterKey === "7d"
                    ? "7 Days"
                    : filterKey === "30d"
                    ? "30 Days"
                    : "All Time"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          <div className="flex h-52 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Loading verified participation metrics...</span>
          </div>
        ) : totalParticipation === 0 ? (
          /* Empty State (Section 8 Requirement) */
          <div className="flex h-52 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <h4 className="text-sm font-semibold text-foreground">No participation data yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Participation will appear as voters take part in an open election.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Metric Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-primary" />
                  Total Votes Recorded
                </span>
                <span className="text-xl font-bold text-foreground mt-0.5 block">
                  {totalParticipation.toLocaleString()}
                </span>
              </div>

              {peakBucket && peakBucket.count > 0 && (
                <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    Peak Activity Window
                  </span>
                  <span className="text-sm font-bold text-foreground mt-0.5 block">
                    {peakBucket.label} ({peakBucket.count} votes)
                  </span>
                </div>
              )}

              <div className="col-span-2 sm:col-span-1 rounded-lg bg-muted/30 p-3 border border-border/50">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-primary" />
                  Time Basis
                </span>
                <span className="text-xs font-semibold text-foreground mt-1 block">
                  West Africa Time
                </span>
              </div>
            </div>

            {/* SVG / Pure CSS Responsive Bar Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                <span>Voter Activity Distribution</span>
                {hoveredBucket && (
                  <span className="font-semibold text-primary animate-fade-in">
                    {hoveredBucket.label}: {hoveredBucket.count} voter{hoveredBucket.count === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <div className="flex h-40 w-full items-end gap-1.5 rounded-lg border border-border bg-muted/10 p-3">
                {buckets.map((bucket, idx) => {
                  const heightPercent = Math.max(
                    (bucket.count / maxBucketCount) * 100,
                    bucket.count > 0 ? 8 : 2
                  );

                  const isHovered = hoveredBucket?.label === bucket.label;

                  return (
                    <div
                      key={`${bucket.label}-${idx}`}
                      className="group relative flex flex-1 flex-col items-center justify-end h-full"
                      onMouseEnter={() => setHoveredBucket(bucket)}
                      onMouseLeave={() => setHoveredBucket(null)}
                    >
                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[36px] rounded-t transition-all duration-200 cursor-pointer ${
                          isHovered
                            ? "bg-primary shadow-xs"
                            : bucket.count > 0
                            ? "bg-primary/80 hover:bg-primary"
                            : "bg-muted-foreground/15 hover:bg-muted-foreground/30"
                        }`}
                      />

                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-8 z-20 whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] font-semibold text-popover-foreground shadow-md border border-border pointer-events-none animate-in fade-in">
                          {bucket.label}: {bucket.count}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between text-[10px] text-muted-foreground px-1 font-mono">
                <span>{buckets[0]?.label || ""}</span>
                {buckets.length > 2 && (
                  <span>{buckets[Math.floor(buckets.length / 2)]?.label || ""}</span>
                )}
                <span>{buckets[buckets.length - 1]?.label || ""}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
