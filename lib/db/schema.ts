import { pgTable, serial, text, timestamp, decimal, integer, boolean, date } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const companyProfile = pgTable("company_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
  country: text("country").default("Nederland"),
  kvk: text("kvk"),
  btw: text("btw"),
  iban: text("iban"),
  email: text("email"),
  phone: text("phone"),
  website: text("website").default("ai-group.nl"),
  logoUrl: text("logo_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
  country: text("country").default("Nederland"),
  kvk: text("kvk"),
  btw: text("btw"),
  notes: text("notes"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const customerContacts = pgTable("customer_contacts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  subject: text("subject").notNull(),
  content: text("content"),
  contactDate: timestamp("contact_date").defaultNow(),
  followUpDate: timestamp("follow_up_date"),
  followUpDone: boolean("follow_up_done").default(false),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteNumber: text("quote_number").unique().notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  title: text("title").notNull(),
  status: text("status").default("draft"),
  validUntil: date("valid_until"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  btwPercentage: decimal("btw_percentage", { precision: 5, scale: 2 }).default("21"),
  btwAmount: decimal("btw_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  terms: text("terms"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const quoteLines = pgTable("quote_lines", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").references(() => quotes.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unit: text("unit").default("stuks"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).default("0"),
  btwPercentage: decimal("btw_percentage", { precision: 5, scale: 2 }).default("21"),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).default("0"),
  sortOrder: integer("sort_order").default(0),
})

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").unique().notNull(),
  quoteId: integer("quote_id").references(() => quotes.id),
  customerId: integer("customer_id").references(() => customers.id),
  title: text("title").notNull(),
  status: text("status").default("draft"),
  invoiceDate: date("invoice_date").defaultNow(),
  dueDate: date("due_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  btwPercentage: decimal("btw_percentage", { precision: 5, scale: 2 }).default("21"),
  btwAmount: decimal("btw_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  terms: text("terms").default("Betaling binnen 14 dagen na factuurdatum."),
  pdfUrl: text("pdf_url"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const invoiceLines = pgTable("invoice_lines", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unit: text("unit").default("stuks"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).default("0"),
  btwPercentage: decimal("btw_percentage", { precision: 5, scale: 2 }).default("21"),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).default("0"),
  sortOrder: integer("sort_order").default(0),
})

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default("0"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectNumber: text("project_number").unique().notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("concept"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  budgetHours: decimal("budget_hours", { precision: 10, scale: 2 }).default("0"),
  budgetCosts: decimal("budget_costs", { precision: 10, scale: 2 }).default("0"),
  budgetRevenue: decimal("budget_revenue", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const projectEmployees = pgTable("project_employees", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id").references(() => employees.id, { onDelete: "cascade" }),
  role: text("role"),
  budgetHours: decimal("budget_hours", { precision: 10, scale: 2 }).default("0"),
  addedAt: timestamp("added_at").defaultNow(),
})

export const projectHours = pgTable("project_hours", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id").references(() => employees.id),
  date: date("date").notNull(),
  hours: decimal("hours", { precision: 6, scale: 2 }).notNull(),
  description: text("description"),
  invoiced: boolean("invoiced").default(false),
  createdAt: timestamp("created_at").defaultNow(),
})

export const projectCosts = pgTable("project_costs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category"),
  date: date("date").notNull(),
  invoiced: boolean("invoiced").default(false),
  createdAt: timestamp("created_at").defaultNow(),
})

export const projectRevenue = pgTable("project_revenue", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  type: text("type").default("actual"),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  createdAt: timestamp("created_at").defaultNow(),
})

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  contacts: many(customerContacts),
  quotes: many(quotes),
  invoices: many(invoices),
  projects: many(projects),
}))

export const customerContactsRelations = relations(customerContacts, ({ one }) => ({
  customer: one(customers, {
    fields: [customerContacts.customerId],
    references: [customers.id],
  }),
}))

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  customer: one(customers, {
    fields: [quotes.customerId],
    references: [customers.id],
  }),
  lines: many(quoteLines),
  invoices: many(invoices),
}))

export const quoteLinesRelations = relations(quoteLines, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteLines.quoteId],
    references: [quotes.id],
  }),
}))

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  quote: one(quotes, {
    fields: [invoices.quoteId],
    references: [quotes.id],
  }),
  lines: many(invoiceLines),
}))

export const invoiceLinesRelations = relations(invoiceLines, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLines.invoiceId],
    references: [invoices.id],
  }),
}))

export const employeesRelations = relations(employees, ({ many }) => ({
  projectEmployees: many(projectEmployees),
  hours: many(projectHours),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  customer: one(customers, {
    fields: [projects.customerId],
    references: [customers.id],
  }),
  projectEmployees: many(projectEmployees),
  hours: many(projectHours),
  costs: many(projectCosts),
  revenue: many(projectRevenue),
}))

export const projectEmployeesRelations = relations(projectEmployees, ({ one }) => ({
  project: one(projects, {
    fields: [projectEmployees.projectId],
    references: [projects.id],
  }),
  employee: one(employees, {
    fields: [projectEmployees.employeeId],
    references: [employees.id],
  }),
}))

export const projectHoursRelations = relations(projectHours, ({ one }) => ({
  project: one(projects, {
    fields: [projectHours.projectId],
    references: [projects.id],
  }),
  employee: one(employees, {
    fields: [projectHours.employeeId],
    references: [employees.id],
  }),
}))

export const projectCostsRelations = relations(projectCosts, ({ one }) => ({
  project: one(projects, {
    fields: [projectCosts.projectId],
    references: [projects.id],
  }),
}))

export const projectRevenueRelations = relations(projectRevenue, ({ one }) => ({
  project: one(projects, {
    fields: [projectRevenue.projectId],
    references: [projects.id],
  }),
  invoice: one(invoices, {
    fields: [projectRevenue.invoiceId],
    references: [invoices.id],
  }),
}))

export type CompanyProfile = typeof companyProfile.$inferSelect
export type NewCompanyProfile = typeof companyProfile.$inferInsert
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
export type CustomerContact = typeof customerContacts.$inferSelect
export type NewCustomerContact = typeof customerContacts.$inferInsert
export type Quote = typeof quotes.$inferSelect
export type NewQuote = typeof quotes.$inferInsert
export type QuoteLine = typeof quoteLines.$inferSelect
export type NewQuoteLine = typeof quoteLines.$inferInsert
export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
export type InvoiceLine = typeof invoiceLines.$inferSelect
export type NewInvoiceLine = typeof invoiceLines.$inferInsert
export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type ProjectEmployee = typeof projectEmployees.$inferSelect
export type NewProjectEmployee = typeof projectEmployees.$inferInsert
export type ProjectHour = typeof projectHours.$inferSelect
export type NewProjectHour = typeof projectHours.$inferInsert
export type ProjectCost = typeof projectCosts.$inferSelect
export type NewProjectCost = typeof projectCosts.$inferInsert
export type ProjectRevenue = typeof projectRevenue.$inferSelect
export type NewProjectRevenue = typeof projectRevenue.$inferInsert

// ─── Exploitatie (terugkerende posten) ────────────────────────────────────────

export const recurringItems = pgTable("recurring_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'cost' | 'revenue'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(), // 'monthly' | 'quarterly' | 'yearly'
  category: text("category"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  active: boolean("active").default(true),
  nextBookingDate: date("next_booking_date").notNull(),
  lastBookedAt: timestamp("last_booked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const recurringItemProjects = pgTable("recurring_item_projects", {
  id: serial("id").primaryKey(),
  recurringItemId: integer("recurring_item_id").references(() => recurringItems.id, { onDelete: "cascade" }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
})

export const recurringBookings = pgTable("recurring_bookings", {
  id: serial("id").primaryKey(),
  recurringItemId: integer("recurring_item_id").references(() => recurringItems.id, { onDelete: "cascade" }),
  periodDate: date("period_date").notNull(),
  bookedAt: timestamp("booked_at").defaultNow(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  perProjectAmount: decimal("per_project_amount", { precision: 10, scale: 2 }).notNull(),
  projectCount: integer("project_count").notNull(),
})

export const recurringItemsRelations = relations(recurringItems, ({ many }) => ({
  projects: many(recurringItemProjects),
  bookings: many(recurringBookings),
}))

export const recurringItemProjectsRelations = relations(recurringItemProjects, ({ one }) => ({
  recurringItem: one(recurringItems, {
    fields: [recurringItemProjects.recurringItemId],
    references: [recurringItems.id],
  }),
  project: one(projects, {
    fields: [recurringItemProjects.projectId],
    references: [projects.id],
  }),
}))

export const recurringBookingsRelations = relations(recurringBookings, ({ one }) => ({
  recurringItem: one(recurringItems, {
    fields: [recurringBookings.recurringItemId],
    references: [recurringItems.id],
  }),
}))

export type RecurringItem = typeof recurringItems.$inferSelect
export type NewRecurringItem = typeof recurringItems.$inferInsert
export type RecurringItemProject = typeof recurringItemProjects.$inferSelect
export type RecurringBooking = typeof recurringBookings.$inferSelect
