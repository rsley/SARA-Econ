/*
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Rafael S.                                                               │
  │ v0.0.2                                                                  │
  │                                                                         │
  │ Proprietary and closed.                                                 │
  │ © All rights reserved.                                                  │
  │                                                                         │
  │ The above copyright notice and this permission shall be included in all │
  │ copies or substantial portions of the Software.                         │
  └─────────────────────────────────────────────────────────────────────────┘
 */

//-- Imports --\\
require("dotenv").config();
const fs = require("fs");
const util = require("util");
const unb = require("unb-api");
const express = require("express");
const { Client, IntentsBitField, Partials } = require("discord.js");
const { scheduleNextRun } = require("./time.js");

//-- Client --\\
const unbClient = new unb.Client(process.env.UNB, { maxRetries: 15 }); // 15 retries in case of rate limit
const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers],
  partials: [Partials.GuildMember, Partials.User],
});

//-- Logging --\\
const logFile = fs.createWriteStream("output.log", { flags: "a" });
const checkFileSize = () => {
  const data = fs.readFileSync("output.log", "utf8");
  const lines = data.split("\n").length;
  return lines > 2000;
};
const log = (...args) => {
  console.warn(...args);

  const logMessage = util.format(...args) + "\n"; // Format the log message and append newline
  logFile.write(logMessage);
};
console.log = log;

//-- Events --\\
client.once("ready", () => {
  if (checkFileSize()) {
    fs.truncateSync("output.log", 0); // Clear the file if it has more than 2000 lines
  }

  const now = new Date();
  const padZero = (value) => (value < 10 ? `0${value}` : value); // add a zero before if not double digit
  const hours = padZero(now.getHours());
  const minutes = padZero(now.getMinutes());
  const seconds = padZero(now.getSeconds());
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  console.log(
    `
  
    ┌─────────────────────────────────────────────────────────────────────────┐
    │ ${padZero(now.getDate())}/${padZero(
      now.getMonth() + 1
    )}/${now.getFullYear()} | ${formattedTime} | S.A.R.A | © Rafael S.R.                         │
    └─────────────────────────────────────────────────────────────────────────┘
    `
  );
  console.log(`🚀 Ready as ${client.user.username}`);
  client.user.setPresence({
    status: "dnd",
    activities: [
      {
        name: "Jugando Emergency Response Liberty County.",
        type: 4,
      },
    ],
  });

  scheduleNextRun(client, unbClient);
});

//-- Express Server --\\
const app = express();
app.get("/logs/:key", (req, res) => {
  if (req.params.key !== process.env.KEY)
    return res.status(401).send("Unauthorized");
  res.sendFile("output.log", { root: process.cwd() });
});
app.get("/last/:key", (req, res) => {
  if (req.params.key !== process.env.KEY) {
    return res.status(401).send("Unauthorized");
  }

  // Read the last_run.json file
  fs.readFile("last_run.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }

    const lastRunData = JSON.parse(data);
    const lastRun = new Date(lastRunData.lastRun);

    // Calculate the next run time (24 hours after lastRun)
    const nextRun = new Date(lastRun.getTime() + 24 * 60 * 60 * 1000);

    const now = new Date();

    // Calculate the difference in minutes and milliseconds
    const millisecondsUntilNextRun = nextRun - now;
    const minutesUntilNextRun = Math.floor(
      millisecondsUntilNextRun / (1000 * 60)
    );

    // Get the timezone of the last run (in the format of UTC offset)
    const lastRunTimezone = lastRun.toString().match(/\(([^)]+)\)/)[1];

    // Return the object with the required data
    res.json({
      minutesUntilNextRun,
      millisecondsUntilNextRun,
      lastRun,
      lastRunTimezone,
    });
  });
});
app.get("/clearlogs/:key", (req, res) => {
  if (req.params.key !== process.env.KEY)
    return res.status(401).send("Unauthorized");
  fs.truncateSync("output.log", 0);
  res.send("Logs cleared.");
});
app.get("*", (req, res) => {
  res.json({
    ping: `${client.ws.ping}ms`,
    uptime: `${client.uptime}ms`,
    version: "v0.0.2",
  });
});
app.listen(process.env.PORT || 3000, () => {
  setTimeout(() => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
  }, 3000);
});

//-- Login --\\
client.login(process.env.TOKEN);
