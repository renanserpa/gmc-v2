
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { LottiePlayer } from './LottiePlayer';

interface EmptyStateProps {
  icon?: LucideIcon;
  animationUrl?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, animationUrl, title, description, action }) => {
  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-800"
    >
      {animationUrl ? (
        <div className="w-40 h-40 mb-4">
            <LottiePlayer animationUrl={animationUrl} />
        </div>
      ) : (
        Icon && (
          <div className="bg-slate-800/50 p-4 rounded-full mb-4 relative group">
            <div className="absolute inset-0 bg-sky-500/10 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
            <motion.div
                animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
            >
                <Icon size={48} className="text-slate-600 relative z-10" />
            </motion.div>
          </div>
        )
      )}
      <h3 className="text-lg font-bold text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {action && 
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {action}
        </motion.div>
      }
    </motion.div>
  );
};
