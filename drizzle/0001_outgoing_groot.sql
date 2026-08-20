CREATE TABLE `generation_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectKey` varchar(120) NOT NULL,
	`jobType` enum('music','vocal','sfx','motion') NOT NULL,
	`status` enum('queued','running','completed','failed','cancelled') NOT NULL DEFAULT 'queued',
	`prompt` text NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `generation_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sampler_outputs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectKey` varchar(120) NOT NULL,
	`generationJobId` int,
	`assetId` int,
	`outputType` enum('music','vocal','sfx','motion') NOT NULL,
	`name` varchar(255) NOT NULL,
	`durationMs` int,
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sampler_outputs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `studio_assets` ADD `durationMs` int;--> statement-breakpoint
ALTER TABLE `studio_assets` ADD `waveformPreview` text;--> statement-breakpoint
ALTER TABLE `studio_assets` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `generation_jobs` ADD CONSTRAINT `generation_jobs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sampler_outputs` ADD CONSTRAINT `sampler_outputs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sampler_outputs` ADD CONSTRAINT `sampler_outputs_generationJobId_generation_jobs_id_fk` FOREIGN KEY (`generationJobId`) REFERENCES `generation_jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sampler_outputs` ADD CONSTRAINT `sampler_outputs_assetId_studio_assets_id_fk` FOREIGN KEY (`assetId`) REFERENCES `studio_assets`(`id`) ON DELETE no action ON UPDATE no action;