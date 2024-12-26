export const logEvent = (action: string, category: string, label: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value || 0,
        cookie_flags: 'max-age=7200;secure;samesite=none'
      });
    } catch (error) {
      console.warn('Analytics event failed:', error);
    }
  }
};

// 사용 예시:
// logEvent('click', 'investment', 'widen_button'); 