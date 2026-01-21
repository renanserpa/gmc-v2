

import React from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: CardDescription is now exported from ../components/ui/Card
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { linkStudentAccount } from '../services/dataService';
import { useCurrentStudent } from '../hooks/useCurrentStudent';
import { Link as LinkIcon, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uiSounds } from '../lib/uiSounds';
import { usePageTitle } from '../hooks/usePageTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { notify } from '../lib/notification';
import { cn } from '../lib/utils';

const linkSchema = z.object({
  code: z.string()
    .min(6, "O código deve ter pelo menos 6 caracteres")
    .max(10, "Código inválido")
    .regex(/^[A-Z0-9]+$/, "Use apenas letras maiúsculas e números")
});

type LinkFormData = z.infer<typeof linkSchema>;

export default function LinkStudent() {
  usePageTitle("Vincular Aluno");
  const navigate = useNavigate();
  const { refetch } = useCurrentStudent();
  const [success, setSuccess] = React.useState(false);

  const { 
    register, 
    handleSubmit, 
    setError,
    formState: { errors, isSubmitting } 
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema)
  });

  const onSubmit = async (data: LinkFormData) => {
    uiSounds.playClick();
    try {
      const result = await linkStudentAccount(data.code.trim().toUpperCase());
      
      if (result.success) {
        uiSounds.playSuccess();
        setSuccess(true);
        await refetch();
        notify.success("Sincronização concluída com sucesso!");
        setTimeout(() => navigate('/student/onboarding'), 2000);
      } else {
        uiSounds.playError();
        setError('code', { message: result.message || "Código não reconhecido pelo sistema." });
        notify.error("Falha ao vincular código.");
      }
    } catch (e) {
      uiSounds.playError();
      notify.error("Erro de comunicação com o maestro central.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-sky-500/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 ring-4 ring-sky-500/10">
              {success ? <CheckCircle size={40} className="text-green-400" /> : <LinkIcon size={40} className="text-sky-400" />}
            </div>
            <CardTitle className="text-2xl text-white">Vincular Jornada</CardTitle>
            <CardDescription>
              Insira o código alfanumérico fornecido pelo seu professor para ativar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <h3 className="text-xl font-bold text-green-400">Código Validado!</h3>
                  <p className="text-slate-400 text-sm">Preparando seu ambiente de aprendizado...</p>
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto" />
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <input
                      {...register("code")}
                      type="text"
                      placeholder="EX: ABC123"
                      className={cn(
                        "block w-full bg-slate-800 border-2 rounded-xl py-4 px-4 text-white text-center text-2xl font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:ring-4 transition-all uppercase",
                        errors.code ? "border-red-500/50 focus:ring-red-500/10" : "border-slate-700 focus:border-sky-500 focus:ring-sky-500/10"
                      )}
                    />
                    {errors.code && (
                      <p className="text-center text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.code.message as string}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-sky-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>Validar Vínculo <ArrowRight /></>}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}