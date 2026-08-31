import { apiClient } from "./client";
import type { CandidatesResponse, TripRequestPayload, TripResponse } from "./types";

export function createCandidates(payload: TripRequestPayload) {
  return apiClient.post<CandidatesResponse>("/trips/candidates/", payload);
}

export function getCandidates(requestId: string) {
  return apiClient.get<CandidatesResponse>(`/trips/candidates/${requestId}/`);
}

export function selectCandidate(candidateId: string) {
  return apiClient.post<TripResponse>(`/trips/candidates/${candidateId}/select/`, {});
}
