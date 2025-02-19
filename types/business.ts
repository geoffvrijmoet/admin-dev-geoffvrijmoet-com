export interface BusinessInsight {
    _id: string;
    type: 'insight' | 'action' | 'strategy';
    content: string;
    source?: string;
    timestamp: Date;
  }
  
  export interface BusinessSource {
    _id: string;
    type: 'conversation' | 'tweet' | 'article' | 'case_study';
    title: string;
    content: string;
    author?: string;
    url?: string;
    timestamp: Date;
    tags: string[];
  }

export type TimeLog = {
  _id: string;
  project: string;  // Project ID
  client: string;
  startTime: Date;
  endTime: Date;
  hours: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Project = {
  _id: string;
  client: string;
  project: string;
  rate: number;
  rateType: 'hourly' | 'fixed';
  createdAt: Date;
  updatedAt: Date;
  totalHours?: number;
  totalEarnings?: number;
  [key: string]: unknown; // Allow dynamic fields
}; 