import { apiClient } from "./client";
import type { AuthSession, LoginPayload, SignupPayload, User } from "./types";

export function login(payload: LoginPayload) {
  return apiClient.post<AuthSession>("/auth/login", payload);
}

export function signup(payload: SignupPayload) {
  return apiClient.post<AuthSession>("/auth/signup", payload);
}

export function logout() {
  return apiClient.post<void>("/auth/logout", {});
}

export function getMe() {
  return apiClient.get<User>("/auth/me");
}
