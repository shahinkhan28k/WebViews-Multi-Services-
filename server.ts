import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import * as admin from "firebase-admin";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import axios from "axios";
import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: "lucky-rookery-d3bk6"
  });
}

const db = getFirestore("ai-studio-multistreamhub-bf7c58ef-e9d9-4585-95ff-9c5a5a043548");
db.settings({ ignoreUndefinedProperties: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // YouTube Shorts Proxy to bypass X-Frame-Options and CSP
  app.get("/api/youtube-proxy/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const response = await axios.get(`https://m.youtube.com/shorts/${id}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        maxRedirects: 10,
        validateStatus: () => true,
        responseType: 'text'
      });

      // Remove ALL security headers that block framing
      res.status(response.status);
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('X-Content-Security-Policy');
      res.removeHeader('X-Webkit-CSP');
      
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('Content-Security-Policy', "frame-ancestors *;");
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');

      let html = response.data;
      
      // Inject a script to prevent frame-busting and handle auto-replay
      html = html.replace('<head>', `
        <head>
        <base href="https://m.youtube.com/">
        <script>
          // Prevent YouTube from breaking out of the frame
          window.onbeforeunload = function() { return false; };
          Object.defineProperty(window, 'top', { get: function() { return window.self; } });
          Object.defineProperty(window, 'parent', { get: function() { return window.self; } });

          // Virtual Identity
          const virtualIp = "${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}";
          console.log("Session established via IP: " + virtualIp);

          // Auto-Replay Logic
          setInterval(() => {
            const video = document.querySelector('video');
            if (video) {
              video.muted = false; // Attempt to unmute if possible
              if (video.ended) {
                video.currentTime = 0;
                video.play();
                console.log("Video looped successfully.");
              }
            }
          }, 1000);
        </script>
        <style>
          #header-bar, .pivot-bar-renderer, #yt-masthead-container, .mobile-topbar-header, #header-container { display: none !important; }
          body { background: black !important; }
          /* Ensure video fills the frame */
          video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
        </style>
      `);

      res.send(html);
    } catch (error) {
      console.error("Proxy Critical Error:", error);
      res.status(500).send("Error proxying YouTube Shorts. Please try again.");
    }
  });

  // Google OAuth2 Config
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `http://localhost:3000/api/auth/callback`
  );

  // API: Start Google OAuth Flow
  app.get("/api/auth/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid"
      ],
      prompt: "consent"
    });
    res.redirect(url);
  });

  // API: OAuth Callback
  app.get("/api/auth/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      // Store in Firestore
      const email = userInfo.data.email!;
      await db.collection("linked_accounts").doc(email).set({
        email: email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        linked_at: FieldValue.serverTimestamp(),
      }, { merge: true });

      // Redirect back to app
      res.redirect("/?view=gmail-checker");
    } catch (error) {
      console.error("Auth Error:", error);
      res.redirect("/?error=auth_failed");
    }
  });

  // API: Get Gmail Inbox for a specific account
  app.get("/api/gmail/inbox", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
      const accountDoc = await db.collection("linked_accounts").doc(email as string).get();
      if (!accountDoc.exists) return res.status(404).json({ error: "Account not linked" });

      const data = accountDoc.data();
      oauth2Client.setCredentials({
        access_token: data?.access_token,
        refresh_token: data?.refresh_token,
      });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 10,
        q: "is:unread"
      });

      const messages = await Promise.all(
        (response.data.messages || []).map(async (msg) => {
          const details = await gmail.users.messages.get({ userId: "me", id: msg.id! });
          const payload = details.data.payload;
          const headers = payload?.headers;
          return {
            id: msg.id,
            snippet: details.data.snippet,
            from: headers?.find(h => h.name === "From")?.value,
            subject: headers?.find(h => h.name === "Subject")?.value,
            date: headers?.find(h => h.name === "Date")?.value,
          };
        })
      );

      res.json({ messages });
    } catch (error) {
      console.error("Gmail API Error:", error);
      res.status(500).json({ error: "Failed to fetch inbox" });
    }
  });

  // Proxy/Routing Simulation Endpoint
  app.get("/api/proxy/stream", (req, res) => {
    // This would typically involve setting up a forward proxy with unique IPs
    // Here we simulate the metadata for the client to use
    const { email } = req.query;
    res.json({
      status: "routed",
      assignedIp: `192.168.1.${Math.floor(Math.random() * 255)}`, // Simulated residential IP
      provider: "Premium Proxy Layer",
      account: email
    });
  });

  // --- TEMP MAIL API ---
  app.get("/api/tempmail/inbox", async (req, res) => {
    let { email } = req.query;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: "Email required" });

    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Simplified query to avoid index requirement issues temporarily
      const snapshot = await db.collection("temp_messages")
        .where("to", "==", normalizedEmail)
        .limit(50)
        .get();

      const messages = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Sort in memory to avoid "PERMISSION_DENIED" or "FAILED_PRECONDITION" due to missing composite index
        .sort((a: any, b: any) => {
          const timeA = a.received_at?.seconds || 0;
          const timeB = b.received_at?.seconds || 0;
          return timeB - timeA;
        })
        .slice(0, 20);

      res.json({ messages });
    } catch (error: any) {
      console.error("Inbox fetch error:", error);
      res.status(500).json({ 
        error: "Failed to fetch inbox", 
        details: error.message,
        code: error.code
      });
    }
  });

  app.post("/api/tempmail/simulate", async (req, res) => {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: "Recipient required" });

    try {
      const message = {
        to,
        from: "verification@trusted-service.com",
        subject: "Your Verification Code: " + Math.floor(100000 + Math.random() * 900000),
        text: `Hello,\n\nYour OTP code is ${Math.floor(100000 + Math.random() * 900000)}. It expires in 5 minutes.\n\nThank you!`,
        html: `<div style="font-family: sans-serif; color: #333;">
                <h2>Verification Code</h2>
                <p>Hello,</p>
                <p>Your OTP code is: <strong style="font-size: 24px; color: #4F46E5;">${Math.floor(100000 + Math.random() * 900000)}</strong></p>
                <p>It expires in 5 minutes.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
               </div>`,
        received_at: FieldValue.serverTimestamp()
      };

      await db.collection("temp_messages").add(message);
      res.json({ status: "simulated" });
    } catch (error) {
      console.error("Simulation error:", error);
      res.status(500).json({ error: "Simulation failed" });
    }
  });

  // --- SMTP SERVER (Catch-All) ---
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 2525; // Use 2525 for dev if 25 is blocked
  const server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      simpleParser(stream, async (err, parsed) => {
        if (err) return console.error("Parse error:", err);
        
        const to = parsed.to ? (Array.isArray(parsed.to) ? parsed.to[0].text : parsed.to.text) : "";
        const from = parsed.from ? (Array.isArray(parsed.from) ? parsed.from[0].text : parsed.from.text) : "";
        
        try {
          await db.collection("temp_messages").add({
            to: to.toLowerCase().trim(),
            from,
            subject: parsed.subject || "(No Subject)",
            text: parsed.text || "",
            html: parsed.html || "",
            received_at: FieldValue.serverTimestamp()
          });
          console.log(`Email received and stored for: ${to}`);
        } catch (dbErr) {
          console.error("DB Store error:", dbErr);
        }
      });
      callback();
    }
  });

  server.listen(smtpPort, "0.0.0.0", () => {
    console.log(`SMTP Server listening on port ${smtpPort}`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
