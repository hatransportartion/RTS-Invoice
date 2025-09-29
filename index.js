const express = require("express");
const fs = require("fs");
const route = require("./route");

const app = express();
app.use(express.json());

const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local";
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  console.warn(`⚠️ Env file ${envFile} not found!`);
}

const PORT = process.env.PORT || 3000;
console.log("Running in:", process.env.NODE_ENV);
console.log("Port:", PORT);

//Middleware to log requests
app.use((req, res, next) => {
  //log date in PST format
  const date = new Date();
  const options = { timeZone: 'America/Los_Angeles', hour12: false };
  const dateString = date.toLocaleString('en-US', options);
  console.log(`${dateString} ${req.ip}, ${req.hostname} ${req.url} ${req.method}`);
  next();
});

app.use("/",  route);

//Route not found
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log("🚀 Airtable → RTS Integration running on port", PORT);
});
