CREATE TABLE `saved_radio_stations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`stationId` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_radio_stations_id` PRIMARY KEY(`id`),
	CONSTRAINT `saved_radio_owner_station_uq` UNIQUE(`ownerUserId`,`stationId`)
);
--> statement-breakpoint
ALTER TABLE `saved_radio_stations` ADD CONSTRAINT `saved_radio_stations_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;