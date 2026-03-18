import { Link } from "@tanstack/react-router";
import { format, parse } from "date-fns";
import { Calendar, MapPin, Clock } from "lucide-react";

import { getEventSlug } from "@/lib/api";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

function formatTime(time: string | null): string | null {
  if (!time) return null;
  try {
    const parsed = parse(time, "HH:mm", new Date());
    return format(parsed, "h:mm a");
  } catch {
    return time;
  }
}

export function EventCard({ event }: EventCardProps) {
  const slug = getEventSlug(event);
  const eventDate = event.date
    ? parse(event.date, "yyyy-MM-dd", new Date())
    : null;
  const startFormatted = formatTime(event.startTime);
  const endFormatted = formatTime(event.endTime);


  return (
    <Link
      to="/$slug"
      params={{ slug }}
      search={{ date: event.date || undefined }}
    >
      <div className="group relative h-[28rem] overflow-hidden rounded-xl cursor-pointer">
        {/* Media */}
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title || "Event"}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : event.videoUrl ? (
          <video
            src={event.videoUrl}
            className="absolute inset-0 w-full h-full object-cover object-top"
            muted
            playsInline
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}

        {/* Glassmorphic overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-md p-4 space-y-1.5">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 leading-tight">
            {event.title || "Untitled Event"}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
            {eventDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(eventDate, "MMM d")}
              </span>
            )}
            {startFormatted && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {startFormatted}
                {endFormatted && ` - ${endFormatted}`}
              </span>
            )}
            {event.placeName && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{event.placeName}</span>
              </span>
            )}
          </div>

          {event.paymentType && (
            <div>
              {event.paymentType === "free" ? (
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                  Free
                </span>
              ) : (
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-gray-300 text-gray-700">
                  {event.paymentAmount || (event.paymentType === "paid" ? "Paid" : "Contribution")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
