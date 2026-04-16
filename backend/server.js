import express from "express";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Firewall is LIVE ✔");
});

app.post("/event", (req, res) => {
  res.json({
    status: "received",
    data: req.body
  });
});

app.get("/logs", (req, res) => {
  res.json({ message: "logs endpoint working" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("AI Firewall running");
});
