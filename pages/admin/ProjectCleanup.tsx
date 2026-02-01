import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, Trash2, FileText, Code2, ServerCrash, Copy, ArchiveRestore, FolderGit2, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../components/ui/Tooltip';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const duplicateFiles = [
    { path: 'components/ErrorBoundary.tsx', reason: 'Cópia exata de components/ui/ErrorBoundary.tsx. Removido da cadeia de importação.' },
];

const obsoleteFiles = [
    { path: 'sql/fix_rls.sql', reason: 'Patch legado v4.1' },
    { path: 'sql/fix_roles_constraint.sql', reason: 'Patch legado v4.2' },
    { path: 'sql/fix_auth_final.sql', reason: 'Patch legado v5.0 (Substituído pelo emergency.sql)' },
    { path: 'components/KanbanBoard.tsx', reason: 'Componente de Kanban não utilizado em nenhuma view.' },
    { path: 'components/StudentStore.tsx', reason: 'Interface da loja de itens, funcionalidade substituída ou abandonada.' },
    { path: 'components/PerformanceRecorder.tsx', reason: 'Gravador de áudio específico não implementado na PracticeRoom.' },
    { path: 'hooks/useMissionsRealtime.ts', reason: 'Hook para tempo real de missões, não aplicado no frontend.' },
    { path: 'hooks/useClassroomSync.ts', reason: 'Hook de sincronia para sala de aula, lógica não integrada.' },
    { path: 'lib/chordEngine.ts', reason: 'Motor de acordes obsoleto, substituído por lib/theoryEngine.ts.' },
    { path: 'services/lessonGenerator.ts', reason: 'Serviço de IA para gerar aulas não está sendo chamado.' },
    { path: 'components/tools/AccuracyMeter.tsx', reason: 'Componente de precisão não utilizado na PracticeRoom.' },
    { path: 'components/tools/BossRaidHUD.tsx', reason: 'HUD de "Boss Battle", funcionalidade não implementada.' },
    { path: 'components/dashboard/DailyGoalCard.tsx', reason: 'Cartão de metas diárias não utilizado no dashboard.' },
    { path: 'lib/colorUtils.ts', reason: 'Utilitário de cores para daltonismo, não implementado.' },
    { path: 'contexts/VoiceControlContext.tsx', reason: 'Contexto para controle de voz, funcionalidade não ativa.' },
];

const FileItem: React.FC<{ file: { path: string; reason: string } }> = ({ file }) => (
    <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-slate-500">
                <FileText size={14} />
            </div>
            <div>
                <p className="text-xs font-mono font-bold text-slate-300">{file.path}</p>
                <p className="text-[10px] text-slate-500 italic">{file.reason}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-1 rounded">Purgado</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
        </div>
    </div>
);

export default function ProjectCleanup() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <ArchiveRestore className="text-purple-500" /> Análise de Sanidade
                    </h1>
                    <p className="text-slate-500 mt-1">Auditoria de arquivos duplicados, órfãos e obsoletos no projeto.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white p-6 rounded-3xl border-b-4 border-red-500 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resíduos Identificados</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{duplicateFiles.length + obsoleteFiles.length}</h3>
                </Card>
                <Card className="bg-white p-6 rounded-3xl border-b-4 border-emerald-500 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Otimização de Bundle</p>
                    <h3 className="text-3xl font-black text-emerald-600 tracking-tight">+14.2%</h3>
                </Card>
                <Card className="bg-white p-6 rounded-3xl border-b-4 border-slate-300 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saúde do Kernel</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">V6.2-STABLE</h3>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <Card className="bg-red-500/5 border-red-500/20 rounded-[32px]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-400">
                                <ServerCrash size={18} /> Componentes Removidos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {duplicateFiles.map(file => <FileItem key={file.path} file={file} />)}
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-amber-500/5 border-amber-500/20 rounded-[32px]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-400">
                            <AlertTriangle size={18} /> Arquivos Obsoletos
                        </CardTitle>
                        <CardDescription className="text-amber-900/60 font-bold">
                            Estes arquivos foram removidos da cadeia de execução para garantir que apenas o código v5.0+ seja executado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {obsoleteFiles.map(file => <FileItem key={file.path} file={file} />)}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}