// ==============================================================================
// Supabase Edge Function: student-activation
// Project: Student Online Voting Platform
// Chief Architect: David Ayantade Tolulope
// Target Specification: v2.3.0-FINAL-CORRECTED
//
// Trusted server-side provisioning boundary for student account activation.
// Enforces:
// 1. Identity Verification against election-specific public.student_register.
// 2. Duplicate / Replay Protection (users, students).
// 3. Supabase Auth Admin user creation (email_confirm: false).
// 4. Initial public.users application identity with 'Pending Activation' status.
// 5. public.students application profile linking (persistent profile).
// 6. Cross-boundary failure recovery (compensating deletion on failure).
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
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

    // 1. Verify match in election-specific voter register
    const { data: regStudent, error: regError } = await supabaseAdmin
      .from("student_register")
      .select("*")
      .ilike("matriculation_number", cleanMatric)
      .ilike("email", cleanEmail)
      .limit(1)
      .maybeSingle();

    if (regError || !regStudent) {
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

    // 2. Check if application user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
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

    // 3. Check if application student profile already exists
    const { data: existingStudent } = await supabaseAdmin
      .from("students")
      .select("id")
      .ilike("matriculation_number", cleanMatric)
      .maybeSingle();

    if (existingStudent) {
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

    // 4. Resolve 'student' role ID
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

    // 5. Resolve 'Pending Activation' account status ID (Required initial status prior to email verification)
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

    // Parse full_name into first_name and last_name
    const nameParts = regStudent.full_name ? regStudent.full_name.trim().split(" ") : ["Student", "User"];
    const firstName = nameParts[0] || "Student";
    const lastName = nameParts.slice(1).join(" ") || "User";

    // 6. Create Supabase Auth User with email_confirm: false
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

    const authUserId = authData.user.id;

    // Trigger verification email via Supabase Auth
    await supabaseAdmin.auth.resend({
      type: "signup",
      email: cleanEmail,
    });

    // 7. Provision public.users application identity with Pending Activation status
    const { error: userInsertError } = await supabaseAdmin.from("users").insert({
      id: authUserId,
      email: cleanEmail,
      role_id: roleData.id,
      account_status_id: statusData.id,
    });

    if (userInsertError) {
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

    // 8. Resolve academic_session_id and provision public.students persistent profile
    let academicSessionId = null;
    if (regStudent.election_id) {
      const { data: elecData } = await supabaseAdmin
        .from("elections")
        .select("academic_session_id")
        .eq("id", regStudent.election_id)
        .maybeSingle();
      if (elecData?.academic_session_id) {
        academicSessionId = elecData.academic_session_id;
      }
    }

    if (!academicSessionId) {
      const { data: sessData } = await supabaseAdmin
        .from("academic_sessions")
        .select("id")
        .limit(1)
        .maybeSingle();
      academicSessionId = sessData?.id || null;
    }

    const { error: studentInsertError } = await supabaseAdmin.from("students").insert({
      user_id: authUserId,
      matriculation_number: regStudent.matriculation_number,
      department_id: regStudent.department_id,
      level_id: regStudent.level_id,
      academic_session_id: academicSessionId,
    });

    if (studentInsertError) {
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
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
