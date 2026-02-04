import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function useTabFromHash(setActiveTab: (tab: string) => void) {
  const [location] = useLocation();

  useEffect(() => {
    const handleHashChange = () => {
      // Get hash from URL
      const hash = window.location.hash.slice(1); // Remove the '#'
      
      if (hash) {
        // Set the active tab
        setActiveTab(hash);
        
        // Small delay to ensure tab content is rendered before scrolling
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    };

    // Handle initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [location, setActiveTab]);
}
