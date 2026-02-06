CREATE TABLE `customerAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`address` text,
	`country` varchar(100),
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `quoteRequests` ADD `customerId` int;--> statement-breakpoint
ALTER TABLE `quoteRequests` ADD `quotedPrice` varchar(100);--> statement-breakpoint
ALTER TABLE `quoteRequests` ADD `currency` varchar(10);--> statement-breakpoint
ALTER TABLE `quoteRequests` ADD `adminNotes` text;