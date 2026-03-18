import { Link } from "@tanstack/react-router";
import { format, parse } from "date-fns";
import { Calendar, MapPin, Clock } from "lucide-react";

import { getEventSlug } from "@/lib/api";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

// Earthy/warm palette pairs that feel like Auroville
const PALETTE: [string, string][] = [
  ["#e07a5f", "#f2cc8f"], // terracotta → sand
  ["#81b29a", "#f2cc8f"], // sage → sand
  ["#3d405b", "#81b29a"], // slate → sage
  ["#e07a5f", "#81b29a"], // terracotta → sage
  ["#f4845f", "#f7dc6f"], // coral → gold
  ["#7c9885", "#d4a574"], // forest → clay
  ["#c17767", "#e8d5b7"], // rust → cream
  ["#5f7a8a", "#a8c5b8"], // ocean → mint
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function GeneratedPattern({ seed }: { seed: string }) {
  const hash = hashString(seed);
  const [color1, color2] = PALETTE[hash % PALETTE.length];
  const angle = (hash % 360);
  const patternType = hash % 3;

  // Generate deterministic shapes
  const shapes: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const h = hashString(seed + i);
    const x = (h % 80) + 10;
    const y = ((h >> 8) % 80) + 10;
    const size = (h % 40) + 20;
    const opacity = 0.08 + (h % 10) / 100;

    if (patternType === 0) {
      // Circles
      shapes.push(
        <circle key={i} cx={`${x}%`} cy={`${y}%`} r={size} fill="white" opacity={opacity} />
      );
    } else if (patternType === 1) {
      // Rounded rectangles
      const rotation = h % 45;
      shapes.push(
        <rect
          key={i} x={`${x - 5}%`} y={`${y - 5}%`}
          width={size * 1.5} height={size * 1.5}
          rx={8} fill="white" opacity={opacity}
          transform={`rotate(${rotation} ${x} ${y})`}
        />
      );
    } else {
      // Hexagon-ish polygons
      const r = size * 0.7;
      const cx = x;
      const cy = y;
      const points = Array.from({ length: 6 }, (_, j) => {
        const a = (Math.PI / 3) * j;
        return `${cx + r * Math.cos(a)}%,${cy + r * Math.sin(a)}%`;
      }).join(" ");
      shapes.push(
        <polygon key={i} points={points} fill="white" opacity={opacity} />
      );
    }
  }

  return (
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }}
    >
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {shapes}
      </svg>
    </div>
  );
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
      <div className="group relative h-[28rem] overflow-hidden rounded-xl cursor-pointer shadow-md">
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
          <GeneratedPattern seed={event.title || "event"} />
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
