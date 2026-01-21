import React from 'react';
import { LazyImage } from './LazyImage.tsx';
import { cn } from '../../lib/utils.ts';

interface UserAvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  src, 
  name, 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div 
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center font-bold text-white shadow-inner border-2 border-opacity-20 bg-slate-700 border-white shrink-0", 
        sizeClasses[size], 
        className
      )}
    >
      {src ? (
        <LazyImage 
          src={src} 
          alt={name} 
          className="w-full h-full"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};