// ==============================================================================
// Student Activation Service
// Milestone 4 - Package 9 - Batch B67
// Project Owner & Chief Architect: David Ayantade Tolulope
//
// Client service for initiating trusted student account activation via
// the Supabase Edge Function 'student-activation'.
// ==============================================================================

import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase";

export interface StudentActivationParams {
  matriculationNumber: string;
  institutionalEmail: string;
  password: string;
}

export interface StudentActivationResult {
  success: boolean;
  message: string;
  userId?: string;
  error?: string;
}

/**
 * Initiates trusted student account activation through the dedicated Supabase Edge Function.
 * The browser never calls supabase.auth.signUp() directly and never holds service-role secrets.
 */
export async function activateStudentAccount(
  params: StudentActivationParams
): Promise<StudentActivationResult> {
  const { matriculationNumber, institutionalEmail, password } = params;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/student-activation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
        "apikey": supabaseAnonKey,
      },
      body: JSON.stringify({
        matriculation_number: matriculationNumber.trim(),
        institutional_email: institutionalEmail.trim().toLowerCase(),
        password: password,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || `Verification failed (HTTP ${response.status})`;
      return {
        success: false,
        message: errorMsg,
        error: errorMsg,
      };
    }

    return {
      success: true,
      message: data?.message || "Account successfully activated!",
      userId: data?.user_id,
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
