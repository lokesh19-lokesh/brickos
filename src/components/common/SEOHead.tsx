import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = 'BrickOS™ | #1 Cloud ERP for Brick, Block & Paver Manufacturing Plants';
const DEFAULT_DESC = "BrickOS (https://brickos.in/) is India's leading cloud ERP for fly ash brick, red clay brick, and concrete block manufacturing plants. Manage raw material inventory, batching, kiln chambers, piece-rate labour, delivery challans, GST billing, and P&L in real time. Start free 14-day trial.";
const BASE_URL = 'https://brickos.in';

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESC,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = 'https://brickos.in/hero-brick-factory.jpg',
  noIndex = false,
}) => {
  const location = useLocation();
  const fullTitle = title ? `${title} | BrickOS™` : DEFAULT_TITLE;
  const canonicalUrl = canonical || `${BASE_URL}${location.pathname}`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to safely set meta attribute
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Primary Meta Tags
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');

    // 3. Open Graph Tags
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', ogType, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:site_name', 'BrickOS™', true);

    // 4. Twitter Cards
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // 5. Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, [fullTitle, description, keywords, canonicalUrl, ogType, ogImage, noIndex]);

  return null;
};
