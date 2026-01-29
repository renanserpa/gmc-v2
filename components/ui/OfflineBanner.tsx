
import React from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  return (
    <AnimatePresence>
      {!isOnline && (
        <M.div
          initial={{ opacity: 0, y: 50 } as any}
          animate={{ opacity: 1, y: 0 } as any}
          exit={{ opacity: 0, y: 50 } as any}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 border border-red-400/50 backdrop-blur-sm font-bold text-sm">
            <WifiOff size={18} />
            <span>Você está offline. Verifique sua conexão.</span>
          </div>
        </M.div>
      )}
    </AnimatePresence>
  );
};
