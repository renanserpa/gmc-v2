
import React, { useEffect, useState, useMemo } from 'react';
import { Student, PlayerAchievement, Profile } from '../types.ts';
import { getPlayerAchievements } from '../services/gamificationService.ts';
import { Star, Flame, Coins, Trophy, Zap, ArrowUpCircle, Music, Sparkles, Award, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './ui/UserAvatar.tsx';
import { supabase } from '../lib/supabaseClient.ts';
import { cn } from '../lib/utils.ts';
import { useAccessibility } from '../contexts/AccessibilityContext.tsx';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

interface StudentHudProps {
  student: Student;
}

const StatCard: React.FC<any> = ({ icon: Icon, label, value, colorClass, bgColorClass, borderColorClass, isStreak }) => (
    /* Use any to bypass Framer Motion's internal signature conflict */
    <M.div 
        whileHover={{ y: -2 } as any}
        className={cn("bg-slate-950/40 p-5 rounded-[28px] border flex items-center gap-5 relative overflow-hidden", borderColorClass)}
    >
        <div className={cn("p-4 rounded-2xl relative z-10", bgColorClass, colorClass)}>
            <Icon size={24} fill={isStreak ? "currentColor" : "none"} />
        </div>
        <div className="relative z-10">
            <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-1">{label}</p>
            <p className="text-xl font-black text-white tracking-tighter">{value}</p>
        </div>
    </M.div>
);

export default function StudentHud({ student }: StudentHudProps) {
  const { settings } = useAccessibility();
  const isKids = settings.uiMode === 'kids';
  
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [equippedItems, setEquippedItems] = useState<any[]>([]);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [professorProfile, setProfessorProfile] = useState<Profile | null>(null);

  const xpPercentage = useMemo(() => {
      // Fix: Handle optional xpToNextLevel safely
      const nextXp = student.xpToNextLevel || 100;
      return nextXp > 0 ? Math.min((student.xp / nextXp) * 100, 100) : 0;
  }, [student.xp, student.xpToNextLevel]);

  useEffect(() => {
    if (student?.id) {
        getPlayerAchievements(student.id).then(setAchievements);
        loadCosmetics();
        loadProfessorBadges();
    }
    const timer = setTimeout(() => setAnimatedProgress(xpPercentage), 500);
    return () => clearTimeout(timer);
  }, [student?.id, xpPercentage]);

  const loadCosmetics = async () => {
    const { data } = await supabase
        .from('store_orders')
        .select('*, store_items(metadata)')
        .eq('player_id', student.id)
        .eq('is_equipped', true);
    setEquippedItems(data || []);
  };

  const loadProfessorBadges = async () => {
    if (!student.professor_id) return;
    const { data } = await supabase.from('profiles').select('badges, reputation_points').eq('id', student.professor_id).single();
    if (data) setProfessorProfile(data as Profile);
  };

  const avatarEffects = useMemo(() => {
    let filter = '';
    let glowColor = '';
    equippedItems.forEach(order => {
        const meta = order.store_items?.metadata;
        if (meta?.filter) filter += ` ${meta.filter}`;
        if (meta?.glow) glowColor = meta.glow;
    });
    return { filter, glowColor };
  }, [equippedItems]);

  const glowColorMap: { [key: string]: string } = {
      sky: 'bg-sky-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      amber: 'bg-amber-500',
      emerald: 'bg-emerald-500',
      yellow: 'bg-yellow-500',
  };
  const glowClass = avatarEffects.glowColor ? glowColorMap[avatarEffects.glowColor] : '';

  return (
    <div className="space-y-6">
        <Card className={cn(
            "bg-obsidian border-white-faint shadow-2xl overflow-hidden relative",
            isKids ? "rounded-[64px] border-sky-500/20" : "rounded-[48px]"
        )}>
            {/* Use any to bypass Framer Motion properties error */}
            <M.div animate={{ opacity: [0.03, 0.08, 0.03] } as any} transition={{ duration: 10, repeat: Infinity } as any} className="absolute top-0 right-0 p-64 bg-sky-500/10 blur-[150px] pointer-events-none" />
            
            <CardHeader className="relative z-10 p-10 pb-6 border-none">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-8">
                        <div className="relative group">
                            {/* Use any to bypass Framer Motion properties error */}
                            <M.div 
                                style={{ filter: avatarEffects.filter }}
                                className="relative z-10"
                                whileHover={{ scale: 1.05 } as any}
                            >
                                {/* Fix: Student interface now contains optional avatar_url */}
                                <UserAvatar src={student.avatar_url} name={student.name} size={isKids ? "xl" : "lg"} className="border-4 border-white/10 shadow-2xl" />
                            </M.div>
                            
                            {avatarEffects.glowColor && (
                                <div className={cn("absolute inset-0 blur-3xl rounded-full opacity-30 animate-pulse", glowClass)} />
                            )}

                            <div className="absolute -bottom-2 -right-2 bg-sky-500 text-white p-2 rounded-2xl shadow-xl border-4 border-obsidian">
                                <Trophy size={18} fill="currentColor" />
                            </div>
                        </div>

                        <div>
                            {!isKids && (
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-sky-500/10 text-sky-400 text-[9px] font-black px-3 py-1 rounded-full border border-sky-500/20 uppercase tracking-[0.2em]">Rank N{student.current_level}</span>
                                    {student.current_streak_days > 4 && <span className="bg-orange-500/10 text-orange-500 text-[9px] font-black px-3 py-1 rounded-full border border-orange-500/20 uppercase tracking-[0.2em]">On Fire!</span>}
                                    
                                    {/* Badges do Professor */}
                                    {/* Fix: Profile interface now contains optional badges array */}
                                    {professorProfile?.badges?.map(badge => (
                                        <div key={badge} className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-[0.2em] flex items-center gap-1">
                                            <Award size={10} fill="currentColor" /> {badge}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <h2 className={cn("font-black text-white uppercase tracking-tighter leading-none", isKids ? "text-6xl" : "text-4xl")}>
                                {student.name.split(' ')[0]}
                            </h2>
                            {!isKids && (
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                                    <Music size={12} className="text-purple-500" /> {student.instrument || 'Novo Talento'}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Use any to bypass Framer Motion properties error */}
                    <M.div whileHover={{ scale: 1.02 } as any} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-6 px-10 rounded-[32px] shadow-2xl flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{isKids ? 'Minhas Moedas' : 'Olie Coins'}</span>
                        <div className="flex items-center gap-3 text-yellow-500">
                            <Coins className={isKids ? "w-10 h-10" : "w-6 h-6"} fill="currentColor"/>
                            <span className={cn("font-black tracking-tighter", isKids ? "text-6xl" : "text-4xl")}>{student.coins}</span>
                        </div>
                    </M.div>
                </div>
            </CardHeader>
            
            <CardContent className="relative z-10 p-10 pt-0 space-y-8">
                {isKids ? (
                    <div className="space-y-4">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Minha Jornada</p>
                        <div className="flex gap-4">
                            {[...Array(5)].map((_, i) => {
                                const active = animatedProgress > (i * 20);
                                return (
                                    <M.div 
                                        key={i}
                                        animate={(active ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}) as any}
                                        transition={{ duration: 2, repeat: Infinity } as any}
                                    >
                                        <Star 
                                            size={48} 
                                            className={cn(
                                                "transition-all duration-700",
                                                active ? "text-yellow-400 fill-current drop-shadow-[0_0_15px_#facc15]" : "text-slate-800"
                                            )} 
                                        />
                                    </M.div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end px-1">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Experiência Maestro</span>
                                <div className="flex items-baseline gap-2">
                                    {/* Use any to bypass Framer Motion properties error */}
                                    <M.span key={student.xp} initial={{ scale: 1.2, color: '#38bdf8' } as any} animate={{ scale: 1, color: '#fff' } as any} className="text-5xl font-black tracking-tighter">{student.xp}</M.span>
                                    {/* Fix: Student interface now contains optional xpToNextLevel */}
                                    <span className="text-slate-700 font-black text-sm">/ {student.xpToNextLevel || 100} XP</span>
                                </div>
                            </div>
                            <div className="text-right">
                                 <div className="flex items-center gap-2 text-sky-400">
                                    <Sparkles size={16} className="animate-pulse" />
                                    <span className="text-2xl font-black font-mono-technical">{Math.round(animatedProgress)}%</span>
                                 </div>
                                 <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Até o Rank N{student.current_level + 1}</p>
                            </div>
                        </div>
                        <div className="h-5 bg-slate-950 rounded-full border border-white/5 p-1 shadow-inner relative overflow-hidden">
                            {/* Use any to bypass Framer Motion properties error */}
                            <M.div 
                                initial={{ width: 0 } as any} 
                                animate={{ width: `${animatedProgress}%` } as any} 
                                transition={{ duration: 2, ease: "circOut" } as any} 
                                className="h-full bg-gradient-to-r from-sky-600 via-sky-400 to-sky-500 rounded-full relative"
                            >
                                 <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full animate-[shimmer_2s_infinite]" />
                            </M.div>
                        </div>
                    </div>
                )}

                {!isKids && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon={Star} label="Patente Atual" value={`Maestro N${student.current_level}`} colorClass="text-sky-400" bgColorClass="bg-sky-500/5" borderColorClass="border-white/5" />
                        <StatCard icon={Flame} label="Streak Diário" value={`${student.current_streak_days} Dias`} colorClass="text-orange-500" bgColorClass="bg-orange-400/5" borderColorClass="border-orange-500/10" isStreak />
                        <StatCard icon={Zap} label="Troféus" value={`${achievements.length} Badges`} colorClass="text-purple-400" bgColorClass="bg-purple-400/5" borderColorClass="border-white/5" />
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
