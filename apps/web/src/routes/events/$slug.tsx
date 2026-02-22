import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
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
import { eventsApi } from "@/lib/api";

export const Route = createFileRoute("/events/$slug")({
  loader: async ({ params }) => {
    const event = await eventsApi.getBySlug(params.slug);
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

function EventDetailPage() {
  const { event } = Route.useLoaderData();

  const startDate = new Date(event.startTime);
  const endDate = event.endTime ? new Date(event.endTime) : null;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      {event.image && (
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-64 md:h-96 object-cover rounded-xl mb-6"
        />
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <Badge
          className={categoryColors[event.category as keyof typeof categoryColors]}
          variant="secondary"
        >
          {event.category}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(startDate, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(startDate, "h:mm a")}
                {endDate && ` - ${format(endDate, "h:mm a")}`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.place}</span>
            </div>
            <p className="text-sm text-muted-foreground">{event.address}</p>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {event.payment === "free" ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                Free Entry
              </Badge>
            ) : (
              <div className="space-y-1">
                {event.avContributionAmount && (
                  <p>
                    <span className="text-muted-foreground">Aurovilians:</span>{" "}
                    {event.paymentCurrency}
                    {event.avContributionAmount}
                  </p>
                )}
                {event.guestContributionAmount && (
                  <p>
                    <span className="text-muted-foreground">Guests:</span>{" "}
                    {event.paymentCurrency}
                    {event.guestContributionAmount}
                  </p>
                )}
              </div>
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

      <div className="prose dark:prose-invert max-w-none">
        <h2 className="text-xl font-semibold mb-4">About this Event</h2>
        <p className="whitespace-pre-wrap">{event.description}</p>
      </div>
    </main>
  );
}
