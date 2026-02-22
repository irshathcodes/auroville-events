CREATE TABLE `event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`image` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`address` text NOT NULL,
	`place` text NOT NULL,
	`location_link` text,
	`contact_no` text,
	`payment` text NOT NULL,
	`payment_currency` text,
	`guest_contribution_amount` real,
	`av_contribution_amount` real,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`created_by_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_slug_unique` ON `event` (`slug`);--> statement-breakpoint
CREATE INDEX `event_slug_idx` ON `event` (`slug`);--> statement-breakpoint
CREATE INDEX `event_category_idx` ON `event` (`category`);--> statement-breakpoint
CREATE INDEX `event_start_time_idx` ON `event` (`start_time`);--> statement-breakpoint
CREATE INDEX `event_created_by_idx` ON `event` (`created_by_id`);--> statement-breakpoint
ALTER TABLE `user` ADD `can_create_events` integer DEFAULT true NOT NULL;