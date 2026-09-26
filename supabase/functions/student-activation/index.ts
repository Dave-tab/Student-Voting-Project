// ==============================================================================
// Supabase Edge Function: student-activation
// Project: Student Online Voting Platform
// Chief Architect: David Ayantade Tolulope
// Target Specification: v2.3.0-FINAL-CORRECTED
//
// Trusted server-side provisioning boundary for student account activation.
// Enforces:
// 1. Identity Verification against election-specific public.student_register.
// 2. Strict deterministic verification of multiple student registrations.
// 3. SECURE non-swallowed complete Auth user existence state check.
// 4. Supabase Auth Admin user creation (email_confirm: false).
// 5. Initial public.users application identity with 'Pending Activation' status.
// 6. public.students application profile linking (persistent profile).
// 7. SECURE explicit origin CORS allowlist validation.
// 8. Compensating cleanup on failure.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://tpivoteportal.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  const corsOrigin = isAllowed ? origin : "";

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (corsOrigin) {
    corsHeaders["Access-Control-Allow-Origin"] = corsOrigin;
  }

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

    const { matriculation_number, institutional_email, password } = await req.json();

    if (!matriculation_number || !institutional_email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Matriculation number, institutional email, and password are required.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Password must be at least 8 characters long.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cleanMatric = matriculation_number.trim().toUpperCase();
    const cleanEmail = institutional_email.trim().toLowerCase();

    const VERIFICATION_FAILED_MESSAGE =
      "Unable to activate account with the provided details. Please verify your matriculation number and institutional email, or contact your institution if you have already activated your account.";

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

    // 1. Verify match in student register
    // Fetch all registrations matching the exact matriculation and email pair
    const { data: regStudents, error: regError } = await supabaseAdmin
      .from("student_register")
      .select("*")
      .ilike("matriculation_number", cleanMatric)
      .ilike("email", cleanEmail);

    if (regError || !regStudents || regStudents.length === 0) {
      console.log("ACTIVATION_FAILURE: No match found in student register for:", cleanMatric);
      return new Response(
        JSON.stringify({
          success: false,
          error: VERIFICATION_FAILED_MESSAGE,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine correctness and reconcile multi-registrations deterministically
    const firstFullName = regStudents[0].full_name ? regStudents[0].full_name.trim().toLowerCase() : "";
    const isConsistent = regStudents.every(r => {
      const currentName = r.full_name ? r.full_name.trim().toLowerCase() : "";
      return currentName === firstFullName;
    });

    if (!isConsistent) {
      console.log("ACTIVATION_FAILURE: Inconsistent student identity across registrations for email:", cleanEmail);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Multiple election registrations found with inconsistent identity information. Please contact support.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If multiple registrations match, they represent repeated election registrations for different elections.
    // Selecting any matching registration row is acceptable to obtain verified name parts since names are verified as consistent.
    // This transient selection does not permanently tie the persistent activation to a single election.
    const regStudent = regStudents[0];

    // 2. Safe Auth User lookup via standard listUsers numeric pagination to ensure compatibility and non-swallowed errors
    let authUser = null;
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: page,
        perPage: perPage,
      });

      if (listError) {
        console.log("ACTIVATION_FAILURE: Auth listUsers query failed securely:", listError.message);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Authentication service could not verify existing credentials safely.",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const matchedUser = data?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
      if (matchedUser) {
        authUser = matchedUser;
        break;
      }

      if (!data?.users || data.users.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // 3. Resolve status database tables
    const { data: dbUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .ilike("email", cleanEmail)
      .maybeSingle();

    const { data: dbStudent } = await supabaseAdmin
      .from("students")
      .select("id")
      .ilike("matriculation_number", cleanMatric)
      .maybeSingle();

    const hasAuth = authUser !== null;
    const hasDbUser = dbUser !== null;
    const hasDbStudent = dbStudent !== null;

    // Handle complete, orphaned, and partial states securely
    if (hasAuth && hasDbUser && hasDbStudent) {
      console.log("ACTIVATION_FAILURE: Complete existing account found for email:", cleanEmail);
      return new Response(
        JSON.stringify({
          success: false,
          error: "An account has already been activated with this email address. Please proceed to the login page.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (hasAuth && !hasDbUser && !hasDbStudent) {
      console.log("ACTIVATION_FAILURE: Orphaned Auth account exists for email:", cleanEmail);
      return new Response(
        JSON.stringify({
          success: false,
          error: "An incomplete security record was detected for this account. Please contact support to restore your login profile.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (hasDbUser || hasDbStudent) {
      console.log("ACTIVATION_FAILURE: Inconsistent partial registration profile state detected.");
      return new Response(
        JSON.stringify({
          success: false,
          error: "A partial database registration profile was detected. Please contact the administrator to reset your student profile.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Resolve role and status IDs
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", "student")
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Application role configuration error: student role not found.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: statusData, error: statusError } = await supabaseAdmin
      .from("account_statuses")
      .select("id")
      .eq("name", "Pending Activation")
      .single();

    if (statusError || !statusData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Application status configuration error: Pending Activation status not found.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Derive first_name and last_name deterministically
    const rawName = regStudent.full_name ? regStudent.full_name.trim() : "";
    let firstName = "Student";
    let lastName = "User";

    if (rawName) {
      const nameParts = rawName.split(/\s+/);
      if (nameParts.length === 1) {
        firstName = nameParts[0];
        lastName = "";
      } else {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
      }
    }

    // 5. Create Supabase Auth User with email_confirm: false
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: false,
      user_metadata: {
        role: "student",
        matriculation_number: regStudent.matriculation_number,
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (authError || !authData.user) {
      console.log("ACTIVATION_FAILURE: Failed to create Auth record:", authError?.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to establish secure authentication record. Please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authUserId = authData.user.id;

    // 6. Provision public.users application identity with Pending Activation status
    const { error: userInsertError } = await supabaseAdmin.from("users").insert({
      id: authUserId,
      email: cleanEmail,
      role_id: roleData.id,
      account_status_id: statusData.id,
    });

    if (userInsertError) {
      console.log("ACTIVATION_FAILURE: public.users insertion failed, executing compensating cleanup:", userInsertError.message);
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to establish application user record. Operation aborted.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 7. Provision public.students persistent profile
    const { error: studentInsertError } = await supabaseAdmin.from("students").insert({
      user_id: authUserId,
      matriculation_number: regStudent.matriculation_number,
      first_name: firstName,
      last_name: lastName,
    });

    if (studentInsertError) {
      console.log("ACTIVATION_FAILURE: public.students insertion failed, executing compensating cleanup:", studentInsertError.message);
      await supabaseAdmin.from("users").delete().eq("id", authUserId);
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to establish student profile record. Operation aborted.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 8. Trigger verification email via Supabase Auth
    // Safe Architecture Choice: Retain the fully provisioned Pending Activation record if SMTP fails,
    // allowing the client to safely initiate or resend verification rather than destructive deletes (Option A).
    const { error: resendError } = await supabaseAdmin.auth.resend({
      type: "signup",
      email: cleanEmail,
    });

    if (resendError) {
      console.log("ACTIVATION_WARNING: Verification email trigger failed but records retained for retry:", resendError.message);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Profile provisioned successfully! However, we had trouble sending the confirmation email. Please request a verification link from the login page or contact support.",
        }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("ACTIVATION_SUCCESS: Student account successfully activated for matric:", cleanMatric);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Activation initiated! A confirmation email has been sent to your institutional email. Please verify your email before signing in.",
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.log("ACTIVATION_EXCEPTION: Unhandled exception caught:", errorMsg);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected server error occurred during activation." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
