import type { Event } from "./types";

const R2_BASE = "https://auroville-events.irshath.com";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getEventSlug(event: Event): string {
  return slugify(event.title || "untitled");
}

export async function fetchEventsByDate(date: string): Promise<Event[]> {
  const response = await fetch(`${R2_BASE}/events/${date}.json`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Failed to fetch events: ${response.status}`);
  }
  const events: Event[] = await response.json();
  return events.filter((e) => e.isEvent && e.title);
}

export function findEventBySlug(events: Event[], slug: string): Event | undefined {
  return events.find((e) => getEventSlug(e) === slug);
}
