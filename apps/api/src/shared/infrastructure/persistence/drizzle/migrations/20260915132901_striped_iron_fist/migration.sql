CREATE TYPE "payment_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "subscription_status" AS ENUM('pending', 'active', 'expired', 'canceled');--> statement-breakpoint
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
ALTER TABLE "schedule_items" ADD COLUMN "is_required" boolean NOT NULL;--> statement-breakpoint
CREATE INDEX "plans_name_idx" ON "plans" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_id_device_id_uq_idx" ON "subscriptions" ("user_id","device_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_device_id_idx" ON "subscriptions" ("device_id");--> statement-breakpoint
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions" ("plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_gateway_id_uq_idx" ON "transactions" ("gateway_id");--> statement-breakpoint
CREATE INDEX "transactions_code_idx" ON "transactions" ("code");--> statement-breakpoint
CREATE INDEX "transactions_account_number_transaction_date_idx" ON "transactions" ("account_number","transaction_date");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_device_id_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL;