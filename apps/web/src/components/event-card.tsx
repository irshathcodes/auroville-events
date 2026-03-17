import { Link } from "@tanstack/react-router";
import { format, parse } from "date-fns";
import { Calendar, MapPin, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventSlug } from "@/lib/api";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

const categoryColors = {
  workshop: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  event: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
} as const;

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
      to="/events/$slug"
      params={{ slug }}
      search={{ date: event.date || undefined }}
    >
      <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title || "Event"}
            className="w-full h-48 object-cover"
          />
        )}
        {!event.imageUrl && event.videoUrl && (
          <video
            src={event.videoUrl}
            className="w-full h-48 object-cover"
            muted
            playsInline
          />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2">{event.title || "Untitled Event"}</CardTitle>
            {event.category && (
              <Badge
                className={categoryColors[event.category]}
                variant="secondary"
              >
                {event.category}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {eventDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(eventDate, "EEE, MMM d, yyyy")}</span>
            </div>
          )}
          {startFormatted && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{startFormatted}</span>
              {endFormatted && <span>- {endFormatted}</span>}
            </div>
          )}
          {event.placeName && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.placeName}</span>
            </div>
          )}
          <div className="pt-2">
            {event.paymentType === "free" ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Free
              </Badge>
            ) : event.paymentType === "paid" || event.paymentType === "contribution" ? (
              <Badge variant="secondary">
                {event.paymentAmount || (event.paymentType === "paid" ? "Paid" : "Contribution")}
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
