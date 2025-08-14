import { Story, CategoryType } from '../types';

export function filterStories(stories: Story[], category: CategoryType, searchQuery: string): Story[] {
  let filtered = stories;
  
  // Only filter by category if it's not 'all'
  if (category !== 'all') {
    filtered = stories.filter(story => story.category === category);
  }
  
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(story =>
      story.title.toLowerCase().includes(query) ||
      story.description.toLowerCase().includes(query) ||
      story.author.toLowerCase().includes(query)
    );
  }
  
  return filtered;
}

export function sortStoriesByScore(stories: Story[]): Story[] {
  return [...stories].sort((a, b) => b.score - a.score);
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}