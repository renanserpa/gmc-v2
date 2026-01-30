
import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/gamificationService.ts';
import { UserAvatar } from './ui/UserAvatar.tsx';
import { Trophy, Flame, Star, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils.ts';
// FIX: Added useTheme import to get schoolId
import { useTheme } from '../contexts/ThemeContext.tsx';

// FIX: Casting motion components to any to bypass property errors
const M = motion as any;

interface LeaderboardProps {
  professorId: string;
  currentStudentId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ professorId, currentStudentId }) => {
  // FIX: Accessing activeSchool from ThemeContext
  const { activeSchool } = useTheme();
  const [ranks, setRanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Passing schoolId (required by getLeaderboard)
    const schoolId = activeSchool?.id || "";
    getLeaderboard(professorId, schoolId).then(data => {
      setRanks(data);
      setLoading(false);
    });
  }, [professorId, activeSchool?.id]);

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-14 w-full bg-slate-900/50 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-3">
      {ranks.map((player, idx) => {
        const isTop3 = idx < 3;
        const isCurrent = player.id === currentStudentId;
        
        return (
          <M.div
            key={player.id}
            initial={{ opacity: 0, x: -10 } as any}
            animate={{ opacity: 1, x: 0 } as any}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "flex items-center gap-4 p-3 rounded-2xl border transition-all",
              isCurrent ? "bg-sky-500/10 border-sky-500/50 shadow-lg" : "bg-slate-900/40 border-slate-800",
              isTop3 && idx === 0 ? "border-yellow-500/30" : ""
            )}
          >
            {/* Rank Position */}
            <div className="w-8 flex justify-center">
              {idx === 0 ? <Crown size={20} className="text-yellow-500" /> :
               idx === 1 ? <Trophy size={18} className="text-slate-400" /> :
               idx === 2 ? <Trophy size={18} className="text-amber-700" /> :
               <span className="text-xs font-black text-slate-600">#{idx + 1}</span>}
            </div>

            {/* Avatar */}
            <UserAvatar name={player.name} src={player.avatar_url} size="sm" className={isTop3 ? "border-sky-400/50" : ""} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={cn("text-xs font-black truncate", isCurrent ? "text-sky-400" : "text-slate-200")}>
                {player.name} {isCurrent && "(Você)"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Nível {player.current_level}</span>
                 {player.current_streak_days > 0 && (
                   <div className="flex items-center gap-0.5 text-[10px] font-black text-orange-500 uppercase">
                     <Flame size={10} fill="currentColor" /> {player.current_streak_days}
                   </div>
                 )}
              </div>
            </div>

            {/* XP Badge */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-[10px] font-black text-white bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <Star size={10} className="text-sky-400" fill="currentColor" /> {player.xp}
              </div>
            </div>
          </M.div>
        );
      })}
    </div>
  );
};
