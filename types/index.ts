export interface Post {
  id: string | number;
  title: string;
  author?: string;
  date?: string;
  category?: string;
  views?: number;
  replies?: number;
  summary?: string;
  content?: string;
  content_text?: string;
  tags?: string[];
  view_count?: number;
  reply_count?: number;
  created_at?: string;
  updated_at?: string;
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