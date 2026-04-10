--> statement-breakpoint
CREATE UNIQUE INDEX "products_name_unique" ON "products" USING btree (lower(trim("name")));