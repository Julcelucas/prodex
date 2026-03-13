
import { useEffect } from 'react';
import React from 'react';

export const updateMetaTag = (name, content, isProperty = false) => {
  if (!content) return;
  const attribute = isProperty ? 'property' : 'name';
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

export const updateCanonicalUrl = (url) => {
  if (!url) return;
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
};

export const updatePageSEO = ({ title, description, keywords, ogImage, ogUrl, ogType = 'website', noindex = false }) => {
  if (title) {
    document.title = title;
    updateMetaTag('og:title', title, true);
    updateMetaTag('twitter:title', title);
  }
  if (description) {
    updateMetaTag('description', description);
    updateMetaTag('og:description', description, true);
    updateMetaTag('twitter:description', description);
  }
  if (keywords) {
    updateMetaTag('keywords', keywords);
  }
  if (ogImage) {
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:card', 'summary_large_image');
  }
  if (ogUrl) {
    updateMetaTag('og:url', ogUrl, true);
    updateCanonicalUrl(ogUrl);
  }
  if (ogType) {
    updateMetaTag('og:type', ogType, true);
  }
  
  const robots = document.querySelector(`meta[name="robots"]`);
  if (noindex) {
    if (!robots) {
      const el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      el.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(el);
    } else {
      robots.setAttribute('content', 'noindex, nofollow');
    }
  } else {
    if (robots) {
      robots.setAttribute('content', 'index, follow');
    }
  }
};

export const usePageSEO = (config) => {
  useEffect(() => {
    updatePageSEO(config);
  }, [config]);
};

// Helper component for injecting JSON-LD
// Uses React.createElement instead of JSX to avoid SyntaxError in .js files
export const StructuredData = ({ data }) => {
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) }
  });
};
