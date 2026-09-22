CREATE TABLE "ingestion_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"provider_name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ingestion_channels_channel_id_unique" UNIQUE("channel_id")
);
--> statement-breakpoint
CREATE TABLE "ingestion_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"status" text NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"error_message" text,
	"payload_hash" text,
	"retry_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_event_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"source_name" text NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"occurred_at" timestamp,
	"level" text,
	"message" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"raw_payload" jsonb,
	"request_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ingestion_deliveries" ADD CONSTRAINT "ingestion_deliveries_channel_id_ingestion_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."ingestion_channels"("channel_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_events" ADD CONSTRAINT "log_events_channel_id_ingestion_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."ingestion_channels"("channel_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_channels_channel_id" ON "ingestion_channels" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "idx_channels_provider" ON "ingestion_channels" USING btree ("provider_name");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_deliveries_dedup" ON "ingestion_deliveries" USING btree ("delivery_id","channel_id");--> statement-breakpoint
CREATE INDEX "idx_deliveries_status" ON "ingestion_deliveries" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_logs_external_dedup" ON "log_events" USING btree ("external_event_id","channel_id");--> statement-breakpoint
CREATE INDEX "idx_logs_channel" ON "log_events" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "idx_logs_received_time" ON "log_events" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "idx_logs_source" ON "log_events" USING btree ("source_name");--> statement-breakpoint
CREATE INDEX "idx_logs_level" ON "log_events" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_logs_request_id" ON "log_events" USING btree ("request_id");