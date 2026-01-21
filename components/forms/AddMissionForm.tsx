
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { notify } from '../../lib/notification';
import { Student } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { Target, FileText, Zap, User } from 'lucide-react';

const addMissionSchema = z.object({
  studentId: z.string().min(1, "Selecione um aluno"),
  title: z.string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(50, "O título deve ter no máximo 50 caracteres"),
  description: z.string()
    .max(200, "A descrição deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal('')),
  xp_reward: z.coerce.number()
    .min(10, "Mínimo de 10 XP")
    .max(500, "Máximo de 500 XP")
    .default(30)
});

export type AddMissionFormData = z.infer<typeof addMissionSchema>;

interface AddMissionFormProps {
  students: Student[];
  onAdd: (data: AddMissionFormData) => Promise<any>;
  isLoading: boolean;
}

export const AddMissionForm: React.FC<AddMissionFormProps> = ({ students, onAdd, isLoading }) => {
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch,
    formState: { errors } 
  } = useForm<AddMissionFormData>({
    resolver: zodResolver(addMissionSchema),
    defaultValues: {
      xp_reward: 30,
      description: ''
    }
  });

  const watchedStudentId = watch('studentId');

  // Inicializa o aluno selecionado caso venha uma lista
  useEffect(() => {
    if (students.length > 0 && !watchedStudentId) {
      setValue('studentId', students[0].id);
    }
  }, [students, setValue, watchedStudentId]);

  const onSubmit = async (data: AddMissionFormData) => {
    try {
      await onAdd(data);
      reset({ studentId: data.studentId, title: '', description: '', xp_reward: 30 });
      notify.success("Missão enviada para a jornada do aluno!");
    } catch (error) {
      console.error("[AddMissionForm] Erro:", error);
      notify.error("Ocorreu um erro ao criar a missão.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
      {/* SELEÇÃO DE ALUNO (Apenas se houver mais de um, caso contrário fica oculto ou desabilitado) */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-1">
          <User size={12} /> Destinatário
        </label>
        <select 
          {...register("studentId")}
          disabled={students.length <= 1}
          className={cn(
            "block w-full bg-slate-900 border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 transition-all appearance-none",
            errors.studentId ? "border-red-500/50 focus:ring-red-500/20" : "border-slate-800 focus:ring-sky-500/20",
            students.length <= 1 && "opacity-60 cursor-not-allowed"
          )}
        >
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {errors.studentId && <p className="text-[10px] text-red-400 mt-1 ml-1 font-bold">{errors.studentId.message as string}</p>}
      </div>

      {/* TÍTULO DA MISSÃO */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-1">
          <Target size={12} /> Título da Missão
        </label>
        <div className="relative group">
          <input 
            {...register("title")}
            placeholder="Ex: Praticar Escala de Dó Maior" 
            disabled={isLoading}
            className={cn(
              "block w-full bg-slate-900 border rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 transition-all",
              errors.title ? "border-red-500/50 focus:ring-red-500/20" : "border-slate-800 focus:ring-sky-500/20 hover:border-slate-700"
            )} 
          />
        </div>
        {errors.title && <p className="text-[10px] text-red-400 mt-1 ml-1 font-bold">{errors.title.message as string}</p>}
      </div>

      {/* DESCRIÇÃO / INSTRUÇÕES */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-1">
          <FileText size={12} /> Instruções (Opcional)
        </label>
        <textarea 
          {...register("description")}
          placeholder="Dê dicas or detalhes sobre como praticar..." 
          disabled={isLoading}
          rows={3}
          className={cn(
            "block w-full bg-slate-900 border rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 transition-all resize-none",
            errors.description ? "border-red-500/50 focus:ring-red-500/20" : "border-slate-800 focus:ring-sky-500/20 hover:border-slate-700"
          )} 
        />
        {errors.description && <p className="text-[10px] text-red-400 mt-1 ml-1 font-bold">{errors.description.message as string}</p>}
      </div>

      {/* RECOMPENSA DE XP */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-1">
          <Zap size={12} /> Recompensa de XP
        </label>
        <input 
          {...register("xp_reward")}
          type="number"
          disabled={isLoading}
          className={cn(
            "block w-full bg-slate-900 border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 transition-all",
            errors.xp_reward ? "border-red-500/50 focus:ring-red-500/20" : "border-slate-800 focus:ring-sky-500/20 hover:border-slate-700"
          )} 
        />
        {errors.xp_reward && <p className="text-[10px] text-red-400 mt-1 ml-1 font-bold">{errors.xp_reward.message as string}</p>}
      </div>

      <div className="pt-2">
        <Button 
          type="submit" 
          isLoading={isLoading} 
          className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-sky-950/20"
        >
          {isLoading ? "Enviando..." : "Lançar Missão na Jornada"}
        </Button>
      </div>
    </form>
  );
};
