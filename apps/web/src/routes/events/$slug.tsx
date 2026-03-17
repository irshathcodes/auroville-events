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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchEventsByDate, findEventBySlug } from "@/lib/api";
import { formatDateParam } from "@/lib/utils";

interface SearchParams {
  date?: string;
}

export const Route = createFileRoute("/events/$slug")({
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
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </Link>
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-muted-foreground">
          The event you're looking for doesn't exist or has been removed.
        </p>
      </div>
    </main>
  ),
  component: EventDetailPage,
});

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

function EventDetailPage() {
  const { event } = Route.useLoaderData();
  const eventDate = event.date
    ? parse(event.date, "yyyy-MM-dd", new Date())
    : null;
  const startFormatted = formatTime(event.startTime);
  const endFormatted = formatTime(event.endTime);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.title || "Event"}
          className="w-full h-64 md:h-96 object-cover rounded-xl mb-6"
        />
      )}

      {!event.imageUrl && event.videoUrl && (
        <video
          src={event.videoUrl}
          controls
          className="w-full h-64 md:h-96 object-cover rounded-xl mb-6"
        />
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold">{event.title || "Untitled Event"}</h1>
        {event.category && (
          <Badge
            className={categoryColors[event.category]}
            variant="secondary"
          >
            {event.category}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {(eventDate || startFormatted) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {eventDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
              )}
              {startFormatted && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {startFormatted}
                    {endFormatted && ` - ${endFormatted}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(event.placeName || event.location) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {event.placeName && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.placeName}</span>
                </div>
              )}
              {event.location && (
                <p className="text-sm text-muted-foreground">{event.location}</p>
              )}
              {event.locationLink && (
                <a
                  href={event.locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View on Map
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            {event.paymentType === "free" ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                Free Entry
              </Badge>
            ) : event.paymentType === "paid" || event.paymentType === "contribution" ? (
              <p className="text-sm">{event.paymentAmount || (event.paymentType === "paid" ? "Paid" : "Contribution")}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Not specified</p>
            )}
          </CardContent>
        </Card>
      </div>

      {event.contactNo && (
        <div className="mb-6">
          <a
            href={`tel:${event.contactNo}`}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Phone className="h-4 w-4" />
            {event.contactNo}
          </a>
        </div>
      )}

      {event.description && (
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-xl font-semibold mb-4">About this Event</h2>
          <p className="whitespace-pre-wrap">{event.description}</p>
        </div>
      )}
    </main>
  );
}
