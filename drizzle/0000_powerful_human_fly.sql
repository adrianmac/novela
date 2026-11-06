CREATE TYPE "public"."alteration_status" AS ENUM('measurement_needed', 'in_progress', 'fitting_scheduled', 'complete', 'pending', 'on_hold', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('upcoming', 'confirmed', 'completed', 'cancelled', 'no_show', 'reschedule_requested');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('lead', 'booked', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('available', 'reserved', 'rented', 'cleaning', 'overdue', 'retired', 'sold');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'overdue', 'waived');--> statement-breakpoint
CREATE TYPE "public"."rental_status" AS ENUM('reserved', 'picked_up', 'returned', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TABLE "alteration_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"task_name" text NOT NULL,
	"description" text,
	"estimated_price" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alteration_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"inventory_item_id" uuid,
	"garment_description" text NOT NULL,
	"status" text DEFAULT 'measurement_needed' NOT NULL,
	"seamstress_id" text,
	"seamstress_name" text,
	"measurements_json" jsonb,
	"notes" text,
	"total_estimated_price" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"type" text NOT NULL,
	"date" timestamp NOT NULL,
	"staff_id" text,
	"staff_name" text,
	"notes" text,
	"status" text NOT NULL,
	"reminder_24h_sent" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"secondary_contact_name" text,
	"secondary_contact_phone" text,
	"hear_about_us" text,
	"referred_by" text,
	"last_activity_date" timestamp DEFAULT now() NOT NULL,
	"win_back_sent_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"service_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"type" text NOT NULL,
	"date" date NOT NULL,
	"status" text NOT NULL,
	"guest_count" integer,
	"venue_name" text,
	"venue_city" text,
	"budget_range" text,
	"total_value" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"size" text,
	"category" text NOT NULL,
	"rental_price" integer NOT NULL,
	"deposit_amount" integer NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"image_url" text,
	"notes" text,
	"last_cleaned_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "inventory_rentals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"status" text NOT NULL,
	"pickup_date" date NOT NULL,
	"return_date" date NOT NULL,
	"condition_on_return" text,
	"damage_notes" text,
	"returned_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_name" text NOT NULL,
	"status" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"milestone" text NOT NULL,
	"amount" integer NOT NULL,
	"due_date" date NOT NULL,
	"status" text NOT NULL,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"event_id" uuid,
	"score" integer NOT NULL,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"capacity_hours" integer DEFAULT 40 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"due_date" date
);
--> statement-breakpoint
ALTER TABLE "alteration_items" ADD CONSTRAINT "alteration_items_job_id_alteration_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."alteration_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alteration_jobs" ADD CONSTRAINT "alteration_jobs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alteration_jobs" ADD CONSTRAINT "alteration_jobs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alteration_jobs" ADD CONSTRAINT "alteration_jobs_inventory_item_id_inventory_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_services" ADD CONSTRAINT "event_services_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_rentals" ADD CONSTRAINT "inventory_rentals_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_rentals" ADD CONSTRAINT "inventory_rentals_item_id_inventory_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alteration_items_job_id_idx" ON "alteration_items" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "alteration_jobs_event_id_idx" ON "alteration_jobs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "alteration_jobs_client_id_idx" ON "alteration_jobs" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "appointments_event_id_idx" ON "appointments" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "appointments_client_id_idx" ON "appointments" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "appointments_staff_id_idx" ON "appointments" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "appointments_date_idx" ON "appointments" USING btree ("date");--> statement-breakpoint
CREATE INDEX "appointments_status_idx" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "clients_phone_idx" ON "clients" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "clients_last_activity_idx" ON "clients" USING btree ("last_activity_date");--> statement-breakpoint
CREATE INDEX "event_services_event_id_idx" ON "event_services" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "events_client_id_idx" ON "events" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_date_idx" ON "events" USING btree ("date");--> statement-breakpoint
CREATE INDEX "inventory_rentals_event_id_idx" ON "inventory_rentals" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "inventory_rentals_item_id_idx" ON "inventory_rentals" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "inventory_rentals_status_idx" ON "inventory_rentals" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_rentals_event_item_uniq" ON "inventory_rentals" USING btree ("event_id","item_id");--> statement-breakpoint
CREATE INDEX "job_logs_job_name_idx" ON "job_logs" USING btree ("job_name");--> statement-breakpoint
CREATE INDEX "job_logs_created_at_idx" ON "job_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notes_event_id_idx" ON "notes" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "payments_event_id_idx" ON "payments" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "payments_client_id_idx" ON "payments" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_due_date_idx" ON "payments" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "reviews_client_id_idx" ON "reviews" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "reviews_event_id_idx" ON "reviews" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "tasks_event_id_idx" ON "tasks" USING btree ("event_id");