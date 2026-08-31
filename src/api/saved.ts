import { apiClient } from "./client";
import type { PlaceDTO, SavedCourseDTO, SavedPlaceDTO, TripResponse } from "./types";

export function listSavedPlaces() {
  return apiClient.get<SavedPlaceDTO[]>("/saved/places");
}

export function savePlace(place: PlaceDTO) {
  return apiClient.post<SavedPlaceDTO>("/saved/places", { place });
}

export function deleteSavedPlace(id: string) {
  return apiClient.del<void>(`/saved/places/${id}`);
}

export function listSavedCourses() {
  return apiClient.get<SavedCourseDTO[]>("/saved/courses");
}

export function saveCourse(trip: TripResponse, title: string) {
  return apiClient.post<SavedCourseDTO>("/saved/courses", { trip, title });
}

export function deleteSavedCourse(id: string) {
  return apiClient.del<void>(`/saved/courses/${id}`);
}
