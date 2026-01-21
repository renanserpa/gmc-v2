import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, Trash2, FileText, Code2, ServerCrash, Copy, ArchiveRestore, FolderGit2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../components/ui/Tooltip';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const duplicateFiles = [
    { path: 'haptics.ts', reason: 'Cópia exata de lib/haptics.ts, que já está em uso.' },
];

const obsoleteFiles = [
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

const nonBuildFiles = [
    { path: 'docs/*', reason: 'Pasta de documentação interna, essencial para o projeto mas não para o build.' },
    { path: 'CONTRIBUTING.md', reason: 'Guia de contribuição para desenvolvedores.' },
    { path: 'data/schemaDefaults.ts', reason: 'Contém um schema SQL obsoleto como string, serve como documentação.' },
    { path: 'vite.config.ts', reason: 'Arquivo de configuração para o builder Vite, não utilizado neste ambiente.' },
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
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Button size="sm" variant="ghost" disabled className="text-slate-700">
                        <Trash2 size={14} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Exclusão desabilitada no modo sandbox.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arquivos Duplicados</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{duplicateFiles.length}</h3>
                </Card>
                <Card className="bg-white p-6 rounded-3xl border-b-4 border-amber-500 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Componentes Órfãos</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{obsoleteFiles.length}</h3>
                </Card>
                <Card className="bg-white p-6 rounded-3xl border-b-4 border-slate-300 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Docs & Configs</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{nonBuildFiles.length}</h3>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <Card className="bg-red-500/5 border-red-500/20 rounded-[32px]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-400">
                                <ServerCrash size={18} /> Duplicatas Críticas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {duplicateFiles.map(file => <FileItem key={file.path} file={file} />)}
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-white/5 rounded-[32px]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-400">
                                <FolderGit2 size={18} /> Documentação & Configs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {nonBuildFiles.map(file => <FileItem key={file.path} file={file} />)}
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-amber-500/5 border-amber-500/20 rounded-[32px]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-400">
                            <AlertTriangle size={18} /> Arquivos Órfãos (Não Utilizados)
                        </CardTitle>
                        <CardDescription className="text-amber-900/60 font-bold">
                            Estes arquivos existem mas não são importados em nenhum lugar. São candidatos fortes à remoção para diminuir a complexidade do código.
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