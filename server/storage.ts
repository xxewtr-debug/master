import { firestore } from "./firebaseAdmin";
import type { Product, InsertProduct, Message, InsertMessage, AdminCode, InsertAdminCode } from "@shared/schema";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | null>;
  deleteProduct(id: string): Promise<void>;
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getAdminCodes(): Promise<AdminCode[]>;
  createAdminCode(adminCode: InsertAdminCode): Promise<AdminCode>;
  deleteAdminCode(id: string): Promise<void>;
  validateAdminCode(code: string): Promise<AdminCode | null>;
}

export class FirestoreStorage implements IStorage {
  private productsCol = firestore.collection("products");
  private messagesCol = firestore.collection("messages");
  private adminCodesCol = firestore.collection("adminCodes");

  async getProducts(): Promise<Product[]> {
    const snapshot = await this.productsCol.get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
  }

  async getProduct(id: string): Promise<Product | null> {
    const doc = await this.productsCol.doc(id).get();
    if (!doc.exists) return null;
    return { ...doc.data(), id: doc.id } as Product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const docRef = await this.productsCol.add(insertProduct);
    const doc = await docRef.get();
    return { ...doc.data(), id: doc.id } as Product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | null> {
    const docRef = this.productsCol.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.update(updateData);
    const updated = await docRef.get();
    return { ...updated.data(), id: updated.id } as Product;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.productsCol.doc(id).delete();
  }

  async getMessages(): Promise<Message[]> {
    const snapshot = await this.messagesCol.get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Message));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const docRef = await this.messagesCol.add(insertMessage);
    const doc = await docRef.get();
    return { ...doc.data(), id: doc.id } as Message;
  }

  async getAdminCodes(): Promise<AdminCode[]> {
    const snapshot = await this.adminCodesCol.get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AdminCode));
  }

  async createAdminCode(insertAdminCode: InsertAdminCode): Promise<AdminCode> {
    const docRef = await this.adminCodesCol.add({
      ...insertAdminCode,
      createdAt: new Date().toISOString(),
    });
    const doc = await docRef.get();
    return { ...doc.data(), id: doc.id } as AdminCode;
  }

  async deleteAdminCode(id: string): Promise<void> {
    await this.adminCodesCol.doc(id).delete();
  }

  async validateAdminCode(code: string): Promise<AdminCode | null> {
    const snapshot = await this.adminCodesCol.where("code", "==", code).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as AdminCode;
  }
}

export const storage = new FirestoreStorage();
