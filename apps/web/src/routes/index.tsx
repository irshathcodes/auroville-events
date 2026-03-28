import { Tabs } from "@base-ui/react/tabs";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, useMemo } from "react";
import { format, addDays, parse } from "date-fns";
import { CalendarIcon, Sun, Sunrise, CalendarDays, Search, X } from "lucide-react";
import { flushSync } from 'react-dom';

import { EventCard } from "@/components/event-card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchEventsByDate } from "@/lib/api";
import type { Event } from "@/lib/types";
import { cn, formatDateParam, getAurovilleToday } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
    const today = getAurovilleToday();
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

function searchEvents(events: Event[], query: string): Event[] {
  const q = query.toLowerCase().trim();
  if (!q) return events;
  return events.filter((event) =>
    [event.title, event.description, event.placeName, event.location, event.category]
      .some((field) => field?.toLowerCase().includes(q))
  );
}

function HomePage() {
  const { events, tab: activeTab } = Route.useLoaderData();
  const { date: customDate } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const isMobile = useIsMobile();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const filteredEvents = useMemo(
    () => searchEvents(events, searchQuery),
    [events, searchQuery],
  );

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
        <div className="flex items-center justify-between gap-3">
          {searchOpen ? (
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 shadow-sm">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    flushSync(() => {
                      setSearchQuery('');
                      setSearchOpen(false);
                    });
                    searchButtonRef.current?.focus();
                  }
                }}
                placeholder="Search events..."
                autoFocus
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <Button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="shrink-0 rounded-full"
                variant='ghost'
                size='icon-lg'
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Auroville Events</h1>
                <p className="text-muted-foreground text-sm sm:block">
                  Discover workshops, events, and classes happening in Auroville
                </p>
              </div>
              <Button
                onClick={() => {
                  setSearchOpen(true);
                  requestAnimationFrame(() => searchInputRef.current?.focus());
                }}
                ref={searchButtonRef}
                className={cn("shrink-0 rounded-full p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start gap-1.5", isMobile ? "size-10" : "w-fit! h-10 px-5! pl-4!")}
                aria-label="Search events"
                variant='outline'
                size='icon-lg'
              >
                <Search className={isMobile ? "size-5" : "size-4"} />
                <span className={isMobile ? 'hidden' : ''}>Search</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "No events matching your search" : "No events found"}
          </p>
        </div>
      )}

      {filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event: Event) => (
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
                {activeTab === key && filteredEvents.length > 0 && (
                  <span className="min-w-5 h-5 flex items-center justify-center rounded-full bg-primary-foreground/20 text-xs tabular-nums">
                    {events.length}
                  </span>
                )}
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
                {activeTab === "custom" && events.length > 0 && (
                  <span className="min-w-5 h-5 flex items-center justify-center rounded-full bg-primary-foreground/20 text-xs tabular-nums">
                    {filteredEvents.length}
                  </span>
                )}
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
