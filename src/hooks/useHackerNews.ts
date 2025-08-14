import { useState, useEffect, useCallback } from 'react';
import { Story, CategoryType } from '../types';
import { getStories } from '../services/hackerNewsApi';

interface UseHackerNewsReturn {
  stories: Story[];
  loading: boolean;
  error: string | null;
  refreshStories: () => void;
}

export function useHackerNews(category: CategoryType, limit: number = 30): UseHackerNewsReturn {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedStories = await getStories(category, limit);
      setStories(fetchedStories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories');
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const refreshStories = useCallback(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    stories,
    loading,
    error,
    refreshStories,
  };
}