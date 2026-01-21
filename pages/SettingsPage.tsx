import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card.tsx';
import { Settings, User, Bell, Shield, Palette, Database, ExternalLink, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Button } from '../components/ui/Button.tsx';
import { haptics } from '../lib/haptics.ts';
import { notify } from '../lib/notification.ts';

export default function SettingsPage() {
    const { profile } = useAuth();

    const handleEnvironmentPurge = () => {
        haptics.heavy();
        if (window.confirm("🚨 RESET DE FÁBRICA: Isso limpará permanentemente todos os dados de cache, banco de dados de áudio, sessões de login e configurações locais. Você será deslogado imediatamente. Confirmar?")) {
            // 1. Limpa Armazenamento Síncrono
            localStorage.clear();
            sessionStorage.clear();
            
            // 2. Limpa Banco de Dados Offline (IndexedDB)
            try {
                indexedDB.deleteDatabase('OlieMusicCache');
            } catch (e) {
                console.warn("Falha ao deletar IndexedDB:", e);
            }

            notify.warning("Purgando ecossistema... Reiniciando Kernel.");
            
            // 3. Redirecionamento forçado para a raiz
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Configurações</h1>
                <p className="text-slate-500 font-medium">Gerencie seu perfil e preferências da plataforma Maestro.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <Card className="bg-slate-900 border-white/5 overflow-hidden rounded-[32px]">
                    <CardHeader className="bg-slate-950/50 p-6 flex flex-row items-center gap-4">
                        <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl">
                            <User size={24} />
                        </div>
                        <div>
                            <CardTitle>Perfil do Mestre</CardTitle>
                            <CardDescription>Suas informações básicas na rede OlieMusic.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Nome Completo</label>
                                <input disabled value={profile?.full_name || ''} className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white text-sm opacity-60" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">E-mail Maestro</label>
                                <input disabled value={profile?.email || ''} className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white text-sm opacity-60" />
                            </div>
                        </div>
                        <Button variant="outline">Editar Perfil Público</Button>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-white/5 overflow-hidden rounded-[32px]">
                    <CardHeader className="bg-slate-950/50 p-6 flex flex-row items-center gap-4">
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
                            <Palette size={24} />
                        </div>
                        <div>
                            <CardTitle>Experiência Maestro</CardTitle>
                            <CardDescription>Personalize a interface da sua Sala de Aula.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-sm font-black text-white uppercase">Sons de Interface</p>
                                <p className="text-xs text-slate-500">Feedback sonoro ao clicar e completar ações.</p>
                            </div>
                            <div className="w-12 h-6 bg-sky-500 rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-sm font-black text-white uppercase">Modo TV Automático</p>
                                <p className="text-xs text-slate-500">Detecta HDMI e ajusta fonte das tablaturas.</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-800 rounded-full relative">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-white/5 overflow-hidden rounded-[32px]">
                    <CardHeader className="bg-slate-950/50 p-6 flex flex-row items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                            <Database size={24} />
                        </div>
                        <div>
                            <CardTitle>Backup & Dados</CardTitle>
                            <CardDescription>Segurança e portabilidade dos seus materiais.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Seus dados estão protegidos por criptografia de ponta e políticas de RLS no Supabase. Você pode exportar seu catálogo de tablaturas a qualquer momento.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="secondary" size="sm">Exportar Biblioteca (JSON)</Button>
                            <Button variant="ghost" size="sm" leftIcon={ExternalLink}>Privacidade & LGPD</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-950/10 border-red-500/20 overflow-hidden rounded-[32px] border-2">
                    <CardHeader className="bg-red-500/5 p-6 flex flex-row items-center gap-4">
                        <div className="p-3 bg-red-500/20 text-red-500 rounded-2xl">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-red-400">Manutenção Crítica</CardTitle>
                            <CardDescription className="text-red-900/60 font-bold">Limpeza profunda de ambiente.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-start gap-4 bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                            <AlertTriangle className="text-red-500 shrink-0" size={20} />
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                Se o aplicativo estiver apresentando falhas de carregamento ou comportamentos estranhos, limpe o ambiente local. Isso removerá todos os dados do navegador (localStorage/sessionStorage/IndexedDB).
                            </p>
                        </div>
                        <Button 
                            variant="danger" 
                            onClick={handleEnvironmentPurge}
                            className="w-full md:w-auto px-10 py-4"
                            leftIcon={RefreshCw}
                        >
                            Limpar Ambiente e Reiniciar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}