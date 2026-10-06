/**
 * Authoritative Supabase Database Type Definitions
 * 
 * Project: Student Online Voting Platform
 * Specification: v2.3.0-FINAL-CORRECTED
 * Chief Architect: David Ayantade Tolulope
 * 
 * Target Physical Tables (21):
 * 1. users
 * 2. roles
 * 3. account_statuses
 * 4. students
 * 5. administrators
 * 6. departments
 * 7. levels
 * 8. academic_sessions
 * 9. elections
 * 10. election_statuses
 * 11. student_register
 * 12. election_officer_assignments
 * 13. positions
 * 14. candidates
 * 15. candidate_statuses
 * 16. candidate_details
 * 17. voter_participation
 * 18. ballot_selections
 * 19. election_results
 * 20. election_result_entries
 * 21. audit_logs
 * 
 * Permanently Retired Entities: institutional_students, programmes, ballots, votes
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role_id: string;
          account_status_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role_id: string;
          account_status_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role_id?: string;
          account_status_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "users_account_status_id_fkey";
            columns: ["account_status_id"];
            isOneToOne: false;
            referencedRelation: "account_statuses";
            referencedColumns: ["id"];
          }
        ];
      };

      roles: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      account_statuses: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      students: {
        Row: {
          id: string;
          user_id: string;
          matriculation_number: string;
          first_name: string;
          last_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          matriculation_number: string;
          first_name: string;
          last_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          matriculation_number?: string;
          first_name?: string;
          last_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      administrators: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "administrators_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      departments: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      levels: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      academic_sessions: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      elections: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_datetime: string;
          end_datetime: string;
          election_status_id: string;
          academic_session_id: string;
          department_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          start_datetime: string;
          end_datetime: string;
          election_status_id: string;
          academic_session_id: string;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          start_datetime?: string;
          end_datetime?: string;
          election_status_id?: string;
          academic_session_id?: string;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "elections_election_status_id_fkey";
            columns: ["election_status_id"];
            isOneToOne: false;
            referencedRelation: "election_statuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "elections_academic_session_id_fkey";
            columns: ["academic_session_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id"];
          }
        ];
      };

      election_statuses: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      student_register: {
        Row: {
          id: string;
          election_id: string;
          matriculation_number: string;
          email: string;
          full_name: string;
          department_id: string;
          level_id: string;
          year_of_admission: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          matriculation_number: string;
          email: string;
          full_name: string;
          department_id: string;
          level_id: string;
          year_of_admission: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          matriculation_number?: string;
          email?: string;
          full_name?: string;
          department_id?: string;
          level_id?: string;
          year_of_admission?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_register_election_id_fkey";
            columns: ["election_id"];
            isOneToOne: false;
            referencedRelation: "elections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_register_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_register_level_id_fkey";
            columns: ["level_id"];
            isOneToOne: false;
            referencedRelation: "levels";
            referencedColumns: ["id"];
          }
        ];
      };

      election_officer_assignments: {
        Row: {
          id: string;
          election_id: string;
          user_id: string;
          assigned_at: string;
          assigned_by: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          user_id: string;
          assigned_at?: string;
          assigned_by: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          user_id?: string;
          assigned_at?: string;
          assigned_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "officer_assignments_election_id_fkey";
            columns: ["election_id"];
            isOneToOne: false;
            referencedRelation: "elections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "officer_assignments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      positions: {
        Row: {
          id: string;
          election_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "positions_election_id_fkey";
            columns: ["election_id"];
            isOneToOne: false;
            referencedRelation: "elections";
            referencedColumns: ["id"];
          }
        ];
      };

      candidates: {
        Row: {
          id: string;
          election_id: string;
          position_id: string;
          student_id: string;
          candidate_status_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          position_id: string;
          student_id: string;
          candidate_status_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          position_id?: string;
          student_id?: string;
          candidate_status_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "candidates_election_id_fkey";
            columns: ["election_id"];
            isOneToOne: false;
            referencedRelation: "elections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "candidates_position_id_fkey";
            columns: ["position_id"];
            isOneToOne: false;
            referencedRelation: "positions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "candidates_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "candidates_candidate_status_id_fkey";
            columns: ["candidate_status_id"];
            isOneToOne: false;
            referencedRelation: "candidate_statuses";
            referencedColumns: ["id"];
          }
        ];
      };

      candidate_statuses: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      candidate_details: {
        Row: {
          id: string;
          candidate_id: string;
          campaign_slogan: string | null;
          manifesto: string | null;
          photo_path: string | null;
          approval_remarks: string | null;
          withdrawal_reason: string | null;
          is_profile_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          campaign_slogan?: string | null;
          manifesto?: string | null;
          photo_path?: string | null;
          approval_remarks?: string | null;
          withdrawal_reason?: string | null;
          is_profile_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          campaign_slogan?: string | null;
          manifesto?: string | null;
          photo_path?: string | null;
          approval_remarks?: string | null;
          withdrawal_reason?: string | null;
          is_profile_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "candidate_details_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: true;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          }
        ];
      };

      voter_participation: {
        Row: {
          id: string;
          election_id: string;
          student_id: string;
          participated_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          student_id: string;
          participated_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          student_id?: string;
          participated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "voter_participation_election_id_fkey";
            columns: ["election_id"];
            isOneToOne: false;
            referencedRelation: "elections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "voter_participation_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          }
        ];
      };

      ballot_selections: {
        Row: {
          id: string;
          election_id: string;
          position_id: string;
          candidate_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          position_id: string;
          candidate_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          position_id?: string;
          candidate_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ballot_selections_election_id_fkey";
            columns: ["election_id"];
            isOneToOne: false;
            referencedRelation: "elections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ballot_selections_position_id_fkey";
            columns: ["position_id"];
            isOneToOne: false;
            referencedRelation: "positions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ballot_selections_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          }
        ];
      };

      election_results: {
        Row: {
          id: string;
          election_id: string;
          position_id: string;
          lifecycle_status: "CALCULATED" | "REVIEWED" | "PUBLISHED";
          outcome_status: "WINNER" | "TIED" | "NO_VALID_SELECTION";
          calculated_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          published_at: string | null;
          published_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          position_id: string;
          lifecycle_status: "CALCULATED" | "REVIEWED" | "PUBLISHED";
          outcome_status: "WINNER" | "TIED" | "NO_VALID_SELECTION";
          calculated_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          published_at?: string | null;
          published_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          position_id?: string;
          lifecycle_status?: "CALCULATED" | "REVIEWED" | "PUBLISHED";
          outcome_status?: "WINNER" | "TIED" | "NO_VALID_SELECTION";
          calculated_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          published_at?: string | null;
          published_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "election_results_election_id_fkey";
            columns: ["election_id"];
            isOneToOne: false;
            referencedRelation: "elections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "election_results_position_id_fkey";
            columns: ["position_id"];
            isOneToOne: false;
            referencedRelation: "positions";
            referencedColumns: ["id"];
          }
        ];
      };

      election_result_entries: {
        Row: {
          id: string;
          election_result_id: string;
          candidate_id: string;
          vote_count: number;
          vote_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          election_result_id: string;
          candidate_id: string;
          vote_count: number;
          vote_percentage: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          election_result_id?: string;
          candidate_id?: string;
          vote_count?: number;
          vote_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "result_entries_result_id_fkey";
            columns: ["election_result_id"];
            isOneToOne: false;
            referencedRelation: "election_results";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "result_entries_candidate_id_fkey";
            columns: ["candidate_id"];
            isOneToOne: false;
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          }
        ];
      };

      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          entity_type: string;
          entity_id: string | null;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          entity_type: string;
          entity_id?: string | null;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          entity_type?: string;
          entity_id?: string | null;
          description?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };

    Views: Record<string, never>;

    Functions: {
      submit_ballot: {
        Args: {
          p_election_id: string;
          p_selections: Json;
        };
        Returns: Json;
      };
      check_and_advance_election_lifecycle: {
        Args: {
          p_election_id: string;
        };
        Returns: string;
      };
      calculate_election_results: {
        Args: {
          p_election_id: string;
        };
        Returns: Json;
      };
      import_student_register: {
        Args: {
          p_election_id: string;
          p_students: Json;
        };
        Returns: Json;
      };
      review_election_results: {
        Args: {
          p_election_id: string;
        };
        Returns: Json;
      };
      publish_election_results: {
        Args: {
          p_election_id: string;
        };
        Returns: Json;
      };
      get_published_election_results: {
        Args: {
          p_election_id: string;
        };
        Returns: Json;
      };
      submit_candidate_application: {
        Args: {
          p_election_id: string;
          p_position_id: string;
          p_campaign_slogan: string | null;
          p_manifesto: string | null;
          p_photo_path: string | null;
        };
        Returns: Json;
      };
      get_approved_election_candidates: {
        Args: {
          p_election_id: string;
        };
        Returns: Json;
      };
      resubmit_candidate_application: {
        Args: {
          p_candidate_id: string;
          p_campaign_slogan: string | null;
          p_manifesto: string | null;
          p_photo_path: string | null;
        };
        Returns: Json;
      };
    };
  };
}

// Convenient helper row type aliases
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type AccountStatusRow = Database["public"]["Tables"]["account_statuses"]["Row"];
export type RoleRow = Database["public"]["Tables"]["roles"]["Row"];
export type AdministratorRow = Database["public"]["Tables"]["administrators"]["Row"];
export type StudentRow = Database["public"]["Tables"]["students"]["Row"];
export type StudentRegisterRow = Database["public"]["Tables"]["student_register"]["Row"];
export type ElectionOfficerAssignmentRow = Database["public"]["Tables"]["election_officer_assignments"]["Row"];
export type AcademicSessionRow = Database["public"]["Tables"]["academic_sessions"]["Row"];
export type DepartmentRow = Database["public"]["Tables"]["departments"]["Row"];
export type LevelRow = Database["public"]["Tables"]["levels"]["Row"];
export type ElectionRow = Database["public"]["Tables"]["elections"]["Row"];
export type ElectionStatusRow = Database["public"]["Tables"]["election_statuses"]["Row"];
export type PositionRow = Database["public"]["Tables"]["positions"]["Row"];
export type CandidateRow = Database["public"]["Tables"]["candidates"]["Row"];
export type CandidateDetailsRow = Database["public"]["Tables"]["candidate_details"]["Row"];
export type CandidateStatusRow = Database["public"]["Tables"]["candidate_statuses"]["Row"];
export type VoterParticipationRow = Database["public"]["Tables"]["voter_participation"]["Row"];
export type BallotSelectionRow = Database["public"]["Tables"]["ballot_selections"]["Row"];
export type ElectionResultRow = Database["public"]["Tables"]["election_results"]["Row"];
export type ElectionResultEntryRow = Database["public"]["Tables"]["election_result_entries"]["Row"];
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
