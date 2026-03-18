import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parse } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

import { GeneratedPattern } from "@/components/generated-pattern";
import { fetchEventsByDate, findEventBySlug } from "@/lib/api";
import { formatDateParam } from "@/lib/utils";

interface SearchParams {
  date?: string;
}

export const Route = createFileRoute("/$slug")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    date: (search.date as string) || undefined,
  }),
  loaderDeps: ({ search }) => ({ date: search.date }),
  loader: async ({ params, deps }) => {
    const dateStr = deps.date || formatDateParam(new Date());
    const events = await fetchEventsByDate(dateStr);
    const event = findEventBySlug(events, params.slug);
    if (!event) throw new Error("Event not found");
    return { event };
  },
  errorComponent: () => (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
      <p className="text-gray-500 mb-6">
        The event you're looking for doesn't exist or has been removed.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>
    </main>
  ),
  component: EventDetailPage,
});

function formatTime(time: string | null): string | null {
  if (!time) return null;
  try {
    const parsed = parse(time, "HH:mm", new Date());
    return format(parsed, "h:mm a");
  } catch {
    return time;
  }
}

function EventDetailPage() {
  const { event } = Route.useLoaderData();
  const eventDate = event.date
    ? parse(event.date, "yyyy-MM-dd", new Date())
    : null;
  const startFormatted = formatTime(event.startTime);
  const endFormatted = formatTime(event.endTime);

  return (
    <main className="min-h-screen pb-12">
      {/* Floating back button */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center justify-center size-11 rounded-full bg-white/70 backdrop-blur-lg border border-gray-200/50 shadow-lg hover:bg-white/90 transition-colors"
        aria-label="Back to events"
      >
        <ArrowLeft className="h-5 w-5 text-gray-800" />
      </Link>

      {/* Hero media */}
      {event.imageUrl ? (
        <div className="bg-gray-100 px-4 pt-16 pb-8 flex justify-center">
          <img
            src={event.imageUrl}
            alt={event.title || "Event"}
            className="w-full max-w-md rounded-xl shadow-md"
          />
        </div>
      ) : event.videoUrl ? (
        <div className="relative w-full h-72 md:h-[28rem]">
          <video
            src={event.videoUrl}
            controls
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>
      ) : (
        <div className="relative w-full h-48 md:h-64">
          <GeneratedPattern seed={event.title || "event"} className="absolute inset-0" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 md:p-8">
          {/* Title + payment badge */}
          <div className="mb-5">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {event.title || "Untitled Event"}
            </h1>
            {event.paymentType && (
              <div className="mt-2">
                {event.paymentType === "free" ? (
                  <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                    Free Entry
                  </span>
                ) : (
                  <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                    {event.paymentAmount || (event.paymentType === "paid" ? "Paid" : "Contribution")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Details list */}
          <div className="space-y-4 mb-6">
            {eventDate && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-full bg-gray-100">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-800">{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
            )}

            {startFormatted && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-full bg-gray-100">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-800">
                  {startFormatted}
                  {endFormatted && ` – ${endFormatted}`}
                </span>
              </div>
            )}

            {(event.placeName || event.location) && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-full bg-gray-100 shrink-0">
                  <MapPin className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  {event.placeName && (
                    <span className="text-gray-800">{event.placeName}</span>
                  )}
                  {event.location && (
                    <p className="text-sm text-gray-500">{event.location}</p>
                  )}
                  {event.locationLink && (
                    <a
                      href={event.locationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline ml-2"
                    >
                      View on Map
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {event.contactNo && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-full bg-gray-100">
                  <Phone className="h-4 w-4 text-gray-600" />
                </div>
                <a
                  href={`tel:${event.contactNo}`}
                  className="text-primary hover:underline"
                >
                  {event.contactNo}
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <>
              <hr className="border-gray-100 mb-5" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this Event</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base">
                  {event.description}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
