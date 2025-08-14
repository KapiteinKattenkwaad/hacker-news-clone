import React, { useState } from 'react';
import { ArrowUp, MessageCircle, ExternalLink, Clock, User } from 'lucide-react';
import { Story } from '../types';

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [currentScore, setCurrentScore] = useState(story.score);

  const handleUpvote = () => {
    if (isUpvoted) {
      setCurrentScore(currentScore - 1);
    } else {
      setCurrentScore(currentScore + 1);
    }
    setIsUpvoted(!isUpvoted);
  };

  const getCategoryBadge = () => {
    const categoryStyles = {
      top: 'bg-red-100 text-red-700',
      new: 'bg-green-100 text-green-700',
      best: 'bg-purple-100 text-purple-700',
      ask: 'bg-blue-100 text-blue-700',
      show: 'bg-yellow-100 text-yellow-700',
      jobs: 'bg-gray-100 text-gray-700',
    };

    const categoryLabels = {
      top: 'Top',
      new: 'New',
      best: 'Best',
      ask: 'Ask HN',
      show: 'Show HN',
      jobs: 'Jobs',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryStyles[story.category]}`}>
        {categoryLabels[story.category]}
      </span>
    );
  };

  const handleTitleClick = () => {
    if (story.url) {
      window.open(story.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-all duration-300 group">
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={story.thumbnail}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {getCategoryBadge()}
          </div>
          <button
            onClick={handleUpvote}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isUpvoted
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ArrowUp size={16} className={isUpvoted ? 'fill-current' : ''} />
            <span>{currentScore}</span>
          </button>
        </div>

        <h2 
          className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight ${story.url ? 'cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200' : ''}`}
          onClick={handleTitleClick}
        >
          {story.title}
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {story.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User size={14} />
              <span>{story.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{formatTimeAgo(story.time)}</span>
            </div>
            {story.domain && (
              <div className="flex items-center space-x-1">
                <ExternalLink size={14} />
                <span>{story.domain}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <MessageCircle size={14} />
            <span>{story.descendants || 0}</span>
          </div>
        </div>
      </div>
    </article>
  );
}