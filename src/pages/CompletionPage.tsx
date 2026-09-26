import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVoting } from "@/features/voting/context/VotingContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/layouts/Breadcrumb";
import {
  CheckCircle2,
  ShieldCheck,
  LayoutDashboard,
  Eye,
  Calendar,
  AlertCircle,
} from "lucide-react";

/**
 * CompletionPage (B49, B50, B81)
 * Route: /elections/:id/completed
 *
 * ARCHITECTURAL GOVERNANCE RULES:
 * 1. Reached ONLY upon authentic backend success (submissionResult must exist).
 * 2. Decision D: No Vote Reference Code, Ballot ID, or tracking token is issued.
 * 3. Approved completion semantics:
 *    "Vote submitted successfully. Your participation has been recorded."
 * 4. Anonymous Ballot Architecture: Candidate selections and voter identity are never linked.
 * 5. B50 Navigation actions:
 *    - Primary: Return to Dashboard (/)
 *    - Secondary: View Election Overview (/elections/:id)
 */
export default function CompletionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { submissionResult } = useVoting();

  useEffect(() => {
    // If no authentic submission result exists in session state, voter cannot access this page.
    if (!submissionResult || !submissionResult.success) {
      navigate(`/elections/${id}`);
    }
  }, [submissionResult, id, navigate]);

  if (!submissionResult || !submissionResult.success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-lg font-bold text-foreground">No Confirmed Submission Found</h2>
        <p className="text-xs text-muted-foreground">
          You cannot access the completion screen without a confirmed vote submission from the system.
        </p>
        <Button onClick={() => navigate(`/elections/${id}`)} variant="outline" size="sm">
          Return to Election
        </Button>
      </div>
    );
  }

  const completionMessage =
    submissionResult.message ||
    "Vote submitted successfully. Your participation has been recorded.";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Elections", href: "/elections" },
          { label: "Vote Confirmation" },
        ]}
      />

      {/* Completion Confirmation Card */}
      <Card className="border border-emerald-500/30 bg-card shadow-sm">
        <CardHeader className="text-center pb-4 pt-8 space-y-3">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/5">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-1">
            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-xs uppercase tracking-wider">
              Ballot Successfully Recorded
            </Badge>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground pt-2">
              Official Vote Confirmed
            </CardTitle>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {completionMessage}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2 px-6 sm:px-10">
          {/* Official Submission Status & Privacy Guarantee */}
          <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Voter Turnout & Privacy Separation</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your participation has been recorded in the voter participation register to guarantee election integrity. Your individual candidate selections have been stored anonymously without any persistent identity association.
            </p>
          </div>

          {/* Submission Timestamp & Integrity Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-md bg-background border border-border flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px]">Submission Time</span>
                <span className="font-semibold text-foreground">
                  {submissionResult.participatedAt
                    ? new Date(submissionResult.participatedAt).toLocaleString()
                    : new Date().toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-background border border-border flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px]">Ballot Privacy</span>
                <span className="font-semibold text-foreground">Anonymous Ballot</span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* B50 Post-Submission Navigation: Primary Dashboard & Secondary Overview */}
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 pb-8 px-6 sm:px-10 border-t border-border bg-muted/10">
          <Button
            variant="outline"
            onClick={() => navigate(`/elections/${id}`)}
            className="w-full sm:w-auto text-xs gap-2"
          >
            <Eye className="h-3.5 w-3.5" />
            View Election Overview
          </Button>

          <Button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto text-xs gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
