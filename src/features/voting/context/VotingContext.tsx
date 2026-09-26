/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";
import type { BallotSelectionState, BallotSubmissionResult } from "../types";

interface VotingSessionState {
  electionId: string | null;
  selections: BallotSelectionState;
  submissionResult: BallotSubmissionResult | null;
  setCandidateSelection: (electionId: string, positionId: string, candidateId: string) => void;
  clearSelection: (electionId: string, positionId: string) => void;
  resetElectionBallot: (electionId: string) => void;
  setSubmissionResult: (result: BallotSubmissionResult | null) => void;
  clearVotingSession: () => void;
}

const VotingContext = createContext<VotingSessionState | undefined>(undefined);

export interface VotingProviderProps {
  children: ReactNode;
}

/**
 * VotingProvider:
 * Owns client-side ballot selection state in React memory across:
 *   /elections/:id/ballot <-> /elections/:id/review
 *
 * GOVERNANCE RULES:
 * 1. NO sessionStorage or localStorage is used for ballot selection persistence.
 * 2. Unselected positions represent explicit abstention.
 * 3. Only one candidate selection is maintained per position.
 * 4. State survives back-and-forth navigation between ballot and review.
 */
export function VotingProvider({ children }: VotingProviderProps) {
  // Map of electionId -> BallotSelectionState
  const [ballotStates, setBallotStates] = useState<Record<string, BallotSelectionState>>({});
  const [activeElectionId, setActiveElectionId] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<BallotSubmissionResult | null>(null);

  const setCandidateSelection = (electionId: string, positionId: string, candidateId: string) => {
    setActiveElectionId(electionId);
    setBallotStates((prev) => ({
      ...prev,
      [electionId]: {
        ...(prev[electionId] || {}),
        [positionId]: candidateId,
      },
    }));
  };

  const clearSelection = (electionId: string, positionId: string) => {
    setBallotStates((prev) => {
      const electionState = { ...(prev[electionId] || {}) };
      delete electionState[positionId];
      return {
        ...prev,
        [electionId]: electionState,
      };
    });
  };

  const resetElectionBallot = (electionId: string) => {
    setBallotStates((prev) => {
      const updated = { ...prev };
      delete updated[electionId];
      return updated;
    });
  };

  const clearVotingSession = () => {
    setBallotStates({});
    setActiveElectionId(null);
    setSubmissionResult(null);
  };

  const currentSelections = activeElectionId ? ballotStates[activeElectionId] || {} : {};

  return (
    <VotingContext.Provider
      value={{
        electionId: activeElectionId,
        selections: currentSelections,
        submissionResult,
        setCandidateSelection,
        clearSelection,
        resetElectionBallot,
        setSubmissionResult,
        clearVotingSession,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error("useVoting must be used within a VotingProvider");
  }
  return context;
}
