/**
 * Administrative Domain Types & RBAC Helpers
 * Conforms to Package 6 Batches B54-B60 architectural specifications.
 */

export type PlatformRole =
  | "super_admin"
  | "system_administrator"
  | "admin"
  | "administrator"
  | "electoral_admin"
  | "electoral_officer"
  | "student";

export const ADMINISTRATIVE_ROLES = [
  "super_admin",
  "system_administrator",
  "admin",
  "administrator",
  "electoral_admin",
  "electoral_officer",
] as const;

export type AdministrativeRole = (typeof ADMINISTRATIVE_ROLES)[number];

export function isAdministrativeRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim().replace(/[-\s]+/g, "_");
  return ADMINISTRATIVE_ROLES.includes(normalized as AdministrativeRole);
}

export function isSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim().replace(/[-\s]+/g, "_");
  return normalized === "super_admin";
}

export function isElectoralOfficer(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim().replace(/[-\s]+/g, "_");
  return normalized === "electoral_officer" || normalized === "electoral_admin";
}

export function isSystemAdministrator(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim().replace(/[-\s]+/g, "_");
  return normalized === "system_administrator";
}

export function isAdmin(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim().replace(/[-\s]+/g, "_");
  return normalized === "admin" || normalized === "administrator";
}

export function canManageAdministrators(role?: string | null): boolean {
  return isSuperAdmin(role) || isSystemAdministrator(role);
}

export function isAdminOrSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim().replace(/[-\s]+/g, "_");
  return (
    normalized === "super_admin" ||
    normalized === "admin" ||
    normalized === "administrator" ||
    normalized === "system_administrator"
  );
}

export function getRoleDisplayName(role?: string | null): string {
  if (!role) return "Student";
  const normalized = role.toLowerCase().trim().replace(/[-\s]+/g, "_");
  switch (normalized) {
    case "super_admin":
      return "Super Administrator";
    case "system_administrator":
      return "System Administrator";
    case "admin":
    case "administrator":
      return "Admin";
    case "electoral_admin":
    case "electoral_officer":
      return "Electoral Admin";
    default:
      return "Student";
  }
}

/**
 * Election administrative view record
 */
export interface AdminElection {
  id: string;
  name: string;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  election_status_id: string;
  academic_session_id?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  status_name: string;
  created_at: string;
  updated_at: string;
  position_count?: number;
  candidate_count?: number;
  voter_count?: number; // Total eligible students in register
  votes_cast?: number; // Total students who have actually participated
}

/**
 * Elective position record
 * CRITICAL SCHEMA FACT: No 'display_order' column exists in public.positions.
 * Ordering is by created_at, name.
 */
export interface AdminPosition {
  id: string;
  name: string;
  election_id: string;
  created_at: string;
  updated_at: string;
  candidate_count?: number;
}

/**
 * Candidate management record
 */
export interface AdminCandidate {
  id: string;
  election_id: string;
  election_name?: string;
  position_id: string;
  position_name: string;
  student_id: string;
  matriculation_number: string;
  full_name: string;
  department?: string;
  candidate_status_id: string;
  status_name: string;
  manifesto: string | null;
  campaign_slogan: string | null;
  photo_path: string | null;
  approval_remarks: string | null;
  withdrawal_reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Election-specific voter register record (student_register)
 */
export interface AdminVoterRegisterEntry {
  id: string;
  election_id: string;
  matriculation_number: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

/**
 * Lookup status entry
 */
export interface LookupStatus {
  id: string;
  name: string;
}
