import { apiClient } from "./client";
import type { TripRequestPayload, TripResponse } from "./types";

export function createTrip(payload: TripRequestPayload) {
  return apiClient.post<TripResponse>("/trips/", payload);
}

export function getTrip(id: string) {
  return apiClient.get<TripResponse>(`/trips/${id}/`);
}
