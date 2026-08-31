import { useQuery } from "@tanstack/react-query";
import { searchPlaces } from "../api/search";
import type { PlaceSearchParams } from "../api/types";

export function usePlaceSearch(params: PlaceSearchParams) {
  return useQuery({
    queryKey: ["placeSearch", params],
    queryFn: () => searchPlaces(params),
  });
}
