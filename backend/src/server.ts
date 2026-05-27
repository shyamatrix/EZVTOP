import express, { Application } from "express";
import cors from "cors";

import statusRoutes from "./routes/status";
import calendarRoutes from "./routes/calendar";
import loginRoutes from "./routes/login/login";
import hostelRoutes from "./routes/hostel";
import gradesRoutes from "./routes/grades";
import scheduleRoutes from "./routes/schedule";
import attendanceRoutes from "./routes/attendance";
import allGradesRoutes from "./routes/allGrades";
import fetchLMSdata from "./routes/FetchLMSdata";
import fetchVitoldata from "./routes/FetchVitoldata";
import subscribe from "./routes/notifications/subscribe";
import unsubscribe from "./routes/notifications/unsubscribe";
import notifConfig from "./routes/notifications/config";
import notifTest from "./routes/notifications/test";
import notifStatus from "./routes/notifications/status";
import { routeLogger } from "./lib/Logger";
import stats from "./routes/stats";
import webpush from 'web-push'
import { vitolReminder } from "./lib/VitolReminder";

import { swaggerSpec } from "./lib/clients/swagger";
import swaggerUi from "swagger-ui-express";

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (
        req.path.startsWith("/.") ||
        req.path.includes(".git") ||
        req.path.includes(".env")
    ) {
        return res.sendStatus(404);
    }
    next();
});

app.use("/api/status", statusRoutes);
app.use("/stats", stats);

app.use("/api", routeLogger);

app.use("/api/calendar", calendarRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/all-grades", allGradesRoutes);
app.use("/api/lms-data", fetchLMSdata);
app.use("/api/vitol-data", fetchVitoldata);
app.use("/api/notifications/subscribe", subscribe);
app.use("/api/notifications/unsubscribe", unsubscribe);
app.use("/api/notifications/config", notifConfig);
app.use("/api/notifications/test", notifTest);
app.use("/api/notifications/status", notifStatus);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const vapidSubject = process.env.VAPID_SUBJECT;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidSubject && vapidPublicKey && vapidPrivateKey) {
    try {
        webpush.setVapidDetails(
            vapidSubject,
            vapidPublicKey,
            vapidPrivateKey
        );
        console.log("✅ VAPID details configured successfully.");
    } catch (err) {
        console.error("❌ Failed to set VAPID details:", err);
    }
} else {
    console.warn("⚠️ VAPID Environment variables are missing. Push notifications will be disabled.");
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Express TS server running on port ${PORT}`);
    if (typeof (globalThis as any).Deno === "undefined") {
        vitolReminder();
    }
});
