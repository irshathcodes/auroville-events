import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { format, addDays, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { fetchEventsByDate } from "@/lib/api";
import type { Event } from "@/lib/types";
import { formatDateParam } from "@/lib/utils";

type DateTab = "today" | "tomorrow" | "week" | "custom";

interface SearchParams {
  date?: string;
  tab?: DateTab;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    date: (search.date as string) || undefined,
    tab: (search.tab as DateTab) || undefined,
  }),
  loaderDeps: ({ search }) => ({ date: search.date, tab: search.tab }),
  loader: async ({ deps }) => {
    const today = new Date();
    const tab = deps.tab || "today";

    if (tab === "week") {
      const dates = Array.from({ length: 7 }, (_, i) =>
        formatDateParam(addDays(today, i))
      );
      const results = await Promise.all(dates.map(fetchEventsByDate));
      const events = results.flat();
      return { events, tab };
    }

    let dateStr: string;
    if (tab === "custom" && deps.date) {
      dateStr = deps.date;
    } else if (tab === "tomorrow") {
      dateStr = formatDateParam(addDays(today, 1));
    } else {
      dateStr = formatDateParam(today);
    }

    const events = await fetchEventsByDate(dateStr);
    return { events, tab };
  },
  component: HomePage,
});

const categories = ["all", "workshop", "event", "class"] as const;

function HomePage() {
  const { events, tab: activeTab } = Route.useLoaderData();
  const navigate = useNavigate({ from: "/" });
  const { date: customDate } = Route.useSearch();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredEvents = events.filter((event: Event) =>
    selectedCategory === "all" ? true : event.category === selectedCategory
  );

  const handleTabChange = (tab: DateTab, date?: string) => {
    setSelectedCategory("all");
    navigate({
      search: {
        tab: tab === "today" ? undefined : tab,
        date: tab === "custom" ? date : undefined,
      },
    });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Auroville Events</h1>
        <p className="text-muted-foreground">
          Discover workshops, events, and classes happening in Auroville
        </p>
      </div>

      {/* Date tabs */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <Button
          variant={activeTab === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTabChange("today")}
        >
          Today
        </Button>
        <Button
          variant={activeTab === "tomorrow" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTabChange("tomorrow")}
        >
          Tomorrow
        </Button>
        <Button
          variant={activeTab === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTabChange("week")}
        >
          This Week
        </Button>
        <div className="relative">
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            value={activeTab === "custom" ? customDate : ""}
            onChange={(e) => {
              if (e.target.value) handleTabChange("custom", e.target.value);
            }}
          />
          <Button
            variant={activeTab === "custom" ? "default" : "outline"}
            size="sm"
          >
            <CalendarIcon className="mr-1 h-4 w-4" />
            {activeTab === "custom" && customDate
              ? format(parse(customDate, "yyyy-MM-dd", new Date()), "MMM d")
              : "Pick Date"}
          </Button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === "all" ? "All Events" : category}
          </Button>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found</p>
        </div>
      )}

      {filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event: Event) => (
            <EventCard key={`${event.date}-${event.title}`} event={event} />
          ))}
        </div>
      )}
    </main>
  );
}
