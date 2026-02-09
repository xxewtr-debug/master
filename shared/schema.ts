import { z } from "zod";

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  price: z.number(),
  rating: z.number().default(5),
  image: z.string(),
  images: z.array(z.string()).nullable().optional(),
  description: z.string(),
  isNew: z.boolean().default(false),
  inStock: z.boolean().default(true),
  sizes: z.array(z.number()).nullable().optional(),
});

export const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  isSystem: z.boolean().default(false),
});

export const adminCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  label: z.string(),
  isMaster: z.boolean().default(false),
  createdAt: z.any().optional(),
});

export const insertProductSchema = productSchema.omit({ id: true });
export const insertMessageSchema = messageSchema.omit({ id: true });
export const insertAdminCodeSchema = adminCodeSchema.omit({ id: true, createdAt: true });

export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type AdminCode = z.infer<typeof adminCodeSchema>;
export type InsertAdminCode = z.infer<typeof insertAdminCodeSchema>;
