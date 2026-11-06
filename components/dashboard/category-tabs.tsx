'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type PlatformCategories = {
  [platform: string]: string[];
};

interface CategoryTabsProps {
  selectedPlatform: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onPlatformChange?: (platformId: string) => void;
}

export function CategoryTabs({
  selectedPlatform,
  selectedCategory,
  onCategoryChange,
  onPlatformChange,
}: CategoryTabsProps) {
  const [categoriesMap, setCategoriesMap] = useState<PlatformCategories>({});
  const [loading, setLoading] = useState(true);

  const platformOrder = [
    'instagram',
    'facebook',
    'tiktok',
    'x',
    'linkedin',
    'google',
    'snapchat',
    'vpn',
    'other',
  ];

  const normalizePlatform = (platform: string): string => {
    const normalized = platform.toLowerCase().trim();
    if (normalized === 'twitter') return 'x';
    return normalized;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        
        if (data.success) {
          setCategoriesMap(data.categories);
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getPlatformCategories = (platformId: string) => {
    if (!platformId) return [];
    const normalized = normalizePlatform(platformId);
    if (categoriesMap[normalized]) return categoriesMap[normalized];

    const matchedKey = Object.keys(categoriesMap).find(
      (key) => key.includes(normalized) || normalized.includes(key)
    );

    return matchedKey ? categoriesMap[matchedKey] : [];
  };

  const normalizeLabel = (s: string) =>
    s.toLowerCase().replace(/\s+/g, ' ').trim();

  const categoriesForDisplay: string[] = (() => {
    if (selectedPlatform === 'all') {
      const combined: string[] = ['All'];

      // Follow the platform order strictly
      platformOrder.forEach((platform) => {
        if (categoriesMap[platform] && categoriesMap[platform].length > 0) {
          combined.push(...categoriesMap[platform]);
        }
      });

      // Also include any platforms not in platformOrder (just in case)
      const remainingPlatforms = Object.keys(categoriesMap).filter(
        (p) => !platformOrder.includes(p)
      );
      remainingPlatforms.forEach((p) => {
        combined.push(...categoriesMap[p]);
      });

      // Remove duplicates while keeping order
      const unique = Array.from(
        new Map(combined.map((c) => [normalizeLabel(c), c])).values()
      );
      return unique;
    } else if (selectedPlatform === 'other') {
      const knownKeywords = new Set(platformOrder.map((p) => p.toLowerCase()));
      const otherCats: string[] = [];

      Object.keys(categoriesMap).forEach((key) => {
        const platformIsKnown = Array.from(knownKeywords).some((keyword) =>
          key.includes(keyword)
        );
        if (!platformIsKnown) {
          otherCats.push(...categoriesMap[key]);
        }
      });

      const unique = Array.from(
        new Map(otherCats.map((c) => [normalizeLabel(c), c])).values()
      );
      return unique.sort();
    }

    return getPlatformCategories(selectedPlatform);
  })();

  useEffect(() => {
    if (selectedPlatform === 'all') return;
    if (categoriesForDisplay.length > 0) {
      if (!categoriesForDisplay.includes(selectedCategory)) {
        onCategoryChange(categoriesForDisplay[0]);
      }
    }
  }, [
    selectedPlatform,
    categoriesForDisplay,
    selectedCategory,
    onCategoryChange,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
        Loading categories...
      </div>
    );
  }

  if (categoriesForDisplay.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
        No categories available for this selections
      </div>
    );
  }

  const visibleActiveLabel = (() => {
    if (selectedPlatform === 'all') {
      if (selectedCategory && categoriesForDisplay.includes(selectedCategory))
        return selectedCategory;
      return 'All';
    }
    return categoriesForDisplay.includes(selectedCategory)
      ? selectedCategory
      : categoriesForDisplay[0];
  })();

  return (
    <div
      role="tablist"
      aria-label="Categories"
      className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide items-center border-b border-border mt-2"
    >
      {categoriesForDisplay.map((categoryLabel) => {
        const isActive = visibleActiveLabel === categoryLabel;
        return (
          <button
            key={categoryLabel}
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              if (categoryLabel === 'All') {
                if (onPlatformChange) onPlatformChange('all');
                onCategoryChange('');
              } else {
                onCategoryChange(categoryLabel);
              }
            }}
            className={cn(
              'rounded-full px-2.5 py-[4px] text-[12px] whitespace-nowrap transition-all mt-1.5 duration-150 ease-in-out focus:outline-none',
              isActive
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-200/70 dark:ring-blue-500/30'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span
              className={cn(
                'select-none',
                isActive ? 'font-semibold' : 'font-normal'
              )}
            >
              {categoryLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
