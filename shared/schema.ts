
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  rating: integer("rating").default(5),
  image: text("image").notNull(),
  images: text("images").array(),
  description: text("description").notNull(),
  isNew: boolean("is_new").default(false),
  inStock: boolean("in_stock").default(true),
  sizes: integer("sizes").array(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  isSystem: boolean("is_system").default(false),
});

export const adminCodes = pgTable("admin_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  label: text("label").notNull(),
  isMaster: boolean("is_master").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export const insertAdminCodeSchema = createInsertSchema(adminCodes).omit({ id: true, createdAt: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type AdminCode = typeof adminCodes.$inferSelect;
export type InsertAdminCode = z.infer<typeof insertAdminCodeSchema>;
