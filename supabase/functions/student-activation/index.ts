// ==============================================================================
// Supabase Edge Function: student-activation
// Project: Student Online Voting Platform
// Chief Architect: David Ayantade Tolulope
// Target Specification: v2.4.1-FINAL-STATE-MACHINE
//
// Trusted server-side provisioning boundary for student account activation.
// Implements the definitive four-state activation recovery machine.
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

    const cleanMatric = matriculation_number.trim().toUpperCase();
    const cleanEmail = institutional_email.trim().toLowerCase();

    console.log(`[ACTIVATION] Request: ${cleanMatric} / ${cleanEmail}`);

    const VERIFICATION_FAILED_MESSAGE =
      "Unable to activate account with the provided details. Please verify your matriculation number and institutional email, or contact your institution if you have already activated your account.";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Internal server configuration error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Verify match in student register
    const { data: regStudents, error: regError } = await supabaseAdmin
      .from("student_register")
      .select("*")
      .eq("matriculation_number", cleanMatric)
      .eq("email", cleanEmail);

    if (regError) {
      console.error("[ACTIVATION] Register query error:", regError.message);
      return new Response(
        JSON.stringify({ success: false, error: "Database verification service unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!regStudents || regStudents.length === 0) {
      console.warn("[ACTIVATION] Register mismatch:", cleanMatric, cleanEmail);
      return new Response(
        JSON.stringify({ success: false, error: VERIFICATION_FAILED_MESSAGE }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const regStudent = regStudents[0];

    // 2. Identify existing states
    let authUser = null;
    const { data: authLookupData, error: authLookupError } = await supabaseAdmin.auth.admin.getUserByEmail(cleanEmail);

    if (authLookupError && authLookupError.status !== 404) {
      console.error("[ACTIVATION] Auth lookup error:", authLookupError.message);
      return new Response(
        JSON.stringify({ success: false, error: "Authentication service lookup failed." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    authUser = authLookupData?.user || null;

    const { data: dbUser, error: dbUserError } = await supabaseAdmin
      .from("users")
      .select("id, account_status_id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (dbUserError) {
      console.error("[ACTIVATION] Users lookup error:", dbUserError.message);
      return new Response(JSON.stringify({ success: false, error: "Application user lookup failed." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: dbStudent, error: dbStudentError } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("matriculation_number", cleanMatric)
      .maybeSingle();

    if (dbStudentError) {
      console.error("[ACTIVATION] Students lookup error:", dbStudentError.message);
      return new Response(JSON.stringify({ success: false, error: "Student profile lookup failed." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve Statuses
    const { data: statuses } = await supabaseAdmin.from("account_statuses").select("id, name");
    const pendingStatusId = statuses?.find(s => s.name === "Pending Activation")?.id;
    const activeStatusId = statuses?.find(s => s.name === "Active")?.id;

    const hasAuth = authUser !== null;
    const hasDbUser = dbUser !== null;
    const hasDbStudent = dbStudent !== null;
    const isConfirmed = !!(authUser?.email_confirmed_at || authUser?.confirmed_at);
    const isPendingStatus = dbUser?.account_status_id === pendingStatusId;
    const isActiveStatus = dbUser?.account_status_id === activeStatusId;

    console.log(`[ACTIVATION] State Trace: hasAuth=${hasAuth}, hasDbUser=${hasDbUser}, hasDbStudent=${hasDbStudent}, isConfirmed=${isConfirmed}, isPending=${isPendingStatus}`);

    // STATE B: EXISTING PENDING ACTIVATION - RECOVERY
    if (hasAuth && hasDbUser && hasDbStudent && !isConfirmed && isPendingStatus) {
      console.log("[ACTIVATION] Case: Recovery (State B)");
      const { error: resendError } = await supabaseAdmin.auth.resend({ type: "signup", email: cleanEmail });

      return new Response(
        JSON.stringify({
          success: true,
          message: resendError 
            ? "Your account is already awaiting email verification. However, we had trouble sending a new verification link. Please request a link from the login page or contact support."
            : "Your account is already awaiting email verification. We have sent a new verification link to your email address. Please verify your email before signing in."
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // STATE C: EXISTING ACTIVE ACCOUNT
    if (hasAuth && hasDbUser && hasDbStudent && (isConfirmed || isActiveStatus)) {
      console.log("[ACTIVATION] Case: Active (State C)");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Your account is already active. Please proceed to the login page to sign in.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // STATE D: PARTIAL / INCONSISTENT
    if (hasAuth || hasDbUser || hasDbStudent) {
      console.warn("[ACTIVATION] Case: Inconsistent (State D)");
      return new Response(
        JSON.stringify({
          success: false,
          error: "An account registration is already in progress or partially completed. Please contact support to resolve this status.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // STATE A: FRESH PROVISIONING
    console.log("[ACTIVATION] Case: Fresh (State A)");
    
    const { data: roleData } = await supabaseAdmin.from("roles").select("id").eq("name", "student").single();
    const { data: electionData } = await supabaseAdmin.from("elections").select("academic_session_id").eq("id", regStudent.election_id).single();

    if (!roleData || !electionData || !pendingStatusId) {
       return new Response(JSON.stringify({ success: false, error: "Application configuration error." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Provision
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: false,
      user_metadata: { role: "student", matriculation_number: cleanMatric },
    });

    if (authCreateError || !authData.user) {
      console.error("[ACTIVATION] Auth create error:", authCreateError?.message);
      return new Response(JSON.stringify({ success: false, error: "Failed to establish authentication record." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authUserId = authData.user.id;

    const { error: userInsertError } = await supabaseAdmin.from("users").insert({
      id: authUserId,
      email: cleanEmail,
      role_id: roleData.id,
      account_status_id: pendingStatusId,
    });

    if (userInsertError) {
      console.error("[ACTIVATION] User insert error, compensating cleanup:", userInsertError.message);
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return new Response(JSON.stringify({ success: false, error: "Failed to establish application user record." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: studentInsertError } = await supabaseAdmin.from("students").insert({
      user_id: authUserId,
      matriculation_number: cleanMatric,
      department_id: regStudent.department_id,
      level_id: regStudent.level_id,
      academic_session_id: electionData.academic_session_id,
    });

    if (studentInsertError) {
      console.error("[ACTIVATION] Student insert error, compensating cleanup:", studentInsertError.message);
      await supabaseAdmin.from("users").delete().eq("id", authUserId);
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return new Response(JSON.stringify({ success: false, error: "Failed to establish student profile record." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: resendError } = await supabaseAdmin.auth.resend({ type: "signup", email: cleanEmail });

    return new Response(
      JSON.stringify({
        success: true,
        message: resendError 
          ? "Profile provisioned successfully! However, we had trouble sending the confirmation email. Please request a verification link from the login page."
          : "Activation initiated! A confirmation email has been sent to your institutional email. Please verify your email before signing in."
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[ACTIVATION] Global exception:", err);
    return new Response(JSON.stringify({ success: false, error: "An unexpected server error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
