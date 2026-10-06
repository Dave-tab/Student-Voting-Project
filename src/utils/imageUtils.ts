import { supabase } from "@/lib/supabase";

/**
 * Normalizes and resolves candidate photo paths to full URLs.
 * Handles:
 * - Public HTTP/HTTPS URLs
 * - Inline base64 data URLs
 * - Supabase storage object paths within the 'candidate-media' bucket
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Strip leading slash if present
  const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;

  try {
    const { data } = supabase.storage.from("candidate-media").getPublicUrl(cleanPath);
    return data.publicUrl || null;
  } catch (err) {
    console.error("Failed to generate public URL for candidate image:", err);
    return null;
  }
}
