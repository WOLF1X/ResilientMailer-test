import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { EmailService } from "./services/EmailService";
import { insertEmailSchema } from "@shared/schema";
import { z } from "zod";

// Initialize email service
const emailService = new EmailService(storage);

export async function registerRoutes(app: Express): Promise<Server> {
  // Send email endpoint
  app.post("/api/emails/send", async (req, res) => {
    try {
      const emailData = insertEmailSchema.parse(req.body);
      const idempotencyKey = req.headers['idempotency-key'] as string;
      
      const result = await emailService.sendEmail(emailData, idempotencyKey);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: error instanceof Error ? error.message : "Internal server error" 
        });
      }
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await emailService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Get provider statuses
  app.get("/api/providers/status", async (req, res) => {
    try {
      const providers = await emailService.getProviderStatuses();
      res.json(providers);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Get circuit breaker status
  app.get("/api/circuit-breaker/status", async (req, res) => {
    try {
      const status = emailService.getCircuitBreakerStatus();
      res.json({ status });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Get recent emails
  app.get("/api/emails/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const emails = await emailService.getRecentEmails(limit);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Get recent logs
  app.get("/api/logs/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await emailService.getRecentLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Get email by ID
  app.get("/api/emails/:id", async (req, res) => {
    try {
      const email = await storage.getEmail(req.params.id);
      if (!email) {
        res.status(404).json({ message: "Email not found" });
        return;
      }
      res.json(email);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
