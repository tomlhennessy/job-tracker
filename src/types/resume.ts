export interface Resume {
    id: string;
    userId: string;
    version: number;
    content: string;
    isAiGenerated: boolean;
    createdAt: string; // Storing dates as strings for compatibility
  }
