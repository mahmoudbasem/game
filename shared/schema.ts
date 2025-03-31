import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (Admin users and regular users)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Using text for UUIDs
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = z.object({
  username: z.string().min(5, "اسم المستخدم يجب أن يكون 5 أحرف على الأقل"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح").optional(),
  phone: z.string().optional(),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  isAdmin: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  verificationToken: z.string().optional(),
});

// Games
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
});

export const insertGameSchema = createInsertSchema(games).pick({
  name: true,
  imageUrl: true,
  description: true,
});

// Price Options
export const priceOptions = pgTable("price_options", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  currency: text("currency").notNull(),
  amount: integer("amount").notNull(),
  price: integer("price").notNull(),
  description: text("description"),
});

export const insertPriceOptionSchema = createInsertSchema(priceOptions).pick({
  gameId: true,
  currency: true,
  amount: true,
  price: true,
  description: true,
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),  // User ID is now a UUID (text)
  orderNumber: text("order_number").notNull().unique(),
  gameId: integer("game_id").notNull(),
  gameName: text("game_name").notNull(),  // Added gameName for easier access
  priceOptionId: integer("price_option_id").notNull(),
  gameAccountId: text("game_account_id").notNull(),
  serverName: text("server_name"),
  customerPhone: text("customer_phone").notNull(),
  notes: text("notes"),
  amount: integer("amount").notNull(),
  price: integer("price").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").default("pending").notNull(),
  orderStatus: text("order_status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, orderNumber: true, orderStatus: true, 
         paymentStatus: true, createdAt: true, completedAt: true });

export const orderStatusUpdateSchema = z.object({
  id: z.number(), // Orders still use numeric IDs
  orderStatus: z.enum(["pending", "processing", "completed", "cancelled"]),
  paymentStatus: z.enum(["pending", "paid", "failed"]),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  delivered: boolean("delivered").default(false).notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, sentAt: true, delivered: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type PriceOption = typeof priceOptions.$inferSelect;
export type InsertPriceOption = z.infer<typeof insertPriceOptionSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
