import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRewardSchema } from "@shared/schema";
import { z } from "zod";
import { generateImageHash, generateDeviceFingerprint, extractImageMetadata, validateLocationAccuracy } from "./utils/crypto";
import { publicBlockchain } from "./blockchain/publicChain";
import { registerAuthRoutes } from "./routes/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  registerAuthRoutes(app);

  // User registration (legacy route - for backward compatibility)
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if vehicle number already exists
      const existingUser = await storage.getUserByVehicleNumber(userData.vehicleNumber);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Vehicle number already registered" 
        });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Blockchain claim validation endpoint as per PRD
  app.post("/api/claim", async (req, res) => {
    try {
      const { rc_number, odometer, image, app_id } = req.body;
      
      if (!rc_number || !odometer || !app_id) {
        return res.status(400).json({ 
          message: "Missing required fields: rc_number, odometer, app_id" 
        });
      }

      // Hash RC number for privacy
      const crypto = require('crypto');
      const rc_hash = crypto.createHash('sha256').update(rc_number).digest('hex');
      
      // Check if this reading already exists in blockchain
      const existingClaim = await storage.getLatestBlockchainClaim(rc_hash);
      
      if (existingClaim && existingClaim.odometerReading >= odometer) {
        return res.status(400).json({
          message: "Invalid claim: Odometer reading must be higher than previous reading",
          lastReading: existingClaim.odometerReading
        });
      }

      // Calculate carbon credits
      const distance = existingClaim ? odometer - existingClaim.odometerReading : odometer;
      const carbon_credits = distance * 0.105; // PRD specification
      
      // Create blockchain entry
      const blockHash = crypto.createHash('sha256')
        .update(`${rc_hash}${odometer}${Date.now()}${app_id}`)
        .digest('hex');
      
      const signature = crypto.createHash('sha256')
        .update(`${app_id}${process.env.PRIVATE_KEY || 'demo-key'}`)
        .digest('hex');

      // Store in blockchain table
      await storage.createBlockchainEntry({
        rc_hash,
        odometer_reading: odometer,
        carbon_credits,
        app_id,
        block_hash: blockHash,
        signature,
        previous_block_hash: existingClaim?.block_hash || null
      });

      res.json({
        success: true,
        block_hash: blockHash,
        carbon_credits,
        distance,
        message: "Claim registered successfully on blockchain"
      });

    } catch (error) {
      console.error('Blockchain claim error:', error);
      res.status(500).json({ message: "Failed to process blockchain claim" });
    }
  });

  // Get latest block for RC hash (cross-app validation)
  app.get("/api/latestBlock/:rc_hash", async (req, res) => {
    try {
      const { rc_hash } = req.params;
      const latestBlock = await storage.getLatestBlockchainClaim(rc_hash);
      
      if (!latestBlock) {
        return res.status(404).json({ message: "No blocks found for this vehicle" });
      }

      res.json(latestBlock);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Simplified upload endpoint with Neon database photo storage
  app.post("/api/upload-odometer", async (req, res) => {
    try {
      const { vehicleNumber, odometerImageUrl, km, imageData, imageMimeType, location, ocrConfidence } = req.body;
      
      // Verify vehicle exists
      const user = await storage.getUserByVehicleNumber(vehicleNumber);
      if (!user) {
        return res.status(404).json({ 
          message: "Vehicle not found" 
        });
      }

      // Calculate rewards using PRD specification
      const calculatedCo2Saved = km * 0.105; // 0.105 kg CO2 per km as per PRD
      const calculatedRewardGiven = calculatedCo2Saved * 2; // 2 rupees per kg CO2
      const imageSize = imageData ? Math.round((imageData.length * 3) / 4) : null;

      // Create reward with photo stored in Neon database
      const reward = await storage.createReward({
        vehicleNumber,
        odometerImageUrl,
        imageData: imageData || null, // Store base64 image in Neon database
        imageMimeType: imageMimeType || null,
        imageSize,
        km,
        co2Saved: calculatedCo2Saved,
        rewardGiven: calculatedRewardGiven,
        txHash: `tx_${Date.now()}`,
        location: location || null,
        ocrConfidence: parseFloat(ocrConfidence || '0.8'),
        validationStatus: 'approved',
        blockHash: null,
        deviceFingerprint: null,
        imageHash: null,
        fraudScore: 0,
      });
      
      res.json({ 
        reward,
        message: `Photo saved to Neon database. Earned ₹${calculatedRewardGiven} for saving ${calculatedCo2Saved}kg CO₂!`
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to save photo and create reward" });
    }
  });

  // Get user wallet data
  app.get("/api/wallet/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      
      console.log('Getting wallet data for vehicle:', vehicleNumber);
      const user = await storage.getUserByVehicleNumber(vehicleNumber);
      console.log('User found:', user);
      
      if (!user) {
        return res.status(404).json({ 
          message: "Vehicle not found" 
        });
      }
      
      const totals = await storage.getTotalRewardsByVehicleNumber(vehicleNumber);
      
      res.json({
        user,
        ...totals,
      });
    } catch (error) {
      console.error('Wallet API error:', error);
      res.status(500).json({ message: "Internal server error", details: error.message });
    }
  });

  // Get reward history
  app.get("/api/reward-history/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      
      const rewards = await storage.getRewardsByVehicleNumber(vehicleNumber);
      res.json({ rewards });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user by vehicle number
  app.get("/api/user/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      
      const user = await storage.getUserByVehicleNumber(vehicleNumber);
      if (!user) {
        return res.status(404).json({ 
          message: "Vehicle not found" 
        });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin endpoint to check public blockchain network status
  app.get("/api/admin/blockchain-status", async (req, res) => {
    try {
      const networkStatus = publicBlockchain.getNetworkStatus();
      res.json({ networkStatus });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify a transaction on public blockchain
  app.get("/api/verify-transaction/:txHash", async (req, res) => {
    try {
      const { txHash } = req.params;
      const verification = await publicBlockchain.verifyTransaction(txHash);
      res.json(verification);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin endpoints for dashboard data
  app.get('/api/admin/users', async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()));
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/admin/stats', async (req, res) => {
    try {
      const users = await storage.getUsers();
      const rewards = await storage.getRewards();
      
      const stats = {
        totalUsers: users.length,
        totalRewards: rewards.reduce((sum, r) => sum + r.rewardGiven, 0),
        totalCO2Saved: rewards.reduce((sum, r) => sum + r.co2Saved, 0),
        totalDistanceCovered: rewards.reduce((sum, r) => sum + r.km, 0),
        totalReadings: rewards.length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to fetch stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/admin/recent-rewards', async (req, res) => {
    try {
      const rewards = await storage.getRewards();
      const recentRewards = rewards
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
      res.json(recentRewards);
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to fetch recent rewards',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
