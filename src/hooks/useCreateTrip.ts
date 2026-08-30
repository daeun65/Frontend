import { useMutation } from "@tanstack/react-query";
import { createTrip } from "../api/trips";

export function useCreateTrip() {
  return useMutation({ mutationFn: createTrip });
}
