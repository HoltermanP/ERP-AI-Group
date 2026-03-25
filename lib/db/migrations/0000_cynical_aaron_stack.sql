CREATE TABLE "company_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"postal_code" text,
	"city" text,
	"country" text DEFAULT 'Nederland',
	"kvk" text,
	"btw" text,
	"iban" text,
	"email" text,
	"phone" text,
	"website" text DEFAULT 'ai-group.nl',
	"logo_url" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"type" text NOT NULL,
	"subject" text NOT NULL,
	"content" text,
	"contact_date" timestamp DEFAULT now(),
	"follow_up_date" timestamp,
	"follow_up_done" boolean DEFAULT false,
	"created_by" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"address" text,
	"postal_code" text,
	"city" text,
	"country" text DEFAULT 'Nederland',
	"kvk" text,
	"btw" text,
	"notes" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1',
	"unit" text DEFAULT 'stuks',
	"unit_price" numeric(10, 2) DEFAULT '0',
	"btw_percentage" numeric(5, 2) DEFAULT '21',
	"line_total" numeric(10, 2) DEFAULT '0',
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"quote_id" integer,
	"customer_id" integer,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft',
	"invoice_date" date DEFAULT now(),
	"due_date" date,
	"subtotal" numeric(10, 2) DEFAULT '0',
	"btw_percentage" numeric(5, 2) DEFAULT '21',
	"btw_amount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"terms" text DEFAULT 'Betaling binnen 30 dagen na factuurdatum.',
	"pdf_url" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "quote_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_id" integer,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1',
	"unit" text DEFAULT 'stuks',
	"unit_price" numeric(10, 2) DEFAULT '0',
	"btw_percentage" numeric(5, 2) DEFAULT '21',
	"line_total" numeric(10, 2) DEFAULT '0',
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_number" text NOT NULL,
	"customer_id" integer,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft',
	"valid_until" date,
	"subtotal" numeric(10, 2) DEFAULT '0',
	"btw_percentage" numeric(5, 2) DEFAULT '21',
	"btw_amount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"terms" text,
	"pdf_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "quotes_quote_number_unique" UNIQUE("quote_number")
);
--> statement-breakpoint
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_lines" ADD CONSTRAINT "quote_lines_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;