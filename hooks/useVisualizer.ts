
import { useEffect, useRef, useState } from 'react';
import { MaestroAudioPro } from '../lib/audioPro.ts';

export function useVisualizer(audioPro: MaestroAudioPro, isEnabled: boolean) {
    const [levels, setLevels] = useState({ master: 0, mic: 0, isAttack: false });
    const requestRef = useRef<number>(0);

    const animate = () => {
        if (isEnabled) {
            setLevels(audioPro.getLevels());
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    useEffect(() => {
        if (isEnabled) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(requestRef.current);
            setLevels({ master: 0, mic: 0, isAttack: false });
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isEnabled, audioPro]);

    return levels;
}
