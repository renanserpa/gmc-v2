import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  height?: string | number;
  width?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  height,
  width
}) => {
  // Use animate-pulse for a stable, pleasing loading effect instead of shimmer which might shift layout if not absolutely positioned
  const baseStyles = "animate-pulse bg-slate-800/80 rounded-md";
  
  let variantStyles = "";
  switch (variant) {
    case 'circular':
      variantStyles = "rounded-full";
      break;
    case 'text':
      variantStyles = "h-4 w-3/4";
      break;
    case 'rectangular':
    case 'card':
      variantStyles = "rounded-xl";
      break;
  }

  const style: any = {};
  if (height) style.height = height;
  if (width) style.width = width;

  return (
    <div 
      className={cn(baseStyles, variantStyles, className)} 
      style={style}
    ></div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
       {/* HUD Skeleton */}
       <div className="w-full h-64 bg-slate-900 rounded-[48px] border border-white/5 p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
             <div className="space-y-4">
                <Skeleton variant="text" width={150} />
                <Skeleton variant="text" height={48} width={320} />
             </div>
             <Skeleton variant="circular" width={80} height={80} />
          </div>
          <div className="flex gap-4 mt-8">
             <Skeleton variant="rectangular" className="flex-1 h-24" />
             <Skeleton variant="rectangular" className="flex-1 h-24" />
             <Skeleton variant="rectangular" className="flex-1 h-24" />
          </div>
       </div>

       {/* Actions Skeleton */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={100} />
       </div>

       {/* Grid Skeleton */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
             <Skeleton variant="text" width={200} />
             <Skeleton variant="card" height={400} />
          </div>
          <div className="lg:col-span-4 space-y-6">
             <Skeleton variant="text" width={180} />
             <Skeleton variant="card" height={250} />
             <Skeleton variant="card" height={250} />
          </div>
       </div>
    </div>
  )
}