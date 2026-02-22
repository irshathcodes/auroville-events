import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const categoryEnum = ["workshop", "event", "class"] as const;
export type Category = (typeof categoryEnum)[number];

export const paymentEnum = ["contribution", "free"] as const;
export type Payment = (typeof paymentEnum)[number];

export const event = sqliteTable(
  "event",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    image: text("image").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category", { enum: categoryEnum }).notNull(),
    address: text("address").notNull(),
    place: text("place").notNull(),
    locationLink: text("location_link"),
    contactNo: text("contact_no"),
    payment: text("payment", { enum: paymentEnum }).notNull(),
    paymentCurrency: text("payment_currency"),
    guestContributionAmount: real("guest_contribution_amount"),
    avContributionAmount: real("av_contribution_amount"),
    startTime: integer("start_time", { mode: "timestamp_ms" }).notNull(),
    endTime: integer("end_time", { mode: "timestamp_ms" }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("event_slug_idx").on(table.slug),
    index("event_category_idx").on(table.category),
    index("event_start_time_idx").on(table.startTime),
    index("event_created_by_idx").on(table.createdById),
  ]
);

export const eventRelations = relations(event, ({ one }) => ({
  createdBy: one(user, {
    fields: [event.createdById],
    references: [user.id],
  }),
}));

export type Event = typeof event.$inferSelect;
export type NewEvent = typeof event.$inferInsert;
