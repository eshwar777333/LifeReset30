// Life Reset 30 uses localStorage for data persistence
// This storage interface is kept for potential future use

export interface IStorage {
  // Future storage methods can be added here
}

export class MemStorage implements IStorage {
  constructor() {
    // Future implementation
  }
}

export const storage = new MemStorage();
