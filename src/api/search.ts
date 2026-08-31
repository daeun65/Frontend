import { apiClient } from "./client";
import type { PlaceDTO, PlaceSearchParams } from "./types";

export function searchPlaces(params: PlaceSearchParams) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  if (params.region) qs.set("region", params.region);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiClient.get<PlaceDTO[]>(`/places/search${suffix}`);
}
