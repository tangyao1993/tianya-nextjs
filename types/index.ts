export interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  views: number;
  replies: number;
  summary: string;
  content: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface UserStats {
  dailyAiUsage: number;
  lastVisit: string;
}

export enum ViewState {
  HOME = 'HOME',
  DETAIL = 'DETAIL'
}