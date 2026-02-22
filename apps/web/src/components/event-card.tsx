import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Calendar, MapPin, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

const categoryColors = {
  workshop: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  event: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
} as const;

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.startTime);

  return (
    <Link to="/events/$slug" params={{ slug: event.slug }}>
      <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2">{event.title}</CardTitle>
            <Badge
              className={categoryColors[event.category as keyof typeof categoryColors]}
              variant="secondary"
            >
              {event.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(startDate, "EEE, MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{format(startDate, "h:mm a")}</span>
            {event.endTime && (
              <span>- {format(new Date(event.endTime), "h:mm a")}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.place}</span>
          </div>
          <div className="pt-2">
            {event.payment === "free" ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Free
              </Badge>
            ) : (
              <Badge variant="secondary">
                Contribution
                {event.avContributionAmount && ` - ${event.paymentCurrency}${event.avContributionAmount}`}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
