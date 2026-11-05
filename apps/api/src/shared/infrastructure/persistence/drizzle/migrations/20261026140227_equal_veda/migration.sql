CREATE TYPE "device_status" AS ENUM('unlinked', 'linked', 'suspended');--> statement-breakpoint
CREATE TYPE "notification_level" AS ENUM('info', 'warning', 'error');--> statement-breakpoint
CREATE TYPE "schedule_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "subscription_status" AS ENUM('pending', 'active', 'expired', 'canceled');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"provider" varchar(255),
	"provider_id" varchar(255),
	"user_id" varchar(24) NOT NULL,
	"password" varchar(255),
	CONSTRAINT "accounts_pkey" PRIMARY KEY("provider","provider_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(24) PRIMARY KEY,
	"token" varchar(64) NOT NULL,
	"user_id" varchar(24) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compartments" (
	"device_id" varchar(24),
	"position" varchar(3),
	"medicine" varchar(255),
	"capacity" integer NOT NULL,
	"dosage" numeric(8,2) NOT NULL,
	"last_refill_at" timestamp,
	CONSTRAINT "compartments_pkey" PRIMARY KEY("device_id","position")
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" varchar(24) PRIMARY KEY,
	"user_id" varchar(24),
	"factory_model" varchar(12) NOT NULL,
	"status" "device_status" NOT NULL,
	"name" varchar(255),
	"position" varchar(255),
	"activated_at" timestamp
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
	"is_required" boolean NOT NULL,
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
CREATE TABLE "payments" (
	"id" varchar(24) PRIMARY KEY,
	"subscription_id" varchar(24),
	"amount" numeric(10,2) NOT NULL,
	"status" "payment_status" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" varchar(24) PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"price" numeric(10,2) NOT NULL,
	"duration" integer NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(24) PRIMARY KEY,
	"user_id" varchar(24) NOT NULL,
	"device_id" varchar(24) NOT NULL,
	"plan_id" varchar(24) NOT NULL,
	"status" "subscription_status" NOT NULL,
	"started_at" timestamp NOT NULL,
	"expired_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar(24) PRIMARY KEY,
	"payment_id" varchar(24),
	"gateway" varchar(100) NOT NULL,
	"gateway_id" integer NOT NULL,
	"account_number" varchar(100),
	"code" varchar(255),
	"amount_in" numeric(10,2) NOT NULL,
	"amount_out" numeric(10,2) NOT NULL,
	"content" text,
	"reference_code" varchar(255),
	"transaction_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(24) PRIMARY KEY,
	"username" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified_at" timestamp,
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
CREATE INDEX "plans_name_idx" ON "plans" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_id_device_id_uq_idx" ON "subscriptions" ("user_id","device_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_device_id_idx" ON "subscriptions" ("device_id");--> statement-breakpoint
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions" ("plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_gateway_id_uq_idx" ON "transactions" ("gateway_id");--> statement-breakpoint
CREATE INDEX "transactions_code_idx" ON "transactions" ("code");--> statement-breakpoint
CREATE INDEX "transactions_account_number_transaction_date_idx" ON "transactions" ("account_number","transaction_date");--> statement-breakpoint
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
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_device_id_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_device_id_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL;