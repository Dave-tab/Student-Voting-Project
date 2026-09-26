// ==============================================================================
// Student Activation Service
// Milestone 4 - Package 9 - Batch B67
// Project Owner & Chief Architect: David Ayantade Tolulope
//
// Client service for initiating trusted student account activation via
// the Supabase Edge Function 'student-activation'.
// ==============================================================================

import { supabase } from "@/lib/supabase";

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
    const { data, error } = await supabase.functions.invoke("student-activation", {
      body: {
        matriculation_number: matriculationNumber.trim(),
        institutional_email: institutionalEmail.trim().toLowerCase(),
        password: password,
      },
    });

    if (error) {
      // Handle edge function not deployed / 404 / 500 error gracefully
      const errorMsg =
        error.message || "Failed to communicate with the activation service.";

      if (
        errorMsg.includes("404") ||
        errorMsg.toLowerCase().includes("not found") ||
        errorMsg.toLowerCase().includes("failed to send a request to the edge function")
      ) {
        return {
          success: false,
          message:
            "The institutional activation service is awaiting Edge Function deployment by the system administrator.",
          error: "Edge Function 'student-activation' not yet deployed on Supabase.",
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
        message: data?.error || "Institutional verification failed.",
        error: data?.error || "Verification failed.",
      };
    }

    return {
      success: true,
      message: data.message || "Account successfully activated!",
      userId: data.user_id,
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
