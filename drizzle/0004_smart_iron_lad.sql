ALTER TABLE `contact_enquiries` ADD `ownerUserId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_enquiries` ADD `ownerUserId` int NOT NULL;
ALTER TABLE `contact_enquiries` ADD CONSTRAINT `contact_enquiries_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
