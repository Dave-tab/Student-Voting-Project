import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserCheck, Mail, Hash, BookOpen, GraduationCap, Building2, Calendar, AlertCircle } from "lucide-react";
import { getStudentProfileDetails, type StudentProfileData } from "@/features/elections/services/electionService";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadProfile() {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getStudentProfileDetails(user.id, user.email || "");
        if (ignore) return;
        if (data) {
          setProfile(data);
        } else {
          setError("No institutional student profile found for this account. Ensure your account is activated.");
        }
      } catch (err) {
        if (!ignore) {
          setError("An unexpected error occurred while loading your profile.");
          console.error(err);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      ignore = true;
    };
  }, [user?.id, user?.email]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center text-xs text-muted-foreground animate-pulse">
        Loading institutional profile records...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4">
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-xs flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <strong>Notice:</strong> {error || "Profile could not be resolved."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <UserCheck className="h-4 w-4 text-primary" />
          <span>Student Account & Profile</span>
        </div>
        <div className="flex items-center gap-3">
          <img
            src="/images/branding/polytechnic-ibadan-logo.png"
            alt="The Polytechnic, Ibadan Seal"
            className="h-10 w-10 shrink-0 rounded-full object-contain border border-border bg-white p-0.5"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Institutional Identity Profile
            </h1>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              The Polytechnic, Ibadan
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Official voter record maintained by the university registry. Institutional data is managed centrally and is read-only.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Status Card */}
        <Card className="border border-border bg-card shadow-sm md:col-span-1 flex flex-col justify-between">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xl border border-primary/20 mb-3">
              {profile.fullName.slice(0, 2).toUpperCase()}
            </div>
            <CardTitle className="text-lg font-bold">{profile.fullName}</CardTitle>
            <CardDescription className="text-xs font-mono">{profile.matricNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 border-t border-border mt-2">
            <div className="flex items-center justify-between text-sm pt-4">
              <span className="text-muted-foreground">Account Status</span>
              <Badge variant="success">
                {profile.accountStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Voter Eligibility</span>
              <Badge variant="default">
                {profile.voterEligibility}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Authoritative Details Card */}
        <Card className="border border-border bg-card shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Academic Record</CardTitle>
            <CardDescription>
              Registered credentials sourced directly from the official institutional voter register.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 p-3.5 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Hash className="h-3.5 w-3.5" />
                  <span>Matriculation Number</span>
                </div>
                <p className="text-sm font-semibold text-foreground font-mono">{profile.matricNumber}</p>
              </div>

              <div className="space-y-1 p-3.5 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Registered Email</span>
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{profile.email}</p>
              </div>

              <div className="space-y-1 p-3.5 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Department</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{profile.department}</p>
              </div>

              <div className="space-y-1 p-3.5 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Programme</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{profile.programme}</p>
              </div>

              <div className="space-y-1 p-3.5 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Study Level</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{profile.level}</p>
              </div>

              <div className="space-y-1 p-3.5 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Admission Session</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{profile.admissionYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
