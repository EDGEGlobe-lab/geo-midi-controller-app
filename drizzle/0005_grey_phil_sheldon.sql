CREATE TABLE `hardware_consent_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`event` enum('granted','revoked') NOT NULL,
	`noticeVersion` varchar(80) NOT NULL,
	`purpose` varchar(240) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hardware_consent_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hardware_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`label` varchar(120) NOT NULL,
	`category` enum('computer','standalone','audio-interface','midi-controller','other') NOT NULL,
	`productReference` varchar(160),
	`activationState` enum('disabled','active','revoked') NOT NULL DEFAULT 'disabled',
	`consentNoticeVersion` varchar(80),
	`consentedAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hardware_registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `hardware_consent_events` ADD CONSTRAINT `hw_event_registration_fk` FOREIGN KEY (`registrationId`) REFERENCES `hardware_registrations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hardware_consent_events` ADD CONSTRAINT `hw_event_owner_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hardware_registrations` ADD CONSTRAINT `hw_registration_owner_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
