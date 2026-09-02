import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every navigation/redirect to any page immediately resets scroll to the very top (0, 0)
 * before the browser paints the new route.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    // Disable browser's automatic scroll restoration to avoid jumping to old scroll offsets
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // If there is an anchor hash (e.g. #why-brickflow), scroll smoothly to that target
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Immediately reset window and document scroll position
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Reset all internal scrollable containers (e.g., <main>, dashboard viewport, modal backdrops)
    const scrollContainers = document.querySelectorAll('main, .overflow-y-auto, [data-scroll-container], #root > div');
    scrollContainers.forEach(container => {
      container.scrollTop = 0;
    });
  }, [pathname, search, hash]);

  return null;
};
