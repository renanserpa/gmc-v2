import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils.ts';
import { motion } from 'framer-motion';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

/**
 * Tooltip components using Radix UI primitives.
 * TooltipProvider is updated to handle children correctly in React 18+ environments.
 */
interface TooltipProviderProps {
  children?: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

const TooltipProvider = ({ children, ...props }: TooltipProviderProps) => (
  <TooltipPrimitive.Provider {...props}>
    {children}
  </TooltipPrimitive.Provider>
);

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 shadow-md',
        className
      )}
      {...props}
    >
      <M.div
        initial={{ opacity: 0, y: 4 } as any}
        animate={{ opacity: 1, y: 0 } as any}
        transition={{ duration: 0.2 }}
      >
        {children}
      </M.div>
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };