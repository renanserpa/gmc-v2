import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes Tailwind de forma inteligente, resolvendo conflitos de prioridade.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Variantes padrão do Framer Motion para o feeling "Maestro Juicy".
 */
export const motionVariants = {
    tap: { 
        scale: 0.96,
        transition: { type: "spring" as const, stiffness: 600, damping: 20 }
    },
    hover: { 
        scale: 1.02,
        y: -3,
        transition: { type: "spring" as const, stiffness: 400, damping: 12 }
    },
    fadeIn: {
        hidden: { opacity: 0, y: 5 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
        }
    },
    slideUp: {
        hidden: { opacity: 0, y: 24 },
        show: { 
            opacity: 1, 
            y: 0, 
            transition: { type: "spring" as const, stiffness: 300, damping: 22 } 
        }
    },
    container: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    }
};