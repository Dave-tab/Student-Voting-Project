// ==============================================================================
// Supabase Edge Function: admin-provisioning
// Milestone 4 - Package 9 - Batch B68
// Project Owner & Chief Architect: David Ayantade Tolulope
//
// Trusted server-side provisioning boundary for administrative account creation.
// Enforces:
// 1. Caller Authorization: Only authenticated users with super_admin (or admin)
//    role in the database may provision administrative accounts.
// 2. Approved Role Validation: Allowed roles are 'admin', 'administrator', 'electoral_officer', 'system_administrator', 'electoral_admin'.
// 3. Supabase Auth Admin user creation (server-side only, no public signup).
// 4. public.users application identity with Active account status.
// 5. public.administrators record creation.
// 6. Cross-boundary failure recovery (compensating deletion on failure).
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_ADMIN_ROLES = ["admin", "administrator", "system_administrator", "electoral_admin", "electoral_officer"] as const;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Extract Bearer token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or invalid Authorization header." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const callerToken = authHeader.replace("Bearer ", "").trim();

    // 2. Initialize Supabase Admin Client using privileged service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error: missing Supabase environment variables.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3. Verify caller session using Supabase Auth
    const { data: callerAuth, error: callerAuthError } = await supabaseAdmin.auth.getUser(callerToken);
    if (callerAuthError || !callerAuth.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid caller credentials." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const callerId = callerAuth.user.id;

    // 4. Verify caller database-authoritative role and account status
    const { data: callerUser, error: callerUserError } = await supabaseAdmin
      .from("users")
      .select("id, role_id, account_status_id, roles(name), account_statuses(name)")
      .eq("id", callerId)
      .single();

    if (callerUserError || !callerUser || !callerUser.roles || !callerUser.account_statuses) {
      return new Response(
        JSON.stringify({ success: false, error: "Caller identity could not be verified in application database." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify caller account status is 'Active'
    const callerStatusName = (callerUser.account_statuses as { name?: string } | null)?.name;
    if (callerStatusName !== "Active") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Access denied. Caller account status is not Active.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const callerRoleName = (callerUser.roles as { name?: string } | null)?.name?.toLowerCase();
    const ALLOWED_CALLER_ROLES = ["super_admin", "system_administrator"];
    if (!callerRoleName || !ALLOWED_CALLER_ROLES.includes(callerRoleName)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Access denied. Only Active Super Administrators and System Administrators may provision administrative accounts.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 5. Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const { action, userId, email, password, role } = body;

    // Support deletion/rollback for transactional cleanup
    if (action === "delete") {
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: "User ID is required for deletion." }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if trying to delete a Super Admin (forbidden protection)
      const { data: targetUser } = await supabaseAdmin
        .from("users")
        .select("roles(name)")
        .eq("id", userId)
        .maybeSingle();
      
      const targetRoleName = (targetUser?.roles as { name?: string } | null)?.name?.toLowerCase();
      if (targetRoleName === "super_admin") {
        return new Response(
          JSON.stringify({ success: false, error: "Access denied. Super Admin identities cannot be deleted." }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Perform deletion
      await supabaseAdmin.from("administrators").delete().eq("user_id", userId);
      await supabaseAdmin.from("users").delete().eq("id", userId);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        return new Response(
          JSON.stringify({ success: false, error: `Failed to delete auth user: ${deleteError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Administrative user successfully deleted/rolled back.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Default: provision user flow
    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ success: false, error: "Email, password, and target role are required." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const targetRole = String(role).trim().toLowerCase();
    if (!ALLOWED_ADMIN_ROLES.includes(targetRole as (typeof ALLOWED_ADMIN_ROLES)[number])) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid role specified. Must be one of: ${ALLOWED_ADMIN_ROLES.join(", ")}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: "Password must be at least 8 characters long." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 6. Check for duplicate account in public.users
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: "An application account with this email already exists." }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 7. Resolve target role ID
    const { data: roleRecord, error: roleError } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", targetRole)
      .single();

    if (roleError || !roleRecord) {
      return new Response(
        JSON.stringify({ success: false, error: `Role '${targetRole}' not found in database.` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 8. Resolve 'Active' status ID
    const { data: statusRecord, error: statusError } = await supabaseAdmin
      .from("account_statuses")
      .select("id")
      .eq("name", "Active")
      .single();

    if (statusError || !statusRecord) {
      return new Response(
        JSON.stringify({ success: false, error: "Active account status not found in database." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 9. Create Supabase Auth User via Auth Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: { role: targetRole },
    });

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authError?.message || "Failed to create authentication user.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const newUserId = authData.user.id;

    // 10. Provision public.users application record
    const { error: userInsertError } = await supabaseAdmin.from("users").insert({
      id: newUserId,
      email: cleanEmail,
      role_id: roleRecord.id,
      account_status_id: statusRecord.id,
    });

    if (userInsertError) {
      // Compensating recovery
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to establish application identity record." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 11. Provision public.administrators record
    const { error: adminInsertError } = await supabaseAdmin.from("administrators").insert({
      user_id: newUserId,
    });

    if (adminInsertError) {
      // Compensating recovery
      await supabaseAdmin.from("users").delete().eq("id", newUserId);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to establish administrator record." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Administrative user successfully provisioned with role '${targetRole}'.`,
        userId: newUserId,
        user_id: newUserId,
        role: targetRole,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
