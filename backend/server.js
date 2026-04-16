import express from "express";
const app = express();

app.use(express.json());

let logs = [];

function decision(risk) {
  if (risk > 60) return "block";
  if (risk > 30) return "review";
  return "allow";
}

app.post("/event", (req, res) => {
  const event = req.body;

  const result = {
    status: decision(event.risk),
    received: event
  };

  logs.push(result);

  console.log("EVENT:", result);

  res.json(result);
});

app.get("/logs", (req, res) => {
  res.json(logs);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("AI Firewall running");
});
