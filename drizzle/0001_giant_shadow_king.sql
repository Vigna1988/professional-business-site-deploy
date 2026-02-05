CREATE TABLE `quoteRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`company` varchar(255),
	`commodityType` varchar(100) NOT NULL,
	`quantity` varchar(100) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`deliveryTimeline` varchar(100) NOT NULL,
	`notes` text,
	`status` enum('new','contacted','quoted','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quoteRequests_id` PRIMARY KEY(`id`)
);
