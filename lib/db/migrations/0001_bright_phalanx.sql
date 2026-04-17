CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"role" text,
	"hourly_rate" numeric(10, 2) DEFAULT '0',
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category" text,
	"date" date NOT NULL,
	"invoiced" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"employee_id" integer,
	"role" text,
	"budget_hours" numeric(10, 2) DEFAULT '0',
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"employee_id" integer,
	"date" date NOT NULL,
	"hours" numeric(6, 2) NOT NULL,
	"description" text,
	"invoiced" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_revenue" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"date" date NOT NULL,
	"type" text DEFAULT 'actual',
	"invoice_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_number" text NOT NULL,
	"customer_id" integer,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'concept',
	"start_date" date,
	"end_date" date,
	"budget_hours" numeric(10, 2) DEFAULT '0',
	"budget_costs" numeric(10, 2) DEFAULT '0',
	"budget_revenue" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "projects_project_number_unique" UNIQUE("project_number")
);
--> statement-breakpoint
ALTER TABLE "project_costs" ADD CONSTRAINT "project_costs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_employees" ADD CONSTRAINT "project_employees_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_employees" ADD CONSTRAINT "project_employees_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_hours" ADD CONSTRAINT "project_hours_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_hours" ADD CONSTRAINT "project_hours_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_revenue" ADD CONSTRAINT "project_revenue_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_revenue" ADD CONSTRAINT "project_revenue_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;