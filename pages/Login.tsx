import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.tsx';
import { Mail, Lock, ShieldCheck, Music, AlertCircle, Loader2, Eye, EyeOff, LogOut, RefreshCw, Terminal, Code2, Users, GraduationCap, Building2 } from 'lucide-react';
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

const loginSchema = z.object({
  email: z.string()
    .min(1, "O e-mail é obrigatório")
    .email("Digite um endereço de e-mail válido")
    .trim(),
  password: z.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
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

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched'
  });

  useEffect(() => {
    if (user && !loading) {
      if (role) {
        setInternalNavigating(true);
        const fromPath = location.state?.from?.pathname;
        const destination = (fromPath && fromPath !== '/login' && fromPath.startsWith(`/${role}`)) 
          ? fromPath 
          : `/${role}`;
        
        navigate(destination, { replace: true });
      } else {
        setNoRoleDetected(true);
      }
    } else if (!user && !loading) {
      setNoRoleDetected(false);
    }
  }, [user, role, loading, navigate, location]);

  const onSubmit = async (data: LoginFormData) => {
    uiSounds.playClick();
    setNoRoleDetected(false);
    try {
      await signIn(data.email, data.password);
      notify.success("Sinfonia iniciada!");
    } catch (err: any) {
      console.error("[Login] Erro:", err);
      const message = err.message === 'Invalid login credentials' 
        ? "E-mail ou senha inválidos." 
        : "Erro de conexão ou credenciais inválidas.";
      notify.error(message);
    }
  };

  const handleDevLogin = async (roleTarget: string) => {
    uiSounds.playSuccess();
    const mockId = `dev-${roleTarget}-id`;
    await devLogin(mockId, roleTarget);
    notify.info(`Modo Dev Ativado: ${roleTarget.toUpperCase()}`);
  };

  if (internalNavigating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-4" />
        <p className="text-slate-400 font-bold animate-pulse tracking-widest uppercase text-[10px]">Afinando instrumentos...</p>
      </div>
    );
  }

  const getSuggestedRole = (emailInput: string = '') => {
    const email = emailInput.toLowerCase().trim();
    if (email === 'adm@adm.com') return { role: 'admin', name: 'God Mode Admin' };
    if (email === 'p@adm.com') return { role: 'professor', name: 'Mestre Maestro' };
    if (email === 'a@adm.com' || email === 'd@adm.com') return { role: 'student', name: 'Aluno Pro' };
    if (email === 'r@adm.com') return { role: 'guardian', name: 'Responsável Atento' };
    return { role: 'student', name: 'Novo Aluno' };
  };

  const { role: suggestedRole, name: suggestedName } = getSuggestedRole(user?.email || '');

  const repairSql = `-- Script de Reparo RLS\nINSERT INTO public.profiles (id, email, role, full_name)\nVALUES ('${user?.id}', '${user?.email}', '${suggestedRole}', '${suggestedName}')\nON CONFLICT (id) DO UPDATE SET role = '${suggestedRole}';`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-slate-950 -z-10"></div>
      
      <div className="fixed bottom-6 right-6 z-[200]">
          <button 
            onClick={() => setShowDevTools(!showDevTools)}
            className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl border-4",
                showDevTools 
                    ? "bg-purple-600 border-white text-white rotate-90" 
                    : "bg-slate-900 border-purple-500/50 text-purple-400 hover:scale-110 animate-pulse-purple"
            )}
          >
              <Code2 size={24} />
          </button>
      </div>

      <motion.div 
        variants={motionVariants.container as any}
        initial="hidden"
        animate="show"
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center space-y-2">
          <motion.div variants={motionVariants.slideUp as any} className="flex justify-center mb-6">
            <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
              <Music size={48} className="text-sky-400" />
            </div>
          </motion.div>
          <motion.h1 variants={motionVariants.slideUp as any} className="text-4xl font-black text-white tracking-tighter">
            OlieMusic <span className="text-sky-500">GCM</span>
          </motion.h1>
        </div>

        <motion.div variants={motionVariants.slideUp as any}>
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/5">
            <CardHeader className="space-y-1 pb-6 text-center border-b border-slate-800/50">
              <CardTitle className="text-2xl font-bold text-white tracking-tight">Login Maestro</CardTitle>
            </CardHeader>

            <CardContent className="pt-8">
              <AnimatePresence mode="wait">
                {showDevTools ? (
                    <motion.div
                        key="dev-tools"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-6 bg-purple-600/10 border border-purple-500/30 rounded-[32px] shadow-inner"
                    >
                        <p className="text-[10px] font-black uppercase text-purple-400 mb-4 flex items-center gap-2">
                            <Terminal size={12} /> Bypass Maestro (DevMode)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => handleDevLogin(UserRole.Student)} className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-2xl text-[10px] font-black uppercase text-purple-300 hover:bg-purple-600 hover:text-white transition-all flex flex-col items-center gap-2">
                                <Users size={20} /> Aluno
                            </button>
                            <button onClick={() => handleDevLogin(UserRole.Professor)} className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-2xl text-[10px] font-black uppercase text-purple-300 hover:bg-purple-600 hover:text-white transition-all flex flex-col items-center gap-2">
                                <GraduationCap size={20} /> Mestre
                            </button>
                            <button onClick={() => handleDevLogin(UserRole.Manager)} className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-2xl text-[10px] font-black uppercase text-purple-300 hover:bg-purple-600 hover:text-white transition-all flex flex-col items-center gap-2">
                                <Building2 size={20} /> Gestor
                            </button>
                            <button onClick={() => handleDevLogin(UserRole.Admin)} className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-2xl text-[10px] font-black uppercase text-purple-300 hover:bg-purple-600 hover:text-white transition-all flex flex-col items-center gap-2">
                                <ShieldCheck size={20} /> Admin
                            </button>
                        </div>
                    </motion.div>
                ) : null}

                {noRoleDetected ? (
                  <motion.div 
                    key="no-role"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="p-6 rounded-2xl border bg-amber-500/10 border-amber-500/30 space-y-4">
                      <div className="flex items-center gap-3 font-bold text-amber-400">
                        <AlertCircle size={24} />
                        Perfil Incompleto
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Usuário autenticado, mas o perfil não foi localizado na tabela pública.
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {/* FIX: The 'variant', 'isLoading' and 'leftIcon' props are now supported by the updated Button component */}
                      <Button variant="primary" className="w-full" onClick={() => { setRefreshing(true); refreshProfile().then(() => setRefreshing(false)); }} isLoading={refreshing} leftIcon={RefreshCw}>
                        Sincronizar
                      </Button>
                      {/* FIX: The 'variant' and 'leftIcon' props are now supported by the updated Button component */}
                      <Button variant="ghost" className="w-full text-xs" onClick={() => { signOut(); setNoRoleDetected(false); }} leftIcon={LogOut}>
                        Trocar Conta
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">E-mail</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                          <Mail size={18} />
                        </div>
                        <input {...register("email")} type="email" placeholder="maestro@oliemusic.com" disabled={isSubmitting} className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" />
                      </div>
                      {errors.email && <p className="text-[10px] text-red-400 mt-1 ml-1 font-bold">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                          <Lock size={18} />
                        </div>
                        <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" disabled={isSubmitting} className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-400">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-[10px] text-red-400 mt-1 ml-1 font-bold">{errors.password.message}</p>}
                    </div>
                    
                    {/* FIX: The 'isLoading' and 'leftIcon' props are now supported by the updated Button component */}
                    <Button type="submit" isLoading={isSubmitting} className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl" leftIcon={ShieldCheck}>
                      Entrar no Estúdio
                    </Button>
                  </form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={motionVariants.slideUp as any} className="text-center">
          <Link to="/" className="text-slate-600 hover:text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
            ← Ver Perfis da Sinfonia
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}