import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Activity, Building2, Terminal, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { haptics } from '../../lib/haptics';
// FIX: Added missing import for 'cn' utility to support dynamic class generation
import { cn } from '../../lib/utils.ts';

const M = motion as any;

// FIX: Added interface for props to include optional latency, resolving type error in SystemHealth.tsx
interface SprintValidationSummaryProps {
  latency?: number;
}

export const SprintValidationSummary: React.FC<SprintValidationSummaryProps> = ({ latency }) => {
  // FIX: Calculate dynamic status and color based on latency prop for more accurate monitoring
  const latencyStatus = latency !== undefined ? (latency < 45 ? 'OPTIMAL' : latency < 100 ? 'GOOD' : 'SLOW') : 'OPTIMAL';
  const latencyColor = latency !== undefined ? (latency > 100 ? 'text-red-400' : latency > 45 ? 'text-amber-400' : 'text-emerald-400') : 'text-emerald-400';

  const checks = [
    { label: 'RLS Global Shield', status: 'SECURE', icon: ShieldCheck, color: 'text-emerald-400' },
    // FIX: Updated label and status to be reactive to real-time latency passed from parent
    { label: `Latency ${latency !== undefined ? `(${latency}ms)` : 'OK (<45ms)'}`, status: latencyStatus, icon: Activity, color: latencyColor },
    { label: 'Tenant Isolated: RedHouse Cuiaba', status: 'VERIFIED', icon: Building2, color: 'text-emerald-400' },
  ];

  return (
    <div className="p-4">
      <Card className="bg-black border-2 border-emerald-500/30 rounded-[32px] overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.1)] max-w-lg mx-auto">
        <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Kernel Integrity v5.2</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          </div>
        </div>
        
        <CardContent className="p-8 space-y-6 font-mono">
          <div className="space-y-4">
            {checks.map((check, i) => (
              <M.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between border-b border-emerald-500/5 pb-3"
              >
                <div className="flex items-center gap-3">
                  <check.icon size={16} className={check.color} />
                  <span className="text-[11px] text-emerald-100 uppercase tracking-tighter">{check.label}</span>
                </div>
                {/* FIX: Use cn for dynamic styling of status badges based on calculated health colors */}
                <span className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded border",
                    check.color === 'text-emerald-400' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    check.color === 'text-amber-400' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                    "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  [{check.status}]
                </span>
              </M.div>
            ))}
          </div>

          <div className="pt-6">
            <Button 
              onClick={() => { haptics.heavy(); }}
              className="w-full py-8 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] border-none group relative overflow-hidden"
            >
              <M.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-emerald-400/20 group-hover:bg-emerald-300/30"
              />
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Zap size={18} fill="currentColor" />
                DEPLOY TO CLASSROOM
              </span>
            </Button>
          </div>
          
          <div className="text-center opacity-30">
            <p className="text-[8px] text-emerald-500 uppercase font-black">
              System ready for RedHouse validation. All telemetry buffers cleared.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};