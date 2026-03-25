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
  terms: text("terms").default("Betaling binnen 30 dagen na factuurdatum."),
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

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  contacts: many(customerContacts),
  quotes: many(quotes),
  invoices: many(invoices),
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
