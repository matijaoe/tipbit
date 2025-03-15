CREATE TABLE `alby_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`connection_id` text NOT NULL,
	`alby_id` text NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`connection_id`) REFERENCES `payment_connections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alby_connections_connection_id_unique` ON `alby_connections` (`connection_id`);--> statement-breakpoint
CREATE TABLE `auth_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_user_idx` ON `auth_connections` (`provider`,`provider_user_id`);--> statement-breakpoint
CREATE TABLE `coinos_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`connection_id` text NOT NULL,
	`coinos_username` text NOT NULL,
	`api_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`connection_id`) REFERENCES `payment_connections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coinos_connections_connection_id_unique` ON `coinos_connections` (`connection_id`);--> statement-breakpoint
CREATE TABLE `payment_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`service_type` text NOT NULL,
	`name` text,
	`is_enabled` integer DEFAULT true,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profile_payment_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`connection_id` text NOT NULL,
	`priority` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`connection_id`) REFERENCES `payment_connections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_connection_idx` ON `profile_payment_preferences` (`profile_id`,`connection_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`handle` text NOT NULL,
	`display_name` text NOT NULL,
	`avatar_url` text,
	`is_public` integer DEFAULT true,
	`is_default` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_handle_unique` ON `profiles` (`handle`);--> statement-breakpoint
CREATE TABLE `strike_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`connection_id` text NOT NULL,
	`strike_profile_id` text NOT NULL,
	`api_key` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`connection_id`) REFERENCES `payment_connections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `strike_connections_connection_id_unique` ON `strike_connections` (`connection_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier_type` text NOT NULL,
	`identifier` text NOT NULL,
	`avatar_url` text,
	`role` text DEFAULT 'USER' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_identifier_unique` ON `users` (`identifier`);