CREATE TYPE "public"."device_statuses" AS ENUM('LINKED', 'UNLINKED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."subscription_statuses" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."tracking_statuses" AS ENUM('PENDING', 'TAKEN', 'MISSED', 'SKIPPED');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('ADMIN', 'USER');--> statement-breakpoint
CREATE TABLE "accounts" (
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"password" varchar(255),
	"user_id" varchar(24) NOT NULL,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "compartments" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"medicine" varchar(255) NOT NULL,
	"capacity" integer DEFAULT 0 NOT NULL,
	"max_capacity" integer DEFAULT 0 NOT NULL,
	"position" varchar(4) NOT NULL,
	"last_refill_at" timestamp,
	"box_id" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"factory_model" varchar(255) NOT NULL,
	"status" "device_statuses" DEFAULT 'UNLINKED' NOT NULL,
	"name" varchar(255),
	"position" varchar(255),
	"activated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"user_id" varchar(24)
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"paid" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"subscription_id" varchar(24)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"date_of_birth" timestamp,
	"gender" varchar(10),
	"medical_history" text,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"user_id" varchar(24) NOT NULL,
	"device_id" varchar(24)
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp NOT NULL,
	"days_of_week" varchar(7) NOT NULL,
	"time_of_day" varchar(5) NOT NULL,
	"dosage" integer DEFAULT 1 NOT NULL,
	"patient_id" varchar(24) NOT NULL,
	"compartment_id" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"token" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"plan" varchar(255) NOT NULL,
	"status" "subscription_statuses" DEFAULT 'ACTIVE' NOT NULL,
	"started_at" timestamp NOT NULL,
	"next_billing_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"user_id" varchar(24) NOT NULL,
	"device_id" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trackings" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"status" "tracking_statuses" DEFAULT 'PENDING' NOT NULL,
	"taken_at" timestamp,
	"schedule_id" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" integer PRIMARY KEY NOT NULL,
	"gateway" varchar(100) NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"account_number" varchar(20) NOT NULL,
	"code" varchar(20),
	"content" text,
	"transfer_type" varchar(4) NOT NULL,
	"description" text,
	"transfer_amount" numeric(10, 2) NOT NULL,
	"reference_code" varchar(20),
	"invoice_id" varchar(24)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp,
	"username" varchar(20) NOT NULL,
	"role" "user_roles" DEFAULT 'USER' NOT NULL,
	"image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compartments" ADD CONSTRAINT "compartments_box_id_devices_id_fk" FOREIGN KEY ("box_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_compartment_id_compartments_id_fk" FOREIGN KEY ("compartment_id") REFERENCES "public"."compartments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trackings" ADD CONSTRAINT "trackings_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "compartments_box_id_position_uq_idx" ON "compartments" USING btree ("box_id","position");--> statement-breakpoint
CREATE INDEX "devices_user_id_idx" ON "devices" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_code_uq_idx" ON "invoices" USING btree ("code");--> statement-breakpoint
CREATE INDEX "invoices_subscription_id_idx" ON "invoices" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "patients_user_id_idx" ON "patients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "patients_device_id_idx" ON "patients" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "schedules_patient_id_idx" ON "schedules" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "schedules_duration_idx" ON "schedules" USING btree ("started_at","ended_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_uq_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "subscriptions_next_billing_date_idx" ON "subscriptions" USING btree ("next_billing_date");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_device_id_idx" ON "subscriptions" USING btree ("user_id","device_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trackings_schedule_id_date_uq_idx" ON "trackings" USING btree ("schedule_id","date");--> statement-breakpoint
CREATE INDEX "trackings_date_idx" ON "trackings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "transactions_invoice_id_idx" ON "transactions" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_uq_idx" ON "users" USING btree ("username");
