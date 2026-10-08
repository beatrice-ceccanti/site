CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`section` text NOT NULL,
	`language` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_articles_section_language` ON `articles` (`section`,`language`);