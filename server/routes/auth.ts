import type { Express } from "express";
import { storage } from "../storage";
import { loginSchema, registerSchema, firebaseAuthSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword, verifyPassword, createUserSession, verifySession, deleteSession } from "../utils/auth";

export function registerAuthRoutes(app: Express) {
  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ 
          message: "Username already taken" 
        });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ 
          message: "Email already registered" 
        });
      }

      // Check if vehicle number already exists
      const existingVehicle = await storage.getUserByVehicleNumber(userData.vehicleNumber);
      if (existingVehicle) {
        return res.status(400).json({ 
          message: "Vehicle number already registered" 
        });
      }
      
      // Hash password
      const passwordHash = hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        passwordHash,
        authProvider: "local",
        emailVerified: false,
      });

      // Create session
      const { sessionToken, expiresAt } = await createUserSession(user.id);
      
      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });
      
      res.json({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          vehicleNumber: user.vehicleNumber,
          authProvider: user.authProvider,
          emailVerified: user.emailVerified,
        },
        sessionToken,
        expiresAt 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(credentials.username);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ 
          message: "Invalid username or password" 
        });
      }
      
      // Verify password
      if (!verifyPassword(credentials.password, user.passwordHash)) {
        return res.status(401).json({ 
          message: "Invalid username or password" 
        });
      }
      
      // Create session
      const { sessionToken, expiresAt } = await createUserSession(user.id);
      
      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });
      
      res.json({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          vehicleNumber: user.vehicleNumber,
          authProvider: user.authProvider,
          emailVerified: user.emailVerified,
        },
        sessionToken,
        expiresAt 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Firebase authentication
  app.post("/api/auth/firebase-login", async (req, res) => {
    try {
      const { firebaseUid, email, name, vehicleNumber, phone, idToken } = req.body;
      
      // In production, verify the Firebase ID token here
      // For now, we'll trust the client-side Firebase auth
      
      // Check if user already exists
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        // Check if vehicle number already exists
        const existingVehicle = await storage.getUserByVehicleNumber(vehicleNumber);
        if (existingVehicle) {
          return res.status(400).json({ 
            message: "Vehicle number already registered" 
          });
        }

        // Create new user
        user = await storage.createUser({
          name: name || email?.split('@')[0] || 'Firebase User',
          email,
          phone: phone || '',
          vehicleNumber,
          firebaseUid,
          authProvider: "firebase",
          emailVerified: true,
        });
      } else {
        // Update vehicle number if provided
        if (vehicleNumber && vehicleNumber !== user.vehicleNumber) {
          const existingVehicle = await storage.getUserByVehicleNumber(vehicleNumber);
          if (existingVehicle && existingVehicle.id !== user.id) {
            return res.status(400).json({ 
              message: "Vehicle number already registered" 
            });
          }
          user = await storage.updateUser(user.id, { 
            vehicleNumber,
            phone: phone || user.phone 
          });
        }
      }
      
      // Create session
      const { sessionToken, expiresAt } = await createUserSession(user.id);
      
      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });
      
      res.json({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          vehicleNumber: user.vehicleNumber,
          authProvider: user.authProvider,
          emailVerified: user.emailVerified,
        },
        sessionToken,
        expiresAt 
      });
    } catch (error) {
      console.error('Firebase login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify session
  app.post("/api/auth/verify-session", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No valid session token" });
      }
      
      const sessionToken = authHeader.split(' ')[1];
      const user = await verifySession(sessionToken);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }
      
      res.json({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          vehicleNumber: user.vehicleNumber,
          authProvider: user.authProvider,
          emailVerified: user.emailVerified,
        }
      });
    } catch (error) {
      console.error('Session verification error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const sessionToken = authHeader.split(' ')[1];
        await deleteSession(sessionToken);
      }
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}