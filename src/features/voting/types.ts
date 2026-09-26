export interface BallotSelectionState {
  // Mapping of position_id -> candidate_id
  [positionId: string]: string;
}

export interface BallotSubmissionPayload {
  electionId: string;
  selections: BallotSelectionState;
}

export interface BallotSubmissionResult {
  success: boolean;
  message?: string;
  participatedAt?: string;
  error?: string;
}
