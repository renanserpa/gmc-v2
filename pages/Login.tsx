import React, { useEffect, useState } from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate, useLocation, Link } = RRD as any;
import { useAuth } from '../contexts/AuthContext.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Mail, Lock, ShieldCheck, Music, AlertCircle, Loader2, Eye, EyeOff, LogOut, RefreshCw, Terminal, Code2, Users, GraduationCap, Building2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { notify } from '../lib/notification.ts';
import { uiSounds } from '../lib/uiSounds.ts';
import { usePageTitle } from '../hooks/usePageTitle.ts';
import { Button } from '../components/ui/Button.tsx';
import { cn, motionVariants } from '../lib/utils.ts';
import { UserRole } from '../types.ts';

// FIX: Casting motion components to any
const M = motion as any;

const loginSchema = z.object({
  email: z.string().min(1, "O e-mail é obrigatório").email("E-mail inválido").trim(),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  usePageTitle("Acessar Plataforma");
  const { signIn, signOut, refreshProfile, devLogin, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [noRoleDetected, setNoRoleDetected] = useState(false);
  const [internalNavigating, setInternalNavigating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    if (user && !loading) {
      if (role) {
        setInternalNavigating(true);
        const fromPath = location.state?.from?.pathname;
        const destination = (fromPath && fromPath !== '/login' && fromPath.startsWith(`/${role}`)) 
          ? fromPath : `/${role}`;
        navigate(destination, { replace: true });
      } else {
        setNoRoleDetected(true);
      }
    } else {
      setNoRoleDetected(false);
    }
  }, [user, role, loading]);

  const onSubmit = async (data: LoginFormData) => {
    uiSounds.playClick();
    try {
      await signIn(data.email, data.password);
    } catch (err: any) {
      notify.error("Credenciais inválidas ou erro de conexão.");
    }
  };

  const handleDevLogin = async (roleTarget: string) => {
    uiSounds.playSuccess();
    // UUIDs reais que batem com o seed do setup.sql
    const roleMap: Record<string, string> = {
        admin: '45990533-ad8e-44f7-918f-70df3b2659b2',
        professor: '65c7ca9a-028b-45d3-9736-2f1dce6221be',
        student: '3c0c686d-fff6-404d-baf8-9f1b25e9e842'
    };
    await devLogin(roleMap[roleTarget] || 'mock-id', roleTarget);
  };

  if (internalNavigating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative mb-8">
            <div className="absolute -inset-8 bg-sky-500/20 blur-3xl rounded-full animate-pulse" />
            <Loader2 className="w-12 h-12 text-sky-500 animate-spin relative z-10" />
        </div>
        <p className="text-slate-400 font-black animate-pulse tracking-[0.3em] uppercase text-[10px]">Maestro Kernel Booting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-slate-950 -z-10"></div>
      
      <div className="fixed bottom-6 right-6 z-[200]">
          <button 
            onClick={() => setShowDevTools(!showDevTools)}
            className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl border-4",
                showDevTools ? "bg-purple-600 border-white text-white rotate-90" : "bg-slate-900 border-purple-500/50 text-purple-400"
            )}
          >
              <Code2 size={24} />
          </button>
      </div>

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
              <CardTitle className="text-xl font-black text-white uppercase tracking-widest">Acesso Maestro</CardTitle>
            </CardHeader>

            <CardContent className="pt-8">
              <AnimatePresence mode="wait">
                {showDevTools && (
                    <M.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mb-6 grid grid-cols-2 gap-3 bg-purple-600/5 p-4 rounded-3xl border border-purple-500/20">
                        <button onClick={() => handleDevLogin('admin')} className="p-3 bg-slate-900 rounded-xl text-[9px] font-black uppercase text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white transition-all">Super Admin</button>
                        <button onClick={() => handleDevLogin('professor')} className="p-3 bg-slate-900 rounded-xl text-[9px] font-black uppercase text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white transition-all">Professor</button>
                        <button onClick={() => handleDevLogin('student')} className="p-3 bg-slate-900 rounded-xl text-[9px] font-black uppercase text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white transition-all">Aluno Demo</button>
                        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-3 bg-red-950/20 rounded-xl text-[9px] font-black uppercase text-red-500 border border-red-500/20">Reset Kernel</button>
                    </M.div>
                )}

                {noRoleDetected ? (
                  <M.div key="no-role" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
                    <div className="p-8 rounded-[32px] border bg-amber-500/5 border-amber-500/20 space-y-4">
                      <AlertCircle size={48} className="text-amber-500 mx-auto" />
                      <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Sincronia Pendente</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mt-2">
                          Usuário autenticado, mas seu perfil não foi localizado na camada pública. Isso pode ser um delay de rede.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <Button variant="primary" className="w-full py-6 rounded-2xl font-black uppercase tracking-widest" onClick={() => { setRefreshing(true); refreshProfile().then(() => setRefreshing(false)); }} isLoading={refreshing} leftIcon={RefreshCw}>
                        Forçar Sincronia
                      </Button>
                      <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-slate-500" onClick={signOut} leftIcon={LogOut}>
                        Sair e tentar outra conta
                      </Button>
                    </div>
                  </M.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input {...register("email")} type="email" placeholder="maestro@oliemusic.com" className="block w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all" />
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
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </M.div>
        
        <M.div variants={motionVariants.slideUp as any} className="text-center">
          <Link to="/" className="text-slate-600 hover:text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
            ← Ver Perfis da Sinfonia
          </Link>
        </M.div>
      </M.div>
    </div>
  );
}