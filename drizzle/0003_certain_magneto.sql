CREATE TABLE `contact_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`serviceInterest` varchar(120) NOT NULL,
	`message` text NOT NULL,
	`paymentDetailsRequested` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_enquiries_id` PRIMARY KEY(`id`)
);
