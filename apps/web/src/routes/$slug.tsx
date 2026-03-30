import { createFileRoute, Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import type { Event } from "@/lib/types";
import { format, parse } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ExternalLink,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { GeneratedPattern } from "@/components/generated-pattern";
import { fetchEventsByDate, findEventBySlug } from "@/lib/api";
import { formatDateParam, getAurovilleToday } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SearchParams {
  date?: string;
}

const SITE_URL = import.meta.env.DEV ? import.meta.env.BASE_URL : "https://auroville-events.irshathv2.workers.dev";
const DEFAULT_OG_IMAGE = `${SITE_URL}/auroville-events-logo.jpg`;

function buildEventMeta(event: Event, slug: string, dateStr: string) {
  const title = event.title
    ? `${event.title} — Auroville Events`
    : "Auroville Events";
  const description = event.description
    ? event.description.slice(0, 160)
    : [event.placeName, event.location].filter(Boolean).join(", ") ||
    "An event in Auroville";
  const url = `${SITE_URL}/${slug}?date=${dateStr}`;
  const image = event.imageUrl || DEFAULT_OG_IMAGE;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      // Open Graph
      { property: "og:title", content: event.title || "Auroville Event" },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      // Twitter
      { name: "twitter:title", content: event.title || "Auroville Event" },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export const Route = createFileRoute("/$slug")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    date: (search.date as string) || undefined,
  }),
  loaderDeps: ({ search }) => ({ date: search.date }),
  loader: async ({ params, deps }) => {
    const dateStr = deps.date || formatDateParam(getAurovilleToday());
    const events = await fetchEventsByDate(dateStr);
    const event = findEventBySlug(events, params.slug);
    if (!event) throw new Error("Event not found");
    return { event, dateStr };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { event, dateStr } = loaderData;
    const slug = event.title
      ? event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : "event";
    return buildEventMeta(event, slug, dateStr);
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

function ShareButton({ title }: { title: string }) {
  const url = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  return (
    <button
      className="fixed top-4 right-6 z-50 flex items-center justify-center size-11 rounded-full bg-white/70 backdrop-blur-lg border border-gray-200/50 shadow-lg hover:bg-white/90 transition-transform scale-100 active:scale-90 duration-300 cursor-pointer"
      aria-label="Share event"
      onClick={handleShare}
    >
      <Share2 className="h-5 w-5 text-gray-800" />
    </button>
  );
}

function EventDetailPage() {
  const { event } = Route.useLoaderData();
  const eventDate = event.date
    ? parse(event.date, "yyyy-MM-dd", new Date())
    : null;
  const startFormatted = formatTime(event.startTime);
  const endFormatted = formatTime(event.endTime);
  const canGoBack = useCanGoBack();
  const router = useRouter();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (canGoBack) {
      router.history.go(-1);
    } else {
      navigate({ to: '/' });
    }
  }

  return (
    <main className="min-h-screen pb-12 overflow-x-hidden">
      {/* Floating back & share buttons */}
      <Button
        className="fixed top-4 left-4 z-50 flex items-center justify-center size-11 rounded-full bg-white/70 backdrop-blur-lg border border-gray-200/50 shadow-lg hover:bg-white/90 transition-transform scale-100 active:scale-90 duration-300"
        aria-label="Back to events"
        onClick={handleGoBack}
      >
        <ArrowLeft className="h-5 w-5 text-gray-800" />
      </Button>

      <ShareButton title={event.title || "Auroville Event"} />

      {/* Hero media */}
      {event.imageUrl ? (
        <div className="bg-gray-100 px-4 pt-16 pb-8 flex justify-center">
          <img
            src={event.imageUrl}
            alt={event.title || "Event"}
            className="w-full max-w-md max-h-[70vh] object-contain rounded-xl shadow-md"
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
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base break-words overflow-wrap-anywhere">
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
