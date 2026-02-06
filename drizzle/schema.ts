import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Customer accounts table for tracking customer profiles and contact information.
 * Links customers to their quote requests and account activity.
 */
export const customerAccounts = mysqlTable("customerAccounts", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to the authenticated user */
  userId: int("userId").notNull(),
  /** Customer company name */
  companyName: varchar("companyName", { length: 255 }).notNull(),
  /** Primary contact name */
  contactName: varchar("contactName", { length: 255 }).notNull(),
  /** Customer email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Customer phone number */
  phone: varchar("phone", { length: 20 }).notNull(),
  /** Customer address */
  address: text("address"),
  /** Customer country */
  country: varchar("country", { length: 100 }),
  /** Account status (active, inactive, suspended) */
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  /** Timestamp when the account was created */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Timestamp when the account was last updated */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerAccount = typeof customerAccounts.$inferSelect;
export type InsertCustomerAccount = typeof customerAccounts.$inferInsert;

/**
 * Quote requests table for tracking customer quote inquiries.
 * Stores commodity type, quantity, delivery timeline, and contact information.
 */
export const quoteRequests = mysqlTable("quoteRequests", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to customer account (optional for unauthenticated submissions) */
  customerId: int("customerId"),
  /** Customer name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Customer email for follow-up */
  email: varchar("email", { length: 320 }).notNull(),
  /** Customer phone number */
  phone: varchar("phone", { length: 20 }).notNull(),
  /** Company name */
  company: varchar("company", { length: 255 }),
  /** Type of commodity (Rice, Sugar, Coal, Oil, Poultry, etc.) */
  commodityType: varchar("commodityType", { length: 100 }).notNull(),
  /** Quantity requested */
  quantity: varchar("quantity", { length: 100 }).notNull(),
  /** Unit of measurement (tons, barrels, etc.) */
  unit: varchar("unit", { length: 50 }).notNull(),
  /** Desired delivery timeline */
  deliveryTimeline: varchar("deliveryTimeline", { length: 100 }).notNull(),
  /** Additional notes or special requirements */
  notes: text("notes"),
  /** Quoted price (optional, set by admin) */
  quotedPrice: varchar("quotedPrice", { length: 100 }),
  /** Currency of the quote */
  currency: varchar("currency", { length: 10 }),
  /** Admin notes about the quote */
  adminNotes: text("adminNotes"),
  /** Status of the quote request (new, contacted, quoted, closed) */
  status: mysqlEnum("status", ["new", "contacted", "quoted", "closed"]).default("new").notNull(),
  /** Timestamp when the quote was created */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Timestamp when the quote was last updated */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = typeof quoteRequests.$inferInsert;
