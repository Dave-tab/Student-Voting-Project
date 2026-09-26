import { useEffect, useState } from "react";
import type { AdminPosition } from "../types";
import {
  getAdminPositions,
  createAdminPosition,
  updateAdminPosition,
  deleteAdminPosition,
} from "../services/adminPositionService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Award,
  Calendar,
} from "lucide-react";

interface ElectionPositionsTabProps {
  electionId: string;
}

export function ElectionPositionsTab({ electionId }: ElectionPositionsTabProps) {
  const [positions, setPositions] = useState<AdminPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Position Form
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadPositions() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminPositions(electionId);
      setPositions(data);
    } catch (err) {
      console.error("Failed to load positions:", err);
      setError(err instanceof Error ? err.message : "Failed to load positions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    getAdminPositions(electionId)
      .then((data) => {
        if (!ignore) {
          setPositions(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load positions:", err);
          setError(err instanceof Error ? err.message : "Failed to load positions.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [electionId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setCreating(true);
      setError(null);
      await createAdminPosition(electionId, newTitle);
      setNewTitle("");
      await loadPositions();
    } catch (err) {
      console.error("Failed to create position:", err);
      setError(err instanceof Error ? err.message : "Failed to create position.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (pos: AdminPosition) => {
    setEditingId(pos.id);
    setEditingTitle(pos.name);
  };

  const handleSaveEdit = async (posId: string) => {
    if (!editingTitle.trim()) return;
    try {
      setSavingEdit(true);
      setError(null);
      await updateAdminPosition(posId, editingTitle);
      setEditingId(null);
      await loadPositions();
    } catch (err) {
      console.error("Failed to update position:", err);
      setError(err instanceof Error ? err.message : "Failed to update position.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (posId: string) => {
    if (!confirm("Are you sure you want to remove this elective office? All candidate nominations for this position will also be affected.")) {
      return;
    }

    try {
      setDeletingId(posId);
      setError(null);
      await deleteAdminPosition(posId);
      await loadPositions();
    } catch (err) {
      console.error("Failed to delete position:", err);
      setError(err instanceof Error ? err.message : "Failed to delete position.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Elective Positions</h2>
            <Badge variant="secondary" className="text-xs font-semibold">
              {positions.length} Configured
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define institutional offices contested in this election (ordered by created date).
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Position Form */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-foreground">
            Configure Elective Office
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Add a recognized leadership office to this election contest.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-center gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. President, Vice President, General Secretary..."
              className="text-xs h-9 flex-1"
              required
            />
            <Button
              type="submit"
              size="sm"
              disabled={creating || !newTitle.trim()}
              className="gap-1.5 text-xs font-semibold h-9 shrink-0 w-full sm:w-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              {creating ? "Adding..." : "Add Position"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Positions List */}
      {loading ? (
        <div className="p-8 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs">
          Loading configured positions...
        </div>
      ) : positions.length === 0 ? (
        <Card className="border border-border border-dashed p-8 text-center">
          <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-sm font-bold text-foreground">No Elective Positions Defined</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            An election requires at least one elective office before candidates can be registered and ballots cast.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {positions.map((pos, index) => (
            <div
              key={pos.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card shadow-xs"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-muted-foreground font-mono">
                  {index + 1}
                </span>

                {editingId === pos.id ? (
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="text-xs h-8"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(pos.id)}
                      disabled={savingEdit}
                      className="h-8 px-2 text-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="h-8 px-2 text-xs"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-bold text-foreground truncate">{pos.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-semibold text-foreground/80">
                        <Award className="h-3 w-3 text-primary" />
                        {pos.candidate_count || 0} Candidate{(pos.candidate_count || 0) === 1 ? "" : "s"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Added {new Date(pos.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {editingId !== pos.id && (
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(pos)}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Rename</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(pos.id)}
                    disabled={deletingId === pos.id}
                    className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
