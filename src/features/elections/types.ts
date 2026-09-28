export type ElectionStatusType =
  | "Draft"
  | "Planning"
  | "Scheduled"
  | "Upcoming"
  | "Open"
  | "Active"
  | "Closed"
  | "Ended"
  | "Published"
  | "Archived";

export interface ElectionStatus {
  id: string;
  name: string;
  description?: string;
}

export interface Election {
  id: string;
  name?: string; // Live PostgreSQL column is public.elections.name
  title: string; // Frontend display alias for backwards compatibility
  description?: string | null;
  start_datetime: string;
  end_datetime: string;
  status_id?: string;
  status?: ElectionStatus | string;
  created_at?: string;
  updated_at?: string;
}

export interface Position {
  id: string;
  election_id: string;
  name: string;
  description?: string | null;
  display_order: number; // Synthetic/fallback order; live DB public.positions uses (created_at, name)
  created_at?: string;
  updated_at?: string;
}

export interface CandidateStudent {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  matriculation_number?: string | null;
  department?: string | null;
  level?: string | null;
  programme?: string | null;
}

export interface CandidateDetails {
  candidate_id?: string;
  campaign_slogan?: string | null;
  manifesto?: string | null;
  photo_path?: string | null;
  approval_remarks?: string | null;
  withdrawal_reason?: string | null;
  is_profile_complete?: boolean;
}

export interface CandidateStatus {
  id: string;
  name: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  position_id: string;
  student_id: string;
  status_id?: string;
  status?: CandidateStatus | string;
  student?: CandidateStudent | null;
  candidate_details?: CandidateDetails | null;
  created_at?: string;
  updated_at?: string;
}
