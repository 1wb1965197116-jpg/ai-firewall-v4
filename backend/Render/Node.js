import express from "express";
const app = express();

app.use(express.json());

let logs = [];

app.post("/event", (req, res) => {
  const event = req.body;

  logs.push(event);

  console.log("EVENT RECEIVED:", event);

  // simple intelligence response
  let action = "allow";

  if (event.risk > 60) action = "block";
  else if (event.risk > 30) action = "review";

  res.json({ status: action });
});

app.get("/logs", (req, res) => {
  res.json(logs);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("AI Firewall v2 running");
});
