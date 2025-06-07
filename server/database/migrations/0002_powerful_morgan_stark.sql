PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_strike_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`connection_id` text NOT NULL,
	`strike_profile_id` text NOT NULL,
	`handle` text,
	`api_key` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`connection_id`) REFERENCES `payment_connections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_strike_connections`("id", "connection_id", "strike_profile_id", "handle", "api_key", "created_at", "updated_at") SELECT "id", "connection_id", "strike_profile_id", "handle", "api_key", "created_at", "updated_at" FROM `strike_connections`;--> statement-breakpoint
DROP TABLE `strike_connections`;--> statement-breakpoint
ALTER TABLE `__new_strike_connections` RENAME TO `strike_connections`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `strike_connections_connection_id_unique` ON `strike_connections` (`connection_id`);