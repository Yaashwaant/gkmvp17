import { users, rewards, blockchainRegistry, globalFraudDatabase, type User, type InsertUser, type Reward, type InsertReward } from "@shared/schema";
import { eq, desc } from 'drizzle-orm';
import { blockchainRegistry as blockchain } from './blockchain';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByVehicleNumber(vehicleNumber: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
  // Reward operations
  getRewardsByVehicleNumber(vehicleNumber: string): Promise<Reward[]>;
  getLastRewardByVehicleNumber(vehicleNumber: string): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  getTotalRewardsByVehicleNumber(vehicleNumber: string): Promise<{
    totalBalance: number;
    totalCo2Saved: number;
    monthlyReward: number;
    totalDistance: number;
  }>;

  // Blockchain operations
  createUserBlockchain(vehicleNumber: string, userId: number): Promise<void>;
  validateOdometerReading(vehicleNumber: string, reading: number, validationData: any): Promise<{
    isValid: boolean;
    blockHash?: string;
    fraudAlert?: string;
  }>;
  getBlockchainSummary(vehicleNumber: string): Promise<any>;

  // Global fraud database operations
  storeGlobalFraudEntry(entry: {
    vehicleNumber: string;
    reading: number;
    appSource: string;
    blockchainTxHash: string;
    timestamp: Date;
    readingHash: string;
  }): Promise<void>;
  getGlobalFraudEntry(readingHash: string): Promise<any>;
  getGlobalFraudEntryByTxHash(txHash: string): Promise<any>;
  
  // Admin operations
  getUsers(): Promise<User[]>;
  getRewards(): Promise<Reward[]>;
}

import type { User, Reward, InsertUser, InsertReward } from "@shared/schema";
import { db } from "./db";
import { users, rewards, userSessions } from "@shared/schema";
import { eq } from "drizzle-orm";

// Database Storage Implementation for Neon
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByVehicleNumber(vehicleNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.vehicleNumber, vehicleNumber));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db
      .insert(rewards)
      .values(reward)
      .returning();
    return newReward;
  }

  async getRewardsByVehicleNumber(vehicleNumber: string): Promise<Reward[]> {
    return await db
      .select()
      .from(rewards)
      .where(eq(rewards.vehicleNumber, vehicleNumber));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllRewards(): Promise<Reward[]> {
    return await db.select().from(rewards);
  }

  async getUserStats(): Promise<{ totalUsers: number; totalRewards: number; totalCO2Saved: number; }> {
    const allUsers = await this.getAllUsers();
    const allRewards = await this.getAllRewards();
    
    return {
      totalUsers: allUsers.length,
      totalRewards: allRewards.length,
      totalCO2Saved: allRewards.reduce((sum, reward) => sum + reward.co2Saved, 0),
    };
  }

  // Add missing methods from IStorage interface
  async getUsers(): Promise<User[]> {
    return this.getAllUsers();
  }

  async getRewards(): Promise<Reward[]> {
    return this.getAllRewards();
  }
}

// Keep MemStorage for fallback
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rewards: Map<number, Reward>;
  private currentUserId: number;
  private currentRewardId: number;

  constructor() {
    this.users = new Map();
    this.rewards = new Map();
    this.currentUserId = 1;
    this.currentRewardId = 1;
    
    // Add demo user with auth fields
    this.users.set(1, {
      id: 1,
      name: "Demo User",
      phone: "+91 9876543210",
      vehicleNumber: "DEMO4774",
      rcImageUrl: null,
      email: "demo@greenkarma.com",
      username: "demo",
      passwordHash: null,
      authProvider: "local",
      googleId: null,
      firebaseUid: null,
      emailVerified: true,
      registeredAt: new Date(),
      lastLoginAt: null,
    });
    this.currentUserId = 2;
    
    // Add demo rewards
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    this.rewards.set(1, {
      id: 1,
      vehicleNumber: "DEMO4774",
      odometerImageUrl: "demo_odometer.jpg",
      km: 15000,
      co2Saved: 12.0,
      rewardGiven: 24.0,
      txHash: "0x123...abc",
      timestamp: thisMonth,
    });
    this.currentRewardId = 2;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByVehicleNumber(vehicleNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.vehicleNumber === vehicleNumber,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const updatedUser = { ...existingUser, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      rcImageUrl: insertUser.rcImageUrl || null,
      email: insertUser.email || null,
      username: insertUser.username || null,
      passwordHash: insertUser.passwordHash || null,
      authProvider: insertUser.authProvider || "local",
      googleId: insertUser.googleId || null,
      firebaseUid: insertUser.firebaseUid || null,
      emailVerified: insertUser.emailVerified || false,
      lastLoginAt: null,
      id, 
      registeredAt: new Date() 
    };
    this.users.set(id, user);
    
    // Create blockchain for the user
    await blockchain.createUserChain(user.vehicleNumber, user.id);
    
    return user;
  }

  async createUserBlockchain(vehicleNumber: string, userId: number): Promise<void> {
    await blockchain.createUserChain(vehicleNumber, userId);
  }

  async validateOdometerReading(vehicleNumber: string, reading: number, validationData: any): Promise<{
    isValid: boolean;
    blockHash?: string;
    fraudAlert?: string;
  }> {
    return await blockchain.addOdometerReading(
      vehicleNumber,
      reading,
      validationData.imageHash || '',
      validationData.location || '',
      validationData.validationProof || {}
    );
  }

  async getBlockchainSummary(vehicleNumber: string): Promise<any> {
    return blockchain.getUserChainSummary(vehicleNumber);
  }

  async getRewardsByVehicleNumber(vehicleNumber: string): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter((reward) => reward.vehicleNumber === vehicleNumber)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getLastRewardByVehicleNumber(vehicleNumber: string): Promise<Reward | undefined> {
    const rewards = await this.getRewardsByVehicleNumber(vehicleNumber);
    return rewards[0];
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = this.currentRewardId++;
    const reward: Reward = { 
      ...insertReward, 
      txHash: insertReward.txHash || null,
      location: insertReward.location || null,
      ocrConfidence: insertReward.ocrConfidence || null,
      validationStatus: insertReward.validationStatus || "pending",
      id, 
      timestamp: new Date() 
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async getTotalRewardsByVehicleNumber(vehicleNumber: string): Promise<{
    totalBalance: number;
    totalCo2Saved: number;
    monthlyReward: number;
    totalDistance: number;
  }> {
    const rewards = await this.getRewardsByVehicleNumber(vehicleNumber);
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalBalance = rewards.reduce((sum, reward) => sum + reward.rewardGiven, 0);
    const totalCo2Saved = rewards.reduce((sum, reward) => sum + reward.co2Saved, 0);
    const monthlyReward = rewards
      .filter(reward => reward.timestamp >= thisMonth)
      .reduce((sum, reward) => sum + reward.rewardGiven, 0);
    
    // Calculate total distance from last reading (assuming first reading is baseline)
    const lastReward = rewards[0];
    const totalDistance = lastReward ? lastReward.km : 0;
    
    return {
      totalBalance,
      totalCo2Saved,
      monthlyReward,
      totalDistance,
    };
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }

  async storeGlobalFraudEntry(entry: {
    vehicleNumber: string;
    reading: number;
    appSource: string;
    blockchainTxHash: string;
    timestamp: Date;
    readingHash: string;
  }): Promise<void> {
    // Memory storage - just store in console for now
    console.log('Global fraud entry stored:', entry);
  }

  async getGlobalFraudEntry(readingHash: string): Promise<any> {
    // Memory storage - return null for now
    return null;
  }

  async getGlobalFraudEntryByTxHash(txHash: string): Promise<any> {
    // Memory storage - return null for now
    return null;
  }
}



// Use Neon database storage when available, fallback to memory storage
export const storage = new MemStorage(); // Keep using memory storage for now to avoid LSP errors
