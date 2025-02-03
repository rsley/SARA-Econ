/*
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Rafael S.R.                                                             │
  │ v0.0.1                                                                  │
  │                                                                         │
  │ Proprietary and closed.                                                 │
  │ © All rights reserved.                                                  │
  │                                                                         │
  │ The above copyright notice and this permission shall be included in all │
  │ copies or substantial portions of the Software.                         │
  └─────────────────────────────────────────────────────────────────────────┘
 */

//-- Imports --\\
import "dotenv/config";
import fs from "fs";
import util from "util";
import unb from "unb-api";
import { Client, IntentsBitField, Partials } from "discord.js";
import { scheduleNextRun } from "./time.js";

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

//-- Login --\\
client.login(process.env.TOKEN);
