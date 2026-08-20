CREATE TABLE `compatibility_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceCategory` enum('phone','tablet','desktop','laptop','other') NOT NULL,
	`browserFamily` enum('safari','chrome','edge','firefox','other') NOT NULL,
	`issueType` enum('audio-output','playback','layout','accessibility','other') NOT NULL,
	`osVersion` varchar(80),
	`message` text NOT NULL,
	`status` enum('submitted','assigned','approved','changes-requested','rejected','closed') NOT NULL DEFAULT 'submitted',
	`assignedReviewerUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compatibility_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compatibility_review_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feedbackId` int NOT NULL,
	`actorUserId` int NOT NULL,
	`reviewerUserId` int,
	`event` enum('assigned','approved','changes-requested','rejected','closed') NOT NULL,
	`note` varchar(600),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compatibility_review_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `compatibility_feedback` ADD CONSTRAINT `compatibility_feedback_assignedReviewerUserId_users_id_fk` FOREIGN KEY (`assignedReviewerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compatibility_review_events` ADD CONSTRAINT `compat_rev_evt_feedback_fk` FOREIGN KEY (`feedbackId`) REFERENCES `compatibility_feedback`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compatibility_review_events` ADD CONSTRAINT `compat_rev_evt_actor_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compatibility_review_events` ADD CONSTRAINT `compat_rev_evt_reviewer_fk` FOREIGN KEY (`reviewerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
