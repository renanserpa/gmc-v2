import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { Skeleton } from './Skeleton.tsx';
import { cn } from '../../lib/utils.ts';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className, 
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" variant="rectangular" />
      )}
      
      {hasError ? (
        <div className="flex items-center justify-center w-full h-full bg-slate-800 text-slate-500">
          <ImageOff size={20} />
        </div>
      ) : (
        <motion.img
          loading="lazy"
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className={cn("w-full h-full object-cover", className)}
          {...(props as any)}
        />
      )}
    </div>
  );
};