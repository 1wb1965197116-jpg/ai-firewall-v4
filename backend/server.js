import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let clients = [];
let users = {};   // { username: { password, token } }
let events = [];  // event logs

/* =========================
   WEBSOCKET
========================= */
wss.on("connection", (ws) => {
  clients.push(ws);

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
  });
});

function broadcast(data) {
  clients.forEach(ws => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  });
}

/* =========================
   AUTH SYSTEM
========================= */

// Register
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (users[username]) {
    return res.json({ error: "User exists" });
  }

  const token = uuidv4();

  users[username] = { password, token };

  res.json({ success: true, token });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!users[username] || users[username].password !== password) {
    return res.json({ error: "Invalid login" });
  }

  res.json({ token: users[username].token });
});

/* =========================
   FIREWALL EVENT
========================= */
app.post("/event", (req, res) => {
  const { token, raw, clean, url } = req.body;

  const user = Object.keys(users).find(
    u => users[u].token === token
  );

  if (!user) {
    return res.json({ error: "Unauthorized" });
  }

  const event = {
    user,
    raw,
    clean,
    url,
    time: Date.now()
  };

  events.push(event);

  console.log("EVENT:", event);

  broadcast(event);

  res.json({ status: "logged" });
});

/* =========================
   GET USER EVENTS
========================= */
app.get("/events", (req, res) => {
  const { token } = req.query;

  const user = Object.keys(users).find(
    u => users[u].token === token
  );

  if (!user) return res.json([]);

  res.json(events.filter(e => e.user === user));
});

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.send("AI Firewall v6 SaaS LIVE ✔");
});

/* =========================
   START
========================= */
server.listen(process.env.PORT || 3000, () => {
  console.log("AI Firewall v6 running");
});
