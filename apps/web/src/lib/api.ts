import { env } from "@auroville-events/env/web";
import type { Event, NewEvent } from "./types";

const API_BASE = env.VITE_SERVER_URL;

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const eventsApi = {
  getAll: () => fetchApi<Event[]>("/api/events"),

  getBySlug: (slug: string) => fetchApi<Event>(`/api/events/${slug}`),

  create: (data: NewEvent) =>
    fetchApi<Event>("/api/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Event>) =>
    fetchApi<Event>(`/api/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<{ success: boolean }>(`/api/events/${id}`, {
      method: "DELETE",
    }),
};
