import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  rcImageUrl: text("rc_image_url"),
  
  // Authentication fields
  email: text("email").unique(),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  authProvider: text("auth_provider").notNull().default("local"), // local, google, firebase
  googleId: text("google_id").unique(),
  firebaseUid: text("firebase_uid").unique(),
  emailVerified: boolean("email_verified").default(false),
  
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull(),
  odometerImageUrl: text("odometer_image_url").notNull(),
  // Store the actual image data as base64 in Neon database
  imageData: text("image_data"), // Base64 encoded image data
  imageMimeType: text("image_mime_type"), // image/jpeg, image/png, etc.
  imageSize: integer("image_size"), // Image size in bytes
  km: integer("km").notNull(),
  co2Saved: real("co2_saved").notNull(),
  rewardGiven: real("reward_given").notNull(),
  txHash: text("tx_hash"),
  location: text("location"), // JSON string for lat,lng,accuracy
  ocrConfidence: real("ocr_confidence"), 
  validationStatus: text("validation_status").notNull().default("pending"), // pending, approved, rejected
  blockHash: text("block_hash"), // Blockchain hash
  deviceFingerprint: text("device_fingerprint"), // Device fingerprint for fraud detection
  imageHash: text("image_hash"), // Hash of the image for integrity
  fraudScore: real("fraud_score").default(0), // Fraud detection score
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Blockchain registry table
export const blockchainRegistry = pgTable("blockchain_registry", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  userId: integer("user_id").notNull(),
  chainData: text("chain_data").notNull(), // JSON string of the blockchain
  fraudScore: real("fraud_score").default(0),
  isActive: boolean("is_active").default(true),
  lastValidReading: integer("last_valid_reading").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Global fraud database table
export const globalFraudDatabase = pgTable("global_fraud_database", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull(),
  odometerReading: integer("odometer_reading").notNull(),
  appSource: text("app_source").notNull(), // Which app reported this reading
  blockHash: text("block_hash").notNull(),
  appSignature: text("app_signature").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// User session table for managing auth sessions
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  registeredAt: true,
  lastLoginAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  timestamp: true,
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  vehicleNumber: z.string().min(4, "Vehicle number is required"),
  rcImageUrl: z.string().optional(),
});

export const firebaseAuthSchema = z.object({
  firebaseUid: z.string(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string().optional(),
  vehicleNumber: z.string().min(4, "Vehicle number is required"),
  rcImageUrl: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type FirebaseAuthRequest = z.infer<typeof firebaseAuthSchema>;
export type UserSession = typeof userSessions.$inferSelect;
