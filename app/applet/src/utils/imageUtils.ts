import { supabase } from "@/lib/supabase";

export function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const { data } = supabase.storage.from("candidate-media").getPublicUrl(path);
  return data?.publicUrl || null;
}
