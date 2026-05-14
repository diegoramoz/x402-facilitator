CREATE TYPE "wallet_status" AS ENUM('pending', 'active', 'failed');--> statement-breakpoint
CREATE TABLE "wallet" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wallet_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL UNIQUE,
	"wallet_id" varchar(36),
	"evm_address" varchar(42),
	"blockchain" varchar(20) DEFAULT 'ARC-TESTNET' NOT NULL,
	"status" "wallet_status" DEFAULT 'pending'::"wallet_status" NOT NULL,
	"failure_reason" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "wallet_userId_idx" ON "wallet" ("user_id");--> statement-breakpoint
CREATE INDEX "wallet_status_idx" ON "wallet" ("status");--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;