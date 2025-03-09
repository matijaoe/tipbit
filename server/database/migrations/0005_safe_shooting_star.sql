ALTER TABLE `strike_connections` ADD `strike_profile_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `strike_connections` DROP COLUMN `handle`;--> statement-breakpoint
ALTER TABLE `strike_connections` DROP COLUMN `receiver_id`;