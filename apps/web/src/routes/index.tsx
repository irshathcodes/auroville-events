import { Tabs } from "@base-ui/react/tabs";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { format, addDays, parse } from "date-fns";
import { CalendarIcon, Sun, Sunrise, CalendarDays } from "lucide-react";

import { EventCard } from "@/components/event-card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const tabClass =
  "relative z-10 flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-5 py-3 md:px-4 md:py-2 text-sm font-medium text-muted-foreground outline-hidden transition-colors select-none hover:text-foreground data-[active]:text-primary-foreground no-underline";

function HomePage() {
  const { events, tab: activeTab } = Route.useLoaderData();
  const { date: customDate } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedDate =
    activeTab === "custom" && customDate
      ? parse(customDate, "yyyy-MM-dd", new Date())
      : undefined;

  const customLabel = selectedDate ? format(selectedDate, "MMM d") : "Date";

  const tabs: {
    key: DateTab;
    label: string;
    icon: React.ReactNode;
    search: SearchParams;
  }[] = [
    { key: "today", label: "Today", icon: <Sun className="h-4 w-4" />, search: {} },
    { key: "tomorrow", label: "Tomorrow", icon: <Sunrise className="h-4 w-4" />, search: { tab: "tomorrow" } },
    { key: "week", label: "Week", icon: <CalendarDays className="h-4 w-4" />, search: { tab: "week" } },
  ];

  return (
    <main className="container mx-auto px-4 pt-6 pb-28">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Auroville Events</h1>
        <p className="text-muted-foreground text-sm hidden sm:block">
          Discover workshops, events, and classes happening in Auroville
        </p>
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found</p>
        </div>
      )}

      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: Event) => (
            <EventCard key={`${event.date}-${event.title}`} event={event} />
          ))}
        </div>
      )}

      {/* Floating bottom date bar */}
      <nav className="fixed bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 z-50 pb-[env(safe-area-inset-bottom)]">
        <Tabs.Root
          value={activeTab}
          className="rounded-full bg-background/70 dark:bg-background/60 backdrop-blur-xl border border-border/50 shadow-lg"
        >
          <Tabs.List className="relative z-0 flex items-center gap-1 px-2 py-2">
            {tabs.map(({ key, label, icon, search }) => (
              <Tabs.Tab
                key={key}
                value={key}
                className={tabClass}
                render={<Link to="/" search={search} />}
              >
                {icon}
                <span className={activeTab === key ? "" : "hidden sm:inline"}>
                  {label}
                </span>
              </Tabs.Tab>
            ))}

            {/* Date picker tab with popover */}
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal>
              <PopoverTrigger
                render={
                  <Tabs.Tab
                    value="custom"
                    className={tabClass}
                  />
                }
              >
                <CalendarIcon className="h-4 w-4" />
                <span className={activeTab === "custom" ? "whitespace-nowrap" : "hidden sm:inline"}>
                  {customLabel}
                </span>
              </PopoverTrigger>
              <PopoverContent side="top" sideOffset={12} className="w-auto p-0">
                <Calendar
                  className="p-4 [--cell-size:--spacing(10)] text-base"
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      navigate({
                        search: { tab: "custom", date: formatDateParam(date) },
                      });
                      setCalendarOpen(false);
                    }
                  }}
                  defaultMonth={selectedDate || new Date()}
                />
              </PopoverContent>
            </Popover>

            <Tabs.Indicator className="absolute top-1/2 left-0 z-0 h-[calc(100%-16px)] w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] -translate-y-1/2 rounded-full bg-primary shadow-sm transition-all duration-200 ease-in-out" />
          </Tabs.List>
        </Tabs.Root>
      </nav>
    </main>
  );
}
