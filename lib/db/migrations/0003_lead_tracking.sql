ALTER TABLE "customers" ADD COLUMN "contact_role" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "sector" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "ai_opportunity" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "lead_status" text DEFAULT 'prospect';
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "lead_source" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "company_size" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "budget_indicator" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "timing" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "competitor_check" text;
