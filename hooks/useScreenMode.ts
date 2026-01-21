
import { useState, useEffect } from 'react';

export function useScreenMode() {
    const [isTvMode, setIsTvMode] = useState(window.innerWidth >= 1900 || window.devicePixelRatio < 1);

    useEffect(() => {
        const handleResize = () => {
            // TVs generally have high resolution but users use zoom or it's a "big picture" environment
            setIsTvMode(window.innerWidth >= 1900);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isTvMode, setIsTvMode };
}
