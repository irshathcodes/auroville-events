import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { eventsApi } from "@/lib/api";
import type { Event } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: async () => {
    const events = await eventsApi.getAll();
    return { events };
  },
  component: HomePage,
});

const categories = ["all", "workshop", "event", "class"] as const;

function HomePage() {
  const { events } = Route.useLoaderData();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredEvents = events.filter((event: Event) =>
    selectedCategory === "all" ? true : event.category === selectedCategory
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Auroville Events</h1>
        <p className="text-muted-foreground">
          Discover workshops, events, and classes happening in Auroville
        </p>
      </div>

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
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  );
}