import { auth } from "@auroville-events/auth";
import { db } from "@auroville-events/db";
import { event, type NewEvent } from "@auroville-events/db/schema";
import { eq, desc } from "drizzle-orm";
import { Hono } from "hono";

const events = new Hono();

// Get all events
events.get("/", async (c) => {
  const allEvents = await db
    .select()
    .from(event)
    .orderBy(desc(event.startTime));

  return c.json(allEvents);
});

// Get single event by slug
events.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [foundEvent] = await db.select().from(event).where(eq(event.slug, slug));

  if (!foundEvent) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json(foundEvent);
});

// Create event (requires auth + permission)
events.post("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!session.user.canCreateEvents) {
    return c.json({ error: "You do not have permission to create events" }, 403);
  }

  const body = await c.req.json<Omit<NewEvent, "id" | "createdAt" | "updatedAt" | "createdById">>();

  // Generate slug from title if not provided
  const slug = body.slug || generateSlug(body.title);

  // Check if slug already exists
  const [existingEvent] = await db.select().from(event).where(eq(event.slug, slug));
  if (existingEvent) {
    return c.json({ error: "An event with this slug already exists" }, 400);
  }

  const [newEvent] = await db
    .insert(event)
    .values({
      ...body,
      slug,
      createdById: session.user.id,
    })
    .returning();

  return c.json(newEvent, 201);
});

// Update event
events.put("/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = Number.parseInt(c.req.param("id"));
  const [existingEvent] = await db.select().from(event).where(eq(event.id, id));

  if (!existingEvent) {
    return c.json({ error: "Event not found" }, 404);
  }

  // Only allow the creator to update
  if (existingEvent.createdById !== session.user.id) {
    return c.json({ error: "You can only edit your own events" }, 403);
  }

  const body = await c.req.json<Partial<NewEvent>>();

  const [updatedEvent] = await db
    .update(event)
    .set(body)
    .where(eq(event.id, id))
    .returning();

  return c.json(updatedEvent);
});

// Delete event
events.delete("/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = Number.parseInt(c.req.param("id"));
  const [existingEvent] = await db.select().from(event).where(eq(event.id, id));

  if (!existingEvent) {
    return c.json({ error: "Event not found" }, 404);
  }

  // Only allow the creator to delete
  if (existingEvent.createdById !== session.user.id) {
    return c.json({ error: "You can only delete your own events" }, 403);
  }

  await db.delete(event).where(eq(event.id, id));

  return c.json({ success: true });
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

export { events };
