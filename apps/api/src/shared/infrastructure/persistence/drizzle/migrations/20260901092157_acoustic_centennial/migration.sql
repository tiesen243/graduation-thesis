CREATE TYPE "device_status" AS ENUM('unlinked', 'linked', 'suspended');--> statement-breakpoint
CREATE TYPE "notification_level" AS ENUM('info', 'warning', 'error');--> statement-breakpoint
CREATE TYPE "schedule_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"provider" varchar(255),
	"provider_id" varchar(255),
	"password" varchar(255),
	"user_id" varchar(24) NOT NULL,
	CONSTRAINT "accounts_pkey" PRIMARY KEY("provider","provider_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(24) PRIMARY KEY,
	"token" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_id" varchar(24) NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compartments" (
	"medicine" varchar(255),
	"capacity" integer NOT NULL,
	"dosage" numeric(8,2) NOT NULL,
	"position" varchar(3),
	"last_refill_at" timestamp,
	"device_id" varchar(24),
	CONSTRAINT "compartments_pkey" PRIMARY KEY("device_id","position")
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" varchar(24) PRIMARY KEY,
	"factory_model" varchar(12) NOT NULL,
	"status" "device_status" NOT NULL,
	"name" varchar(255),
	"position" varchar(255),
	"activated_at" timestamp,
	"user_id" varchar(24)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(24) PRIMARY KEY,
	"user_id" varchar(24) NOT NULL,
	"device_id" varchar(24),
	"schedule_id" varchar(24),
	"level" "notification_level" NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"payload" jsonb,
	"read_at" timestamp,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_items" (
	"schedule_id" varchar(24),
	"slot" varchar(3),
	"quantity" integer NOT NULL,
	CONSTRAINT "schedule_items_pkey" PRIMARY KEY("schedule_id","slot")
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" varchar(24) PRIMARY KEY,
	"user_id" varchar(24) NOT NULL,
	"device_id" varchar(24) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"status" "schedule_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(24) PRIMARY KEY,
	"username" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"image" varchar(255),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_uq_idx" ON "sessions" ("token");--> statement-breakpoint
CREATE INDEX "compartments_device_id_index" ON "compartments" ("device_id");--> statement-breakpoint
CREATE UNIQUE INDEX "devices_factory_model_index" ON "devices" ("factory_model");--> statement-breakpoint
CREATE INDEX "devices_user_id_index" ON "devices" ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications" ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "notifications_schedule_id_idx" ON "notifications" ("schedule_id");--> statement-breakpoint
CREATE INDEX "schedule_items_schedule_id_index" ON "schedule_items" ("schedule_id");--> statement-breakpoint
CREATE INDEX "schedules_user_id_index" ON "schedules" ("user_id");--> statement-breakpoint
CREATE INDEX "schedules_device_id_index" ON "schedules" ("device_id");--> statement-breakpoint
CREATE INDEX "schedules_user_id_date_index" ON "schedules" ("user_id","date");--> statement-breakpoint
CREATE INDEX "schedules_device_id_date_index" ON "schedules" ("device_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_uq_idx" ON "users" ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq_idx" ON "users" ("email");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "compartments" ADD CONSTRAINT "compartments_device_id_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_device_id_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_schedule_id_schedules_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_schedule_id_schedules_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_device_id_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE;