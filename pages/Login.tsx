
import React, { useEffect, useState } from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate, useLocation, Link } = RRD as any;
import { useAuth } from '../contexts/AuthContext.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Mail, Lock, ShieldCheck, Music, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { notify } from '../lib/notification.ts';
import { uiSounds } from '../lib/uiSounds.ts';
import { usePageTitle } from '../hooks/usePageTitle.ts';
import { Button } from '../components/ui/Button.tsx';
import { motionVariants } from '../lib/utils.ts';

const M = motion as any;

const loginSchema = z.object({
  email: z.string().min(1, "O e-mail é obrigatório").email("E-mail inválido").trim(),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  usePageTitle("Acessar Plataforma");
  const { signIn, user, actingRole, loading, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  // REDIRECIONAMENTO BASEADO EM PERSONA ATIVA
  useEffect(() => {
    if (user && !loading && actingRole) {
      // Caso especial do Professor Renan
      if (user.email === 'serparenan@gmail.com') {
        navigate('/', { replace: true });
        return;
      }

      const targetPath = getDashboardPath(actingRole);
      const from = location.state?.from?.pathname || targetPath;
      const finalDest = from === '/login' ? targetPath : from;
      
      navigate(finalDest, { replace: true });
    }
  }, [user, actingRole, loading, navigate, getDashboardPath, location.state]);

  const onSubmit = async (data: LoginFormData) => {
    uiSounds.playClick();
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) throw error;
      notify.success("Identidade Maestro confirmada!");
    } catch (err: any) {
      console.error("[Login] Erro:", err);
      notify.error("Credenciais inválidas ou falha na rede.");
    }
  };

  if (user && loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="p-10 bg-slate-900 rounded-[48px] border border-white/5 shadow-2xl flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] text-center">Sincronizando Perfil Pedagógico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-slate-950 -z-10"></div>
      
      <M.div variants={motionVariants.container as any} initial="hidden" animate="show" className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <M.div variants={motionVariants.slideUp as any} className="flex justify-center mb-6">
            <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl">
              <Music size={48} className="text-sky-400" />
              <Sparkles className="absolute -top-2 -right-2 text-sky-500 animate-pulse" />
            </div>
          </M.div>
          <M.h1 variants={motionVariants.slideUp as any} className="text-4xl font-black text-white tracking-tighter uppercase italic">
            OlieMusic <span className="text-sky-500">GCM</span>
          </M.h1>
        </div>

        <M.div variants={motionVariants.slideUp as any}>
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[40px]">
            <CardHeader className="space-y-1 pb-6 text-center border-b border-white/5">
              <CardTitle className="text-xl font-black text-white uppercase tracking-widest">Login Maestro</CardTitle>
            </CardHeader>

            <CardContent className="pt-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input {...register("email")} type="email" placeholder="seu@email.com" className="block w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all" />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-400 mt-1 ml-1 font-bold">{errors.email.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="block w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" isLoading={isSubmitting} className="w-full py-8 rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-sky-900/20" leftIcon={ShieldCheck}>
                  Entrar no Estúdio
                </Button>
              </form>
            </CardContent>
          </Card>
        </M.div>
        
        <M.div variants={motionVariants.slideUp as any} className="text-center">
          <Link to="/" className="text-slate-600 hover:text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
            ← Voltar para a Home
          </Link>
        </M.div>
      </M.div>
    </div>
  );
}
