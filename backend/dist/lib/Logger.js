"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inMemoryStats = void 0;
exports.routeLogger = routeLogger;
exports.inMemoryStats = new Map();
function getHourId() {
    const now = new Date();
    const offsetNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // convert UTC to IST
    const year = offsetNow.getUTCFullYear();
    const month = String(offsetNow.getUTCMonth() + 1).padStart(2, '0');
    const day = String(offsetNow.getUTCDate()).padStart(2, '0');
    const hour = String(offsetNow.getUTCHours()).padStart(2, '0');
    return `${year}-${month}-${day}_${hour}`;
}
function getHourStart() {
    const now = new Date();
    const offsetNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    offsetNow.setUTCMinutes(0, 0, 0);
    return new Date(offsetNow.getTime() - 5.5 * 60 * 60 * 1000);
}
function getSourceDomain(req) {
    const origin = req.headers.origin;
    if (typeof origin === "string") {
        try {
            return new URL(origin).hostname;
        }
        catch { }
    }
    const referer = req.headers.referer;
    if (typeof referer === "string") {
        try {
            return new URL(referer).hostname;
        }
        catch { }
    }
    return "unknown";
}
function normalizeRoute(url) {
    const path = url.split("?")[0] || "undefined";
    return path
        .replace(/[a-f0-9]{24}/gi, ":id")
        .replace(/\b\d+\b/g, ":id")
        .replace(/\b[A-Z]{2}\d{5,}\b/g, ":userID");
}
const routes = ["/api/calendar", "/api/login", "/api/hostel", "/api/grades", "/api/schedule", "/api/attendance", "/api/all-grades", "/api/lms-data"];
async function routeLogger(req, res, next) {
    res.on("finish", () => {
        try {
            if (req.originalUrl === "/favicon.ico")
                return;
            let normalizedRoute = normalizeRoute(req.originalUrl);
            if (!routes.includes(normalizedRoute)) {
                normalizedRoute = "unknown";
            }
            const sourceDomain = getSourceDomain(req).replace(/\./g, "_");
            const routeField = normalizedRoute.replace(/\//g, "_").replace(/:/g, "$");
            const hourId = getHourId();
            const hourStart = getHourStart();
            let entry = exports.inMemoryStats.get(hourId);
            if (!entry) {
                entry = {
                    id: hourId,
                    hour: hourStart,
                    total: 0,
                    routes: {},
                    sources: {}
                };
                exports.inMemoryStats.set(hourId, entry);
            }
            entry.total += 1;
            entry.routes[routeField] = (entry.routes[routeField] || 0) + 1;
            entry.sources[sourceDomain] = (entry.sources[sourceDomain] || 0) + 1;
        }
        catch (err) {
            console.error("Route log failed:", err);
        }
    });
    next();
}
//# sourceMappingURL=Logger.js.map