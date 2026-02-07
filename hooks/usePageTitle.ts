
import { useEffect } from 'react';
import { config } from '../config.ts';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | ${config.app.name}`;
    
    // Cleanup (optional reset)
    return () => {
        document.title = config.app.name;
    };
  }, [title]);
};
