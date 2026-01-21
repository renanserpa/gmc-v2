import React from 'react';
import Lottie, { LottieComponentProps } from 'lottie-react';

interface LottiePlayerProps extends Omit<LottieComponentProps, 'animationData'> {
  animationUrl: string;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({ animationUrl, ...props }) => {
  const [animationData, setAnimationData] = React.useState(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    
    const fetchLottie = async () => {
      try {
        const res = await fetch(animationUrl);
        if (!res.ok) throw new Error(`Failed to load Lottie: ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          setAnimationData(data);
          setError(false);
        }
      } catch (err) {
        console.warn("LottiePlayer: Failed to fetch animation data", err);
        if (isMounted) setError(true);
      }
    };

    fetchLottie();

    return () => {
      isMounted = false;
    };
  }, [animationUrl]);

  if (error) {
    return <div style={{ width: props.style?.width || '100%', height: props.style?.height || '100%' }} className="flex items-center justify-center bg-slate-800 rounded-full opacity-50" />;
  }

  if (!animationData) {
    return <div style={{ width: props.style?.width || '100%', height: props.style?.height || '100%' }} className="bg-slate-800 rounded-full animate-pulse" />;
  }

  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      {...props}
    />
  );
};