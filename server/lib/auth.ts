import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { AdminUser, PublicUser } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET or SESSION_SECRET environment variable is required for secure authentication");
}
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export interface AuthenticatedRequest extends Request {
  user?: AdminUser | PublicUser;
}

export function signToken(payload: AdminUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser;
    if (decoded.role === "admin") {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.ri_admin;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid authentication" });
  }
}

export function getUser(req: AuthenticatedRequest): AdminUser | PublicUser {
  try {
    const token = req.cookies?.ri_admin;
    if (!token) {
      return { role: "public" };
    }

    const user = verifyToken(token);
    return user || { role: "public" };
  } catch {
    return { role: "public" };
  }
}

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
