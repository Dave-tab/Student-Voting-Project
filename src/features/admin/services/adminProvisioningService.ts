// ==============================================================================
// Admin Provisioning Service
// Milestone 4 - Package 9 - Batch B68
// Project Owner & Chief Architect: David Ayantade Tolulope
//
// Client service for initiating trusted administrative account provisioning
// via the Supabase Edge Function 'admin-provisioning'.
// ==============================================================================

import { supabase } from "@/lib/supabase";

export interface AdminProvisioningParams {
  email: string;
  password: string;
  role: "super_admin" | "admin" | "administrator" | "electoral_officer";
}

export interface AdminProvisioningResult {
  success: boolean;
  message: string;
  userId?: string;
  role?: string;
  error?: string;
}

/**
 * Initiates trusted administrative account provisioning through the dedicated Supabase Edge Function.
 * Requires caller to be authenticated with Active Super Admin role.
 */
export async function provisionAdminAccount(
  params: AdminProvisioningParams
): Promise<AdminProvisioningResult> {
  const { email, password, role } = params;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      return {
        success: false,
        message: "Authentication required. You must be signed in as an administrator.",
        error: "Unauthenticated caller.",
      };
    }

    const { data, error } = await supabase.functions.invoke("admin-provisioning", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        email: email.trim().toLowerCase(),
        password: password,
        role: role,
      },
    });

    if (error) {
      const errorMsg =
        error.message || "Failed to communicate with administrative provisioning service.";

      if (
        errorMsg.includes("404") ||
        errorMsg.toLowerCase().includes("not found") ||
        errorMsg.toLowerCase().includes("failed to send a request to the edge function")
      ) {
        return {
          success: false,
          message:
            "The administrative provisioning service is awaiting Edge Function deployment by the system administrator.",
          error: "Edge Function 'admin-provisioning' not yet deployed on Supabase.",
        };
      }

      return {
        success: false,
        message: errorMsg,
        error: errorMsg,
      };
    }

    if (!data || data.success === false) {
      return {
        success: false,
        message: data?.error || "Administrative provisioning failed.",
        error: data?.error || "Provisioning failed.",
      };
    }

    return {
      success: true,
      message: data.message || "Administrative account successfully provisioned.",
      userId: data.user_id,
      role: data.role,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected network error occurred.";
    return {
      success: false,
      message,
      error: message,
    };
  }
}

export interface AdministrativeAccount {
  id: string;
  email: string;
  role: string;
  status: string;
  assignedElections: { id: string; name: string }[];
}

/**
 * Fetches all non-student administrative users and their assigned elections.
 * Restricted to Super Admins.
 */
export async function getAdministrativeAccounts(): Promise<AdministrativeAccount[]> {
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      roles ( id, name ),
      account_statuses ( id, name )
    `);

  if (error) {
    throw new Error(`Failed to load administrative accounts: ${error.message}`);
  }

  interface AdminQueryRow {
    id: string;
    email: string;
    roles?: { id?: string; name?: string } | { id?: string; name?: string }[] | null;
    account_statuses?: { id?: string; name?: string } | { id?: string; name?: string }[] | null;
  }

  interface AssignmentQueryRow {
    election_id: string;
    elections?: { id?: string; name?: string } | { id?: string; name?: string }[] | null;
  }

  const allUsers = (data || []) as unknown as AdminQueryRow[];

  const adminUsers = allUsers.filter((u) => {
    const roleObj = Array.isArray(u.roles) ? u.roles[0] : u.roles;
    const roleName = roleObj?.name || "student";
    return roleName.toLowerCase() !== "student";
  });

  const enriched = await Promise.all(
    adminUsers.map(async (u) => {
      const roleObj = Array.isArray(u.roles) ? u.roles[0] : u.roles;
      const statusObj = Array.isArray(u.account_statuses) ? u.account_statuses[0] : u.account_statuses;

      let assignments: { id: string; name: string }[] = [];
      if (roleObj?.name?.toLowerCase() === "electoral_officer") {
        const { data: assignData } = await supabase
          .from("election_officer_assignments")
          .select(`
            election_id,
            elections ( id, name )
          `)
          .eq("user_id", u.id);

        if (assignData) {
          assignments = (assignData as unknown as AssignmentQueryRow[])
            .map((a) => {
              const el = Array.isArray(a.elections) ? a.elections[0] : a.elections;
              return {
                id: el?.id || a.election_id || "",
                name: el?.name || "Assigned Election",
              };
            })
            .filter((el) => el.id);
        }
      }

      return {
        id: u.id,
        email: u.email,
        role: roleObj?.name || "administrator",
        status: statusObj?.name || "Active",
        assignedElections: assignments,
      };
    })
  );

  return enriched;
}

