import { HNItem, Story, CategoryType } from '../types';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache<T>(url: string): Promise<T> {
  const now = Date.now();
  const cached = cache.get(url);
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    cache.set(url, { data, timestamp: now });
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    // Return cached data if available, even if expired
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}

export async function getStoryIds(category: CategoryType): Promise<number[]> {
  const endpoints = {
    top: `${BASE_URL}/topstories.json`,
    new: `${BASE_URL}/newstories.json`,
    best: `${BASE_URL}/beststories.json`,
    ask: `${BASE_URL}/askstories.json`,
    show: `${BASE_URL}/showstories.json`,
    jobs: `${BASE_URL}/jobstories.json`,
  };
  
  if (category === 'all') {
    // For 'all', we'll get top stories as the primary source
    return fetchWithCache<number[]>(endpoints.top);
  }
  
  return fetchWithCache<number[]>(endpoints[category]);
}

export async function getStoryItem(id: number): Promise<HNItem | null> {
  try {
    return await fetchWithCache<HNItem>(`${BASE_URL}/item/${id}.json`);
  } catch (error) {
    console.error(`Error fetching story ${id}:`, error);
    return null;
  }
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return '';
  }
}

async function extractImageFromUrl(url: string): Promise<string | null> {
  try {
    // For now, we'll use a simple approach to get images
    // In a production app, you might want to use a service like:
    // - Open Graph image extraction
    // - Screenshot services
    // - Content parsing APIs
    
    // Check if URL contains common image hosting domains
    const imageHosts = ['imgur.com', 'github.com', 'medium.com', 'dev.to'];
    const domain = new URL(url).hostname.replace('www.', '');
    
    if (imageHosts.some(host => domain.includes(host))) {
      // For GitHub, we can try to get repository social image
      if (domain.includes('github.com')) {
        const pathParts = new URL(url).pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          return `https://opengraph.githubassets.com/1/${pathParts[0]}/${pathParts[1]}`;
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

function generateThumbnail(title: string, category: string): string {
  // Generate deterministic thumbnails based on story content
  const thumbnails = {
    tech: [
      'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    business: [
      'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    science: [
      'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    security: [
      'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    design: [
      'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    crypto: [
      'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    discussion: [
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
    ]
  };
  
  // Simple categorization based on title keywords
  const titleLower = title.toLowerCase();
  let categoryKey = 'tech'; // default
  
  if (titleLower.includes('security') || titleLower.includes('vulnerability') || titleLower.includes('hack')) {
    categoryKey = 'security';
  } else if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) {
    categoryKey = 'design';
  } else if (titleLower.includes('crypto') || titleLower.includes('blockchain') || titleLower.includes('bitcoin')) {
    categoryKey = 'crypto';
  } else if (titleLower.includes('business') || titleLower.includes('startup') || titleLower.includes('company')) {
    categoryKey = 'business';
  } else if (titleLower.includes('science') || titleLower.includes('research') || titleLower.includes('study')) {
    categoryKey = 'science';
  } else if (category === 'ask' || titleLower.includes('ask') || titleLower.includes('discussion')) {
    categoryKey = 'discussion';
  }
  
  const categoryThumbnails = thumbnails[categoryKey as keyof typeof thumbnails] || thumbnails.tech;
  const hash = title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return categoryThumbnails[Math.abs(hash) % categoryThumbnails.length];
}

async function getThumbnailForStory(item: HNItem, category: string): Promise<string> {
  // First try to extract image from URL if available
  if (item.url) {
    const extractedImage = await extractImageFromUrl(item.url);
    if (extractedImage) {
      return extractedImage;
    }
  }
  
  // Fall back to generated thumbnail
  return generateThumbnail(item.title || '', category);
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return `${Math.floor(diff / 604800)} weeks ago`;
}

function determineCategory(item: HNItem): 'top' | 'new' | 'best' | 'ask' | 'show' | 'jobs' {
  if (item.type === 'job') return 'jobs';
  
  const title = item.title?.toLowerCase() || '';
  if (title.startsWith('ask hn:') || title.includes('ask hn')) return 'ask';
  if (title.startsWith('show hn:') || title.includes('show hn')) return 'show';
  
  // For other stories, we'll default to 'top' since we can't easily determine
  // if they're "new" or "best" without additional context
  return 'top';
}

export async function transformHNItemToStory(item: HNItem, category: CategoryType = 'top'): Promise<Story> {
  const storyCategory = category === 'all' ? determineCategory(item) : category;
  const domain = item.url ? extractDomain(item.url) : undefined;
  const thumbnail = await getThumbnailForStory(item, storyCategory);
  
  // Create description from text or generate from title
  let description = '';
  if (item.text) {
    // Strip HTML tags and truncate
    description = item.text.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
  } else if (item.title) {
    // Generate a description based on the title and category
    if (storyCategory === 'ask') {
      description = 'A question posted to the Hacker News community seeking advice, opinions, or experiences from fellow members.';
    } else if (storyCategory === 'show') {
      description = 'A project, product, or creation shared with the Hacker News community for feedback and discussion.';
    } else if (storyCategory === 'jobs') {
      description = 'A job opportunity posted for developers, designers, and other tech professionals.';
    } else {
      description = `An interesting article or discussion topic shared with the Hacker News community.`;
    }
  }
  
  return {
    id: item.id,
    title: item.title || 'Untitled',
    url: item.url,
    description,
    thumbnail,
    score: item.score || 0,
    author: item.by || 'unknown',
    time: item.time || 0,
    descendants: item.descendants || 0,
    category: storyCategory,
    domain,
    type: item.type,
    text: item.text,
  };
}

export async function getStories(category: CategoryType, limit: number = 30): Promise<Story[]> {
  try {
    const storyIds = await getStoryIds(category);
    const limitedIds = storyIds.slice(0, limit);
    
    // Fetch stories in batches to avoid overwhelming the API
    const batchSize = 10;
    const stories: Story[] = [];
    
    for (let i = 0; i < limitedIds.length; i += batchSize) {
      const batch = limitedIds.slice(i, i + batchSize);
      const batchPromises = batch.map(id => getStoryItem(id));
      const batchItems = await Promise.all(batchPromises);
      
      const batchStories = batchItems
        .filter((item): item is HNItem => item !== null && !item.deleted && !item.dead)
        .map(async item => await transformHNItemToStory(item, category));
      
      const resolvedBatchStories = await Promise.all(batchStories);
      stories.push(...resolvedBatchStories);
    }
    
    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}