import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteSavedCourse,
  deleteSavedPlace,
  listSavedCourses,
  listSavedPlaces,
  saveCourse,
  savePlace,
} from "../api/saved";
import type { TripResponse } from "../api/types";

export function useSavedPlaces(enabled: boolean) {
  return useQuery({ queryKey: ["saved", "places"], queryFn: listSavedPlaces, enabled });
}

export function useSavedCourses(enabled: boolean) {
  return useQuery({ queryKey: ["saved", "courses"], queryFn: listSavedCourses, enabled });
}

export function useSavePlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: savePlace,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved", "places"] }),
  });
}

interface SaveCourseInput {
  trip: TripResponse;
  title: string;
}

export function useSaveCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ trip, title }: SaveCourseInput) => saveCourse(trip, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved", "courses"] }),
  });
}

export function useDeleteSavedPlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedPlace,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved", "places"] }),
  });
}

export function useDeleteSavedCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved", "courses"] }),
  });
}
