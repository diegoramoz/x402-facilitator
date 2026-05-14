CREATE TABLE "api_audit_log" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "api_audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"nano_id" varchar(11) NOT NULL UNIQUE,
	"organization_id" bigint NOT NULL,
	"actor_user_id" bigint,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" varchar(255),
	"details" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idempotency_response" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "idempotency_response_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"nano_id" varchar(11) NOT NULL UNIQUE,
	"api_key_id" bigint NOT NULL,
	"route" varchar(255) NOT NULL,
	"request_hash" varchar(64) NOT NULL,
	"idempotency_key" varchar(255) NOT NULL,
	"response_status" integer NOT NULL,
	"response_body" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"nano_id" varchar(11) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"description" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_member" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_member_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"nano_id" varchar(11) NOT NULL UNIQUE,
	"organization_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"role" varchar(50) DEFAULT 'developer' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "api_audit_log_organization_id_idx" ON "api_audit_log" ("organization_id");--> statement-breakpoint
CREATE INDEX "api_audit_log_created_at_idx" ON "api_audit_log" ("created_at");--> statement-breakpoint
CREATE INDEX "idempotency_response_api_key_id_idx" ON "idempotency_response" ("api_key_id");--> statement-breakpoint
CREATE INDEX "idempotency_response_idempotency_key_idx" ON "idempotency_response" ("idempotency_key");--> statement-breakpoint
CREATE INDEX "idempotency_response_request_hash_idx" ON "idempotency_response" ("request_hash");--> statement-breakpoint
CREATE INDEX "idempotency_response_expires_at_idx" ON "idempotency_response" ("expires_at");--> statement-breakpoint
CREATE INDEX "organization_nano_id_idx" ON "organization" ("nano_id");--> statement-breakpoint
CREATE INDEX "organization_slug_idx" ON "organization" ("slug");--> statement-breakpoint
CREATE INDEX "organization_member_organization_id_idx" ON "organization_member" ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_member_user_id_idx" ON "organization_member" ("user_id");--> statement-breakpoint
CREATE INDEX "organization_member_nano_id_idx" ON "organization_member" ("nano_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_member_org_user_unique" ON "organization_member" ("organization_id","user_id");--> statement-breakpoint
ALTER TABLE "api_audit_log" ADD CONSTRAINT "api_audit_log_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;