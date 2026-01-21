
import React, { useEffect, useState } from 'react';
import { Plus, User, Music, GraduationCap, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { notify } from '../../lib/notification';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { getMusicClasses } from '../../services/dataService';
import { MusicClass } from '../../types';

const INSTRUMENTS = ['Violão', 'Guitarra', 'Baixo', 'Ukulele', 'Bateria', 'Piano', 'Voz'];
const GRADES = ['1º Ano Fund.', '2º Ano Fund.', '3º Ano Fund.', '4º Ano Fund.', '5º Ano Fund.', '6º Ano Fund.', '7º Ano Fund.', '8º Ano Fund.', '9º Ano Fund.', '1º Ano Médio', '2º Ano Médio', '3º Ano Médio', 'Adulto'];

const addStudentSchema = z.object({
  name: z.string().min(2, "Nome curto demais").max(50),
  instrument: z.string().min(1, "Selecione um instrumento"),
  school_grade: z.string().min(1, "Selecione a série"),
  class_id: z.string().optional()
});

type AddStudentFormData = z.infer<typeof addStudentSchema>;

interface AddStudentFormProps {
    onAdd: (data: any) => Promise<any>;
    isLoading: boolean;
}

export const AddStudentForm: React.FC<AddStudentFormProps> = ({ onAdd, isLoading }) => {
    const { user } = useAuth();
    const [classes, setClasses] = useState<MusicClass[]>([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<AddStudentFormData>({
        resolver: zodResolver(addStudentSchema)
    });

    useEffect(() => {
        if (user?.id) getMusicClasses(user.id).then(setClasses);
    }, [user]);
    
    const onSubmit = async (data: AddStudentFormData) => {
        try {
            await onAdd({
                ...data,
                professor_id: user.id
            });
            reset();
            notify.success(`Aluno ${data.name} pronto para a jornada!`);
        } catch (error: any) {
            notify.error("Erro ao salvar aluno.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input {...register("name")} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Instrumento</label>
                    <select {...register("instrument")} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white appearance-none">
                        <option value="">Selecione...</option>
                        {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Série Escolar</label>
                    <select {...register("school_grade")} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white appearance-none">
                        <option value="">Selecione...</option>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-1">
                    <Users size={12} /> Turma Maestro (Opcional)
                </label>
                <select {...register("class_id")} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white appearance-none">
                    <option value="">Aula Individual / Sem Turma</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.start_time} - {c.age_group})</option>
                    ))}
                </select>
            </div>

            <div className="pt-4">
                <Button type="submit" isLoading={isLoading} className="w-full py-4 text-xs uppercase tracking-widest font-black" leftIcon={Plus}>
                    Finalizar Cadastro Pro
                </Button>
            </div>
        </form>
    );
}
