import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { StoryCard } from './components/StoryCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { filterStories, sortStoriesByScore } from './utils/helpers';
import { useHackerNews } from './hooks/useHackerNews';
import { CategoryType } from './types';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { stories, loading, error, refreshStories } = useHackerNews(selectedCategory, 50);

  // Initialize dark mode based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const filteredAndSortedStories = useMemo(() => {
    const filtered = filterStories(stories, selectedCategory, searchQuery);
    return sortStoriesByScore(filtered);
  }, [stories, selectedCategory, searchQuery]);

  const getCategoryTitle = () => {
    const titles = {
      all: 'All Stories',
      top: 'Top Stories',
      new: 'New Stories',
      best: 'Best Stories',
      ask: 'Ask HN',
      show: 'Show HN',
      jobs: 'Jobs',
    };
    return titles[selectedCategory];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getCategoryTitle()}</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredAndSortedStories.length} {filteredAndSortedStories.length === 1 ? 'story' : 'stories'}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={refreshStories} />
        ) : filteredAndSortedStories.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No stories found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? `No stories match your search for "${searchQuery}"`
                : 'No stories available in this category'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">HN</span>
              </div>
              <span className="text-gray-600 dark:text-gray-300 text-sm">Modern Hacker News</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Built with React, TypeScript, and Tailwind CSS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;