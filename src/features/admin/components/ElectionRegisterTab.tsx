import { useEffect, useState } from "react";
import type { AdminVoterRegisterEntry } from "../types";
import {
  getAdminVoterRegister,
  addVoterToRegister,
  removeVoterFromRegister,
  bulkImportVoterRegister,
  type CSVVoterInput,
} from "../services/adminRegisterService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Upload,
  FileSpreadsheet,
  X,
} from "lucide-react";

interface ElectionRegisterTabProps {
  electionId: string;
}

export function ElectionRegisterTab({ electionId }: ElectionRegisterTabProps) {
  const [voters, setVoters] = useState<AdminVoterRegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  // CSV Import State
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvParsedRows, setCsvParsedRows] = useState<CSVVoterInput[]>([]);
  const [importingCsv, setImportingCsv] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Add voter form
  const [matricNumber, setMatricNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  async function loadVoters(search?: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminVoterRegister(electionId, search);
      setVoters(data);
    } catch (err) {
      console.error("Failed to load voter register:", err);
      setError(err instanceof Error ? err.message : "Failed to load voter register.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    getAdminVoterRegister(electionId, searchQuery)
      .then((data) => {
        if (!ignore) {
          setVoters(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load voter register:", err);
          setError(err instanceof Error ? err.message : "Failed to load voter register.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [electionId, searchQuery]);

  const handleAddVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNumber.trim()) return;

    try {
      setAdding(true);
      setError(null);
      await addVoterToRegister({
        election_id: electionId,
        matriculation_number: matricNumber.trim().toUpperCase(),
        full_name: fullName.trim() || undefined,
        email: email.trim() || undefined,
      });

      setMatricNumber("");
      setFullName("");
      setEmail("");
      setActionSuccess("Student successfully registered on the election voter register.");
      await loadVoters(searchQuery);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to add voter:", err);
      setError(err instanceof Error ? err.message : "Failed to add voter to register.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveVoter = async (registerId: string, matric: string) => {
    if (!confirm(`Are you sure you want to remove ${matric} from the election voter register? This will revoke their eligibility for this specific election.`)) {
      return;
    }

    try {
      setRemovingId(registerId);
      setError(null);
      await removeVoterFromRegister(registerId);
      setActionSuccess(`Removed ${matric} from the voter register.`);
      await loadVoters(searchQuery);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to remove voter:", err);
      setError(err instanceof Error ? err.message : "Failed to remove voter.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
        parseCsvPreview(text);
      }
    };
    reader.onerror = () => setCsvError("Failed to read uploaded file.");
    reader.readAsText(file);
  };

  const parseCsvPreview = (text: string) => {
    try {
      setCsvError(null);
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        throw new Error("CSV must contain a header row and at least one student data row.");
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[\s_-]+/g, "_"));
      const parsed: CSVVoterInput[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map((cell) => cell.trim());
        if (row.length === 0 || row.every((c) => c === "")) continue;

        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx] || "";
        });

        parsed.push({
          matriculation_number: obj.matriculation_number || obj.matric_number || obj.matric || obj.student_id || row[0] || "",
          email: obj.email || obj.institutional_email || row[2] || "",
          full_name: obj.full_name || obj.student_name || obj.name || row[1] || "",
          department: obj.department || obj.dept || row[3] || "Computer Science",
          level: obj.level || obj.nd_hnd || row[4] || "ND2",
          year_of_admission: parseInt(obj.year_of_admission || obj.admission_year || row[5] || "2024", 10) || 2024,
        });
      }

      if (parsed.length === 0) {
        throw new Error("No valid student rows found in CSV.");
      }

      setCsvParsedRows(parsed);
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : "Failed to parse CSV.");
      setCsvParsedRows([]);
    }
  };

  const handleExecuteCsvImport = async () => {
    if (csvParsedRows.length === 0) return;

    try {
      setImportingCsv(true);
      setCsvError(null);
      const res = await bulkImportVoterRegister(electionId, csvParsedRows);
      setActionSuccess(res.message || `Successfully imported ${csvParsedRows.length} voters to register.`);
      setCsvModalOpen(false);
      setCsvText("");
      setCsvParsedRows([]);
      await loadVoters(searchQuery);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error("CSV import execution failed:", err);
      setCsvError(err instanceof Error ? err.message : "Failed to import CSV register.");
    } finally {
      setImportingCsv(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Election Voter Register</h2>
            <Badge variant="secondary" className="text-xs font-semibold">
              {voters.length} Registered
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Authoritative election voter register (student_register) defining student eligibility for this election.
          </p>
        </div>
        <div>
          <Button
            onClick={() => setCsvModalOpen(true)}
            size="sm"
            className="text-xs font-semibold gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import CSV Register
          </Button>
        </div>
      </div>

      {/* Anonymity Invariant Notice */}
      <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Voter Privacy & Architectural Decoupling:</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          The election voter register tracks student electoral eligibility. Individual ballots and selections are decoupled from voter identity and completely anonymous. No administrator can inspect individual voting choices.
        </p>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Eligible Voter Form */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-foreground">
            Add Student to Register
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Add an eligible student to this election voter register.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <form onSubmit={handleAddVoter} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <Input
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                placeholder="Matriculation Number *"
                required
                className="text-xs h-9 uppercase"
              />
            </div>
            <div>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name (optional)"
                className="text-xs h-9"
              />
            </div>
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Institutional Email (optional)"
                className="text-xs h-9"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={adding || !matricNumber.trim()}
              className="h-9 text-xs font-semibold gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {adding ? "Adding..." : "Add to Register"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by matric number or name..."
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* Voters Table */}
      {loading ? (
        <div className="p-8 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs">
          Querying voter register...
        </div>
      ) : voters.length === 0 ? (
        <Card className="border border-border border-dashed p-8 text-center">
          <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-sm font-bold text-foreground">
            {searchQuery ? "No Matching Students Found" : "Voter Register Is Empty"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {searchQuery
              ? "Try adjusting your search criteria."
              : "Eligible students must be in the election voter register before they can participate in this election."}
          </p>
        </Card>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Matriculation No.</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Institutional Email</th>
                  <th className="px-4 py-3">Registration Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {voters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {voter.matriculation_number}
                    </td>
                    <td className="px-4 py-3 text-foreground/90">
                      {voter.full_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                      {voter.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(voter.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVoter(voter.id, voter.matriculation_number)}
                        disabled={removingId === voter.id}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Import Election Voter Register via CSV</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCsvModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground">
              <p>
                Upload or paste CSV data matching the required schema: <code className="text-foreground font-mono bg-muted px-1.5 py-0.5 rounded">matriculation_number, email, full_name, department, level, year_of_admission</code>.
              </p>

              <div>
                <label htmlFor="csvFile" className="text-xs font-semibold text-foreground block mb-1">
                  Choose CSV File
                </label>
                <input
                  id="csvFile"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="csvPaste" className="text-xs font-semibold text-foreground block mb-1">
                  Or Paste CSV Text Content
                </label>
                <textarea
                  id="csvPaste"
                  rows={5}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    parseCsvPreview(e.target.value);
                  }}
                  placeholder="matriculation_number,email,full_name,department,level,year_of_admission&#10;ND/2024/001,student1@polyibadan.edu.ng,John Doe,Computer Science,ND2,2024"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {csvError && (
                <div className="p-2.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{csvError}</span>
                </div>
              )}

              {csvParsedRows.length > 0 && (
                <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Parsed Preview</span>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {csvParsedRows.length} Students Validated
                    </Badge>
                  </div>
                  <div className="max-h-36 overflow-y-auto text-[11px] font-mono space-y-1 divide-y divide-border/40">
                    {csvParsedRows.slice(0, 10).map((row, idx) => (
                      <div key={idx} className="pt-1 flex justify-between gap-2">
                        <span className="font-bold text-foreground">{row.matriculation_number}</span>
                        <span className="text-muted-foreground truncate">{row.full_name || row.email || "No Name"}</span>
                      </div>
                    ))}
                    {csvParsedRows.length > 10 && (
                      <div className="text-center text-muted-foreground pt-1">
                        ...and {csvParsedRows.length - 10} more rows.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCsvModalOpen(false)}
                disabled={importingCsv}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteCsvImport}
                disabled={importingCsv || csvParsedRows.length === 0}
                className="text-xs font-semibold gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                {importingCsv ? "Importing Register..." : `Import ${csvParsedRows.length} Voters`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
