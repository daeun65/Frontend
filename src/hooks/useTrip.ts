import { useQuery } from "@tanstack/react-query";
import { getTrip } from "../api/trips";

export function useTrip(id: string | undefined) {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: () => getTrip(id as string),
    enabled: Boolean(id),
  });
}
