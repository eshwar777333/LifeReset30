import { useEffect } from 'react';

// Auto-apply a dim/warm theme after 7pm local time.
export function useThemeSchedule() {
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const hour = new Date().getHours();
      if (hour >= 19 || hour < 6) {
        root.classList.add('theme-night');
      } else {
        root.classList.remove('theme-night');
      }
    };

    apply();
    // Re-evaluate every 15 minutes
    const id = setInterval(apply, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
}
