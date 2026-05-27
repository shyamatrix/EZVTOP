"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Deno Deploy Entrypoint
const cleanupExpiredFiles_ts_1 = require("./lib/cleanupExpiredFiles.ts");
const VitolReminder_ts_1 = require("./lib/VitolReminder.ts");
// Register Deno native Cron tasks for serverless execution
if (typeof globalThis.Deno !== "undefined") {
    console.log("🦕 Deno environment detected. Registering native Deno Crons...");
    Deno.cron("Cleanup Expired Files", "0 * * * *", async () => {
        try {
            await (0, cleanupExpiredFiles_ts_1.cleanup)();
        }
        catch (err) {
            console.error("❌ Deno Cron Cleanup Failed:", err);
        }
    });
    Deno.cron("Vitol/Moodle Reminders", "0 * * * *", async () => {
        try {
            await (0, VitolReminder_ts_1.Reminder)();
        }
        catch (err) {
            console.error("❌ Deno Cron Reminder Failed:", err);
        }
    });
}
// Bootstrap the main Express server
require("./server.ts");
//# sourceMappingURL=deno_server.js.map