ALTER TABLE "products" RENAME COLUMN "in_store" TO "in_store_sps";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "in_store_pro" boolean DEFAULT false NOT NULL;