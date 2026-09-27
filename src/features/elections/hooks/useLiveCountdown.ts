import { useState, useEffect } from "react";
import type { Election } from "../types";
import { getPresentationCountdown } from "../utils/electionUtils";

/**
 * useLiveCountdown
 *
 * Hook that updates approximately once per second while mounted.
 * Derived from authoritative persisted election timestamps (start_datetime, end_datetime).
 * Section 20 & 21 compliance.
 */
export function useLiveCountdown(election: Election | null | undefined): string | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!election) return;

    // Update every second
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [election]);

  if (!election) return null;
  return getPresentationCountdown(election, now);
}
