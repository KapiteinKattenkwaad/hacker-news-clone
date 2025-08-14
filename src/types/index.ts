export interface Story {
  id: number;
  title: string;
  url?: string;
  description: string;
  thumbnail: string;
  score: number;
  author: string;
  time: number;
  descendants?: number;
  category: 'top' | 'new' | 'best' | 'ask' | 'show' | 'jobs';
  domain?: string;
  type: string;
  text?: string;
}

export interface HNItem {
  id: number;
  deleted?: boolean;
  type: 'job' | 'story' | 'comment' | 'poll' | 'pollopt';
  by?: string;
  time?: number;
  text?: string;
  dead?: boolean;
  parent?: number;
  poll?: number;
  kids?: number[];
  url?: string;
  score?: number;
  title?: string;
  parts?: number[];
  descendants?: number;
}

export type CategoryType = 'all' | 'top' | 'new' | 'best' | 'ask' | 'show' | 'jobs';

export interface FilterState {
  category: CategoryType;
  searchQuery: string;
}