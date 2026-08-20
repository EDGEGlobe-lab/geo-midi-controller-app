CREATE TABLE `active_audio_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`projectKey` varchar(120) NOT NULL,
	`assetId` int NOT NULL,
	`restoredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `active_audio_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `active_audio_source_owner_project_uq` UNIQUE(`ownerUserId`,`projectKey`)
);
--> statement-breakpoint
CREATE TABLE `audio_source_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`projectKey` varchar(120) NOT NULL,
	`assetId` int NOT NULL,
	`event` enum('restored','deleted') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audio_source_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `studio_assets` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `active_audio_sources` ADD CONSTRAINT `active_audio_sources_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `active_audio_sources` ADD CONSTRAINT `active_audio_sources_assetId_studio_assets_id_fk` FOREIGN KEY (`assetId`) REFERENCES `studio_assets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audio_source_events` ADD CONSTRAINT `audio_source_events_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audio_source_events` ADD CONSTRAINT `audio_source_events_assetId_studio_assets_id_fk` FOREIGN KEY (`assetId`) REFERENCES `studio_assets`(`id`) ON DELETE no action ON UPDATE no action;