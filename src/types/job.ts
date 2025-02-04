export interface Job {
    id: string;
    company: string;
    position: string;
    status: string;
    coverLetter?: string;
    jobDescription?: string;
    followUpDate?: string | null;
    createdAt: string;
  }
