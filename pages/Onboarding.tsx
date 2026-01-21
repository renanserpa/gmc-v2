import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useCurrentStudent } from '../hooks/useCurrentStudent.ts';
import { updateStudent } from '../services/dataService.ts';
import { supabase } from '../lib/supabaseClient.ts';
import { Card, CardContent } from '../components/ui/Card.tsx';
import { Music2, Guitar, Mic2, ArrowRight, Check, Sparkles, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import { AVATARS_LIST, INSTRUMENTS_LIST } from '../constants.ts';

export default function Onboarding() {
  const { user } = useAuth();
  const { student, refetch } = useCurrentStudent();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  // Map instruments to icons and styles locally for UI presentation
  const instrumentConfig: Record<string, any> = {
    'Violão': { icon: Guitar, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/50' },
    'Guitarra': { icon: Zap, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/50' },
    'Ukulele': { icon: Music2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/50' },
    'Canto': { icon: Mic2, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/50' },
  };

  const handleFinish = async () => {
    if (!student || !selectedInstrument) return;
    setLoading(true);

    try {
        // 1. Atualizar Tabela Relacional (Students) - Para o professor ver
        await updateStudent(student.id, {
            instrument: selectedInstrument,
            avatar_url: selectedAvatar
        });

        // 2. Atualizar Metadados de Autenticação (Auth) - Para o avatar aparecer no header instantaneamente
        if (selectedAvatar) {
            // Cast supabase.auth to any to fix updateUser missing property error
            const { error } = await (supabase.auth as any).updateUser({
                data: { avatar_url: selectedAvatar }
            });
            if (error) console.error("Erro ao atualizar metadata de auth:", error);
        }
        
        // 3. Recarregar dados locais e redirecionar
        await refetch();
        navigate('/student');
    } catch (e) {
        console.error("Onboarding error:", e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-2xl w-full">
            {/* PROGRESS BAR */}
            <div className="flex justify-center mb-8 gap-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-sky-500' : 'w-4 bg-slate-800'}`}></div>
                ))}
            </div>

            {/* STEP 1: WELCOME */}
            {step === 1 && (
                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="inline-block p-6 rounded-full bg-sky-500/10 mb-4 ring-4 ring-sky-500/10 shadow-[0_0_50px_rgba(14,165,233,0.3)]">
                        <Sparkles size={64} className="text-sky-400 animate-pulse" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                        Sua Jornada Começa!
                    </h1>
                    <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
                        Olá, <span className="text-sky-400 font-bold">{student?.name || user?.user_metadata?.name}</span>! 
                        <br/>Antes de pegarmos o instrumento, precisamos configurar seu perfil de músico.
                    </p>
                    
                    <button 
                        onClick={() => setStep(2)}
                        className="group bg-sky-600 hover:bg-sky-500 text-white px-10 py-4 rounded-full text-xl font-bold shadow-lg shadow-sky-900/40 transition-all hover:scale-105 hover:-translate-y-1 flex items-center gap-3 mx-auto"
                    >
                        Vamos lá <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {/* STEP 2: AVATAR SELECTION */}
            {step === 2 && (
                <Card className="animate-in slide-in-from-right duration-500 border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Escolha seu Herói</h2>
                            <p className="text-slate-400">Como você quer aparecer para seu professor?</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {AVATARS_LIST.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedAvatar(url)}
                                    className={`relative p-2 rounded-2xl transition-all duration-300 group ${
                                        selectedAvatar === url
                                        ? 'bg-sky-500/20 ring-4 ring-sky-500 scale-105 z-10'
                                        : 'bg-slate-800 hover:bg-slate-700 hover:scale-105'
                                    }`}
                                >
                                    <img 
                                        src={url} 
                                        alt={`Avatar ${idx}`} 
                                        className="w-full h-auto rounded-xl shadow-sm group-hover:shadow-md transition-shadow" 
                                    />
                                    {selectedAvatar === url && (
                                        <div className="absolute -top-3 -right-3 bg-sky-500 text-white rounded-full p-1.5 shadow-lg animate-in zoom-in duration-300">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mt-8">
                             <button 
                                onClick={() => setStep(1)}
                                className="text-slate-500 hover:text-slate-300 font-bold flex items-center gap-2 px-4 py-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={18}/> Voltar
                            </button>
                            <button 
                                onClick={() => setStep(3)}
                                disabled={!selectedAvatar}
                                className="bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
                            >
                                Continuar <ArrowRight size={20} />
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* STEP 3: INSTRUMENT SELECTION */}
            {step === 3 && (
                <Card className="animate-in slide-in-from-right duration-500 border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Seu Poder Musical</h2>
                            <p className="text-slate-400">Qual instrumento você está aprendendo?</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {INSTRUMENTS_LIST.map((inst) => {
                                const config = instrumentConfig[inst.id] || instrumentConfig['Violão'];
                                const Icon = config.icon;
                                
                                return (
                                    <button
                                        key={inst.id}
                                        onClick={() => setSelectedInstrument(inst.id)}
                                        className={`relative p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-300 group ${
                                            selectedInstrument === inst.id
                                            ? `${config.bg} ${config.border} scale-105 shadow-[0_0_30px_rgba(0,0,0,0.3)] z-10`
                                            : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750 opacity-80 hover:opacity-100'
                                        }`}
                                    >
                                        <div className={`p-4 rounded-full bg-slate-950/50 ${selectedInstrument === inst.id ? 'scale-110' : ''} transition-transform`}>
                                            <Icon size={32} className={config.color} />
                                        </div>
                                        <span className={`font-bold text-lg ${selectedInstrument === inst.id ? 'text-white' : 'text-slate-400'}`}>{inst.label}</span>
                                        
                                        {selectedInstrument === inst.id && (
                                            <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1 animate-in zoom-in">
                                                <Check size={12} className="text-white" strokeWidth={3}/>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800">
                             <button 
                                onClick={() => setStep(2)}
                                className="text-slate-500 hover:text-slate-300 font-bold flex items-center gap-2 px-4 py-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={18} /> Voltar
                            </button>
                            <button 
                                onClick={handleFinish}
                                disabled={!selectedInstrument || loading}
                                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-slate-700 disabled:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-900/20 active:scale-95"
                            >
                                {loading ? (
                                    <><Loader2 className="animate-spin" /> Salvando...</>
                                ) : (
                                    <>Confirmar e Começar <Check size={20} /></>
                                )}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}
