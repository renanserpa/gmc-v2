import React from 'react';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock } from 'lucide-react';

interface CalendarLesson {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface CalendarViewProps {
  lessons: CalendarLesson[];
  currentDate?: Date;
}

export default function CalendarView({ lessons, currentDate = new Date() }: CalendarViewProps) {
  const weekStartsOn = 1; // Segunda-feira
  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header com os dias da semana */}
      <div className="grid grid-cols-7 text-center border-b border-slate-800 bg-slate-950/50">
        {weekDays.map(day => (
          <div key={day.toString()} className="py-4 border-r border-slate-800 last:border-r-0">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                {format(day, 'EEE', { locale: ptBR })}
            </div>
            <div className={`text-xl font-black ${isSameDay(day, new Date()) ? 'text-sky-400' : 'text-slate-200'}`}>
                {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Grid de Horários/Aulas */}
      <div className="grid grid-cols-7 h-[450px] overflow-y-auto custom-scrollbar">
        {weekDays.map(day => (
          <div key={day.toString()} className="border-r border-slate-800 p-2 last:border-r-0 min-h-full bg-slate-900/20">
            {lessons
              .filter(lesson => isSameDay(lesson.start, day))
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .map(lesson => (
                <div 
                    key={lesson.id} 
                    className="bg-sky-500/5 border border-sky-500/20 p-2.5 rounded-lg mb-2 shadow-sm hover:border-sky-500/40 transition-all group"
                >
                  <p className="font-bold text-xs text-slate-100 truncate mb-1.5 group-hover:text-sky-400 transition-colors">
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold">
                    <Clock size={10} className="text-sky-500" />
                    <span className="tracking-tighter">
                        {format(lesson.start, 'HH:mm')} - {format(lesson.end, 'HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            
            {lessons.filter(lesson => isSameDay(lesson.start, day)).length === 0 && (
                <div className="h-full flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-px h-full bg-slate-800"></div>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
