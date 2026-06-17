declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = 'G-6QDGRXBZND';

/**
 * Log a page view to Google Analytics
 * @param path The path of the page
 */
export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
};

/**
 * Log a custom event to Google Analytics
 * @param action The action name (e.g., 'click', 'submit')
 * @param category The category of the event
 * @param label An optional label for the event
 * @param value An optional numerical value
 */
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
