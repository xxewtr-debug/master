
import { db } from "./db";
import { products, messages, adminCodes, type InsertProduct, type Product, type InsertMessage, type Message, type AdminCode, type InsertAdminCode } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | null>;
  deleteProduct(id: number): Promise<void>;
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getAdminCodes(): Promise<AdminCode[]>;
  createAdminCode(adminCode: InsertAdminCode): Promise<AdminCode>;
  deleteAdminCode(id: number): Promise<void>;
  validateAdminCode(code: string): Promise<AdminCode | null>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | null> {
    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return product || null;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getAdminCodes(): Promise<AdminCode[]> {
    return await db.select().from(adminCodes);
  }

  async createAdminCode(insertAdminCode: InsertAdminCode): Promise<AdminCode> {
    const [adminCode] = await db.insert(adminCodes).values(insertAdminCode).returning();
    return adminCode;
  }

  async deleteAdminCode(id: number): Promise<void> {
    await db.delete(adminCodes).where(eq(adminCodes.id, id));
  }

  async validateAdminCode(code: string): Promise<AdminCode | null> {
    const [adminCode] = await db.select().from(adminCodes).where(eq(adminCodes.code, code));
    return adminCode || null;
  }
}

export const storage = new DatabaseStorage();
