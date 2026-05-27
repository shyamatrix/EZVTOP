// Deno Deploy Entrypoint
import { Reminder } from "./lib/VitolReminder.ts";

// Register Deno native Cron tasks for serverless execution
const deno = (globalThis as any).Deno;
if (typeof deno !== "undefined") {
  console.log("🦕 Deno environment detected. Registering native Deno Crons...");

  deno.cron("Vitol-Moodle Reminders", "0 * * * *", async () => {
    try {
      await Reminder();
    } catch (err) {
      console.error("❌ Deno Cron Reminder Failed:", err);
    }
  });
}

// Bootstrap the main Express server
import "./server.ts";


