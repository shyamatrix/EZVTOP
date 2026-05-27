import { Request, Response, NextFunction } from "express";
export interface RouteStatEntry {
    id: string;
    hour: Date;
    total: number;
    routes: Record<string, number>;
    sources: Record<string, number>;
}
export declare const inMemoryStats: Map<string, RouteStatEntry>;
export declare function routeLogger(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=Logger.d.ts.map