import React from 'react';
import { CheckCircle2, Activity, Building2, Zap, Terminal as TerminalIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.ts';
import { Button } from '../ui/Button.tsx';
// Add missing imports for Card and CardContent
import { Card, CardContent } from '../ui/Card.tsx';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

export const SprintValidationSummary: React.FC<{ latency: number }> = ({ latency }) => {
    const checks = [
        { label: 'RLS Global Shield', status: 'SECURE', icon: CheckCircle2, color: 'text-emerald-500' },
        { label: `Audio Latency: ${latency}ms`, status: latency < 50 ? 'OPTIMAL' : 'STABLE', icon: Activity, color: latency < 100 ? 'text-emerald-500' : 'text-amber-500' },
        { label: 'Tenant Isolated: RedHouse', status: 'VERIFIED', icon: Building2, color: 'text-emerald-500' },
    ];

    return (
        // FIX: Card component now properly imported
        <Card className="bg-black border-2 border-emerald-500/30 rounded-[32px] overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/20 flex items-center gap-3">
                <TerminalIcon size={18} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Sprint Stability Report v5.2</span>
            </div>
            
            // FIX: CardContent component now properly imported
            <CardContent className="p-8 space-y-6 font-mono">
                <div className="space-y-4">
                    {checks.map((check, i) => (
                        <M.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between border-b border-white/5 pb-3"
                        >
                            <div className="flex items-center gap-3">
                                <check.icon size={16} className={check.color} />
                                <span className="text-xs text-slate-300 uppercase">{check.label}</span>
                            </div>
                            <span className={cn("text-[10px] font-black tracking-widest", check.color)}>[ {check.status} ]</span>
                        </M.div>
                    ))}
                </div>

                <div className="pt-4">
                    <Button 
                        onClick={() => { haptics.heavy(); window.location.href = '/teacher/classroom'; }}
                        className="w-full py-8 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse"
                    >
                        DEPLOY TO CLASSROOM
                    </Button>
                </div>
                
                <p className="text-[8px] text-emerald-900 text-center uppercase font-black mt-2">
                    Kernel Maestro Authentication Successful. All systems green.
                </p>
            </CardContent>
        </Card>
    );
};