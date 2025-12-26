const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    // Check email
    if (email !== ADMIN_EMAIL) {
      console.log("Email mismatch");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check password
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValid) {
      console.log("Password mismatch");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate token with 24 hour expiration
    const token = jwt.sign(
      { 
        email: ADMIN_EMAIL, 
        role: "admin",
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    console.log("Login successful");

    res.json({
      success: true,
      token,
      message: "Login successful"
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

/**
 * POST /auth/verify - Verify if token is valid
 */
router.post("/verify", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("Token verified for:", decoded.email);

    res.json({
      success: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    });

  } catch (err) {
    console.log("Token verification failed:", err.message);
    
    res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError" 
        ? "Token expired" 
        : "Invalid token"
    });
  }
});

/**
 * GET /auth/status - Check current auth status
 */
router.get("/status", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        success: true,
        authenticated: false
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      authenticated: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    });

  } catch (err) {
    res.json({
      success: true,
      authenticated: false,
      reason: err.message
    });
  }
});

module.exports = router;