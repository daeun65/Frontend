import { http, HttpResponse } from "msw";
import type { CandidatesResponse, TripRequestPayload } from "../../types";
import { bearerToken, userFromToken } from "../auth-data";
import { candidateToTrip, generateCandidates } from "../data";
import { setTrip } from "./trips";

interface StoredCandidates {
  request: TripRequestPayload;
  response: CandidatesResponse;
}

const candidateStore = new Map<string, StoredCandidates>();

export const candidateHandlers = [
  http.post("/api/trips/candidates/", async ({ request }) => {
    const user = userFromToken(bearerToken(request));
    if (!user) {
      return HttpResponse.json({ detail: "로그인이 필요합니다." }, { status: 401 });
    }

    const payload = (await request.json()) as TripRequestPayload;
    if (!payload.start_datetime || !payload.end_datetime) {
      return HttpResponse.json(
        { field_errors: { start_datetime: ["필수 값입니다"] } },
        { status: 400 },
      );
    }

    // simulate the recommendation engine working through the checklist
    await new Promise((r) => setTimeout(r, 1400));

    const response = generateCandidates(payload);
    candidateStore.set(response.request_id, { request: payload, response });
    return HttpResponse.json(response, { status: 201 });
  }),

  http.get("/api/trips/candidates/:requestId/", ({ params }) => {
    const requestId = params.requestId as string;
    const stored = candidateStore.get(requestId);
    if (!stored) {
      return HttpResponse.json({ detail: "찾을 수 없는 추천 요청입니다." }, { status: 404 });
    }
    return HttpResponse.json(stored.response);
  }),

  http.post("/api/trips/candidates/:candidateId/select/", ({ params, request }) => {
    const user = userFromToken(bearerToken(request));
    if (!user) {
      return HttpResponse.json({ detail: "로그인이 필요합니다." }, { status: 401 });
    }

    const candidateId = params.candidateId as string;
    for (const stored of candidateStore.values()) {
      const candidate = stored.response.candidates.find((c) => c.id === candidateId);
      if (candidate) {
        const trip = candidateToTrip(stored.request, candidate);
        setTrip(trip.id, trip);
        return HttpResponse.json(trip, { status: 201 });
      }
    }
    return HttpResponse.json({ detail: "찾을 수 없는 코스 후보입니다." }, { status: 404 });
  }),
];
