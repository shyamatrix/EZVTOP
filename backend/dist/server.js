"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const status_1 = __importDefault(require("./routes/status"));
const calendar_1 = __importDefault(require("./routes/calendar"));
const login_1 = __importDefault(require("./routes/login/login"));
const hostel_1 = __importDefault(require("./routes/hostel"));
const grades_1 = __importDefault(require("./routes/grades"));
const schedule_1 = __importDefault(require("./routes/schedule"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const allGrades_1 = __importDefault(require("./routes/allGrades"));
const FetchLMSdata_1 = __importDefault(require("./routes/FetchLMSdata"));
const FetchVitoldata_1 = __importDefault(require("./routes/FetchVitoldata"));
const subscribe_1 = __importDefault(require("./routes/notifications/subscribe"));
const unsubscribe_1 = __importDefault(require("./routes/notifications/unsubscribe"));
const config_1 = __importDefault(require("./routes/notifications/config"));
const test_1 = __importDefault(require("./routes/notifications/test"));
const status_2 = __importDefault(require("./routes/notifications/status"));
const Logger_1 = require("./lib/Logger");
const stats_1 = __importDefault(require("./routes/stats"));
const web_push_1 = __importDefault(require("web-push"));
const VitolReminder_1 = require("./lib/VitolReminder");
const swagger_1 = require("./lib/clients/swagger");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    if (req.path.startsWith("/.") ||
        req.path.includes(".git") ||
        req.path.includes(".env")) {
        return res.sendStatus(404);
    }
    next();
});
app.use("/api/status", status_1.default);
app.use("/stats", stats_1.default);
app.use("/api", Logger_1.routeLogger);
app.use("/api/calendar", calendar_1.default);
app.use("/api/login", login_1.default);
app.use("/api/hostel", hostel_1.default);
app.use("/api/grades", grades_1.default);
app.use("/api/schedule", schedule_1.default);
app.use("/api/attendance", attendance_1.default);
app.use("/api/all-grades", allGrades_1.default);
app.use("/api/lms-data", FetchLMSdata_1.default);
app.use("/api/vitol-data", FetchVitoldata_1.default);
app.use("/api/notifications/subscribe", subscribe_1.default);
app.use("/api/notifications/unsubscribe", unsubscribe_1.default);
app.use("/api/notifications/config", config_1.default);
app.use("/api/notifications/test", test_1.default);
app.use("/api/notifications/status", status_2.default);
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
const vapidSubject = process.env.VAPID_SUBJECT;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
if (vapidSubject && vapidPublicKey && vapidPrivateKey) {
    try {
        web_push_1.default.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
        console.log("✅ VAPID details configured successfully.");
    }
    catch (err) {
        console.error("❌ Failed to set VAPID details:", err);
    }
}
else {
    console.warn("⚠️ VAPID Environment variables are missing. Push notifications will be disabled.");
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Express TS server running on port ${PORT}`);
    if (typeof globalThis.Deno === "undefined") {
        (0, VitolReminder_1.vitolReminder)();
    }
});
//# sourceMappingURL=server.js.map