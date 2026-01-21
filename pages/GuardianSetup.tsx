

import React from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: CardDescription is now exported from ../components/ui/Card
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { linkGuardianAccount } from '../services/dataService';
import { Link as LinkIcon, ArrowRight, Loader2, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uiSounds } from '../lib/uiSounds';
import { usePageTitle } from '../hooks/usePageTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { notify } from '../lib/notification';
import { cn } from '../lib/utils';

const guardianLinkSchema = z.object({
  code: z.string()
    .min(6, "O código deve ter pelo menos 6 caracteres")
    .regex(/^[A-Z0-9]+$/, "Use apenas letras e números")
});

type GuardianLinkFormData = z.infer<typeof guardianLinkSchema>;

export default function GuardianSetup() {
  usePageTitle("Vincular Aluno");
  const navigate = useNavigate();
  const [success, setSuccess] = React.useState(false);

  const { 
    register, 
    handleSubmit, 
    setError,
    formState: { errors, isSubmitting } 
  } = useForm<GuardianLinkFormData>({
    resolver: zodResolver(guardianLinkSchema)
  });

  const onSubmit = async (data: GuardianLinkFormData) => {
    uiSounds.playClick();
    try {
      const result = await linkGuardianAccount(data.code.trim().toUpperCase());
      
      if (result.success) {
        uiSounds.playSuccess();
        setSuccess(true);
        notify.success("Vínculo de responsável ativado!");
        setTimeout(() => navigate('/guardian'), 2000);
      } else {
        uiSounds.playError();
        setError('code', { message: result.message || "Código de aluno não localizado." });
        notify.error("Falha no vínculo.");
      }
    } catch (e) {
      uiSounds.playError();
      notify.error("Erro ao processar solicitação.");
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
            <div className="mx-auto bg-green-500/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 ring-4 ring-green-500/10">
              {success ? <CheckCircle size={40} className="text-green-400" /> : <UserPlus size={40} className="text-green-400" />}
            </div>
            <CardTitle className="text-2xl text-white">Vínculo Guardião</CardTitle>
            <CardDescription>
              Acompanhe o progresso musical. Insira o código de aluno para vincular este perfil ao seu dependente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8 space-y-3"
                >
                  <h3 className="text-xl font-bold text-green-400">Vínculo Ativo!</h3>
                  <p className="text-slate-400 text-sm">Redirecionando para o painel de monitoramento...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <input
                      {...register("code")}
                      type="text"
                      placeholder="CÓDIGO (EX: A1B2C3)"
                      className={cn(
                        "block w-full bg-slate-800 border-2 rounded-xl py-4 px-4 text-white text-center text-2xl font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:ring-4 transition-all uppercase",
                        errors.code ? "border-red-500/50 focus:ring-red-500/10" : "border-slate-700 focus:border-green-500 focus:ring-green-500/10"
                      )}
                    />
                    <p className="text-[10px] text-center text-slate-500 mt-2 font-bold uppercase tracking-wider">Solicite o código ao professor ou ao aluno.</p>
                    {errors.code && (
                      <p className="text-center text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.code.message as string}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>Vincular Agora <ArrowRight /></>}
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