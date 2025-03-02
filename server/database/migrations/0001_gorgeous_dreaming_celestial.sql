ALTER TABLE `users` RENAME COLUMN "username" TO "identifier_type";--> statement-breakpoint
DROP INDEX `users_username_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD `identifier` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_identifier_unique` ON `users` (`identifier`);--> statement-breakpoint
DROP INDEX `profiles_display_name_unique`;--> statement-breakpoint
ALTER TABLE `profiles` ADD `handle` text NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `updated_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_handle_unique` ON `profiles` (`handle`);