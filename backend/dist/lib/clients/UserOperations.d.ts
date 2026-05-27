export declare class FirestoreUser {
    UserID: string;
    files: any[];
    pushSubscriptions: any[];
    notifications: {
        enabled: boolean;
        sources: {
            vitol?: {
                enabled: boolean;
                data: any[];
            };
            moodle?: {
                enabled: boolean;
                data: any[];
            };
        };
    };
    constructor(data: any);
    save(): Promise<void>;
    markModified(_path: string): void;
}
export declare const User: {
    findOne(query: {
        UserID: string;
    }): Promise<FirestoreUser | null>;
    find(query?: any): Promise<FirestoreUser[]>;
    create(data: {
        UserID: string;
        files: any[];
    }): Promise<FirestoreUser>;
    updateOne(query: {
        UserID: string;
    }, update: any): Promise<void>;
};
//# sourceMappingURL=UserOperations.d.ts.map