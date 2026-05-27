const inMemoryUsers = new Map<string, FirestoreUser>();

export class FirestoreUser {
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

  constructor(data: any) {
    this.UserID = data.UserID;
    this.files = data.files || [];
    this.pushSubscriptions = data.pushSubscriptions || [];
    this.notifications = data.notifications || {
      enabled: false,
      sources: {
        vitol: { enabled: false, data: [] },
        moodle: { enabled: false, data: [] }
      }
    };
  }

  async save(): Promise<void> {
    inMemoryUsers.set(this.UserID, this);
  }

  markModified(_path: string): void {
    // Mongoose compatibility: dummy method
  }
}

function setNestedKey(obj: any, path: string, value: any) {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i] as string;
    if (!(key in current) || current[key] === null || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }
  const lastKey = keys[keys.length - 1] as string;
  current[lastKey] = value;
}

function getNestedKey(obj: any, path: string): any {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key as string];
  }
  return current;
}

export const User = {
  async findOne(query: { UserID: string }): Promise<FirestoreUser | null> {
    const user = inMemoryUsers.get(query.UserID);
    if (!user) return null;
    return user;
  },

  async find(query: any = {}): Promise<FirestoreUser[]> {
    const usersList = Array.from(inMemoryUsers.values());
    let filtered = usersList;
    
    // simple query support for VitolReminder
    if (query["notifications.enabled"] === true) {
      filtered = filtered.filter(u => u.notifications && u.notifications.enabled === true);
    }
    
    // Filter pushSubscriptions in-memory for VitolReminder
    if (query.pushSubscriptions && query.pushSubscriptions.$ne) {
      filtered = filtered.filter(u => u.pushSubscriptions && u.pushSubscriptions.length > 0);
    }
    
    return filtered;
  },

  async create(data: { UserID: string; files: any[] }): Promise<FirestoreUser> {
    const user = new FirestoreUser(data);
    await user.save();
    return user;
  },

  async updateOne(query: { UserID: string }, update: any): Promise<void> {
    let user = inMemoryUsers.get(query.UserID);
    if (!user) {
      user = new FirestoreUser({ UserID: query.UserID });
      inMemoryUsers.set(query.UserID, user);
    }
    
    if (update.$set) {
      for (const key of Object.keys(update.$set)) {
        setNestedKey(user, key, update.$set[key]);
      }
    }
    
    if (update.$push) {
      for (const key of Object.keys(update.$push)) {
        const arr = getNestedKey(user, key) || [];
        arr.push(update.$push[key]);
        setNestedKey(user, key, arr);
      }
    }

    if (update.$addToSet) {
      for (const key of Object.keys(update.$addToSet)) {
        const arr = getNestedKey(user, key) || [];
        const val = update.$addToSet[key];
        const exists = arr.some((item: any) => {
          if (typeof item === "object" && typeof val === "object") {
            return JSON.stringify(item) === JSON.stringify(val);
          }
          return item === val;
        });
        if (!exists) {
          arr.push(val);
          setNestedKey(user, key, arr);
        }
      }
    }
    
    if (update.$pull) {
      for (const key of Object.keys(update.$pull)) {
        let arr = getNestedKey(user, key) || [];
        const pullCriteria = update.$pull[key];
        if (pullCriteria && typeof pullCriteria === "object") {
          const pullKey = Object.keys(pullCriteria)[0];
          if (pullKey !== undefined) {
            const pullValue = pullCriteria[pullKey];
            arr = arr.filter((item: any) => item[pullKey] !== pullValue);
          }
        } else {
          arr = arr.filter((item: any) => item !== pullCriteria);
        }
        setNestedKey(user, key, arr);
      }
    }
    
    const hasOperators = Object.keys(update).some(k => k.startsWith("$"));
    if (!hasOperators) {
      for (const key of Object.keys(update)) {
        setNestedKey(user, key, update[key]);
      }
    }
  }
};
