DROP INDEX "wallet_status_idx";--> statement-breakpoint
ALTER TABLE "wallet" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "wallet" DROP COLUMN "failure_reason";--> statement-breakpoint
ALTER TABLE "wallet" DROP COLUMN "retry_count";--> statement-breakpoint
ALTER TABLE "wallet" DROP COLUMN "last_attempt_at";