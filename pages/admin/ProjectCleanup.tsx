
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { AlertTriangle, Trash2, FileText, Code2, ServerCrash, ArchiveRestore, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptics } from '../../lib/haptics.ts';

const M = motion as any;

const obsoleteFiles = [
    { path: 'pages/ProfessorDashboard.tsx', reason: 'Substituído por pages/dev/teacher/Dashboard.tsx' },
    { path: 'pages/StudentDashboard.tsx', reason: 'Substituído por pages/dev/student/Dashboard.tsx' },
    { path: 'pages/GuardianDashboard.tsx', reason: 'Substituído por pages/dev/parent/Dashboard.tsx' },
    { path: 'pages/LibraryPage.tsx', reason: 'Substituído por pages/dev/teacher/Library.tsx' },
    { path: 'pages/admin/FinanceView.tsx', reason: 'Consolidado em pages/admin/FinanceManager.tsx' },
    { path: 'components/tools/TechniqueGym.tsx', reason: 'Duplicata exata de pages/dev/teacher/TechniqueGym.tsx' },
    { path: 'components/ErrorBoundary.tsx', reason: 'Movido para components/ui/ErrorBoundary.tsx' },
    { path: 'lib/chordEngine.ts', reason: 'Lógica integrada ao theoryEngine.ts' },
    { path: 'hooks/useClassroomSync.ts', reason: 'Funcionalidade migrada para services/classroomService.ts' },
    { path: 'sql/fix_rls.sql', reason: 'Patch legado (v7.2)' },
    { path: 'sql/fix_auth_final.sql', reason: 'Patch legado (v7.4)' },
    { path: 'components/StudentStore.tsx', reason: 'Migrado para o ecossistema de Skins em pages/dev/student/Shop.tsx' }
];

const FileItem: React.FC<{ file: { path: string; reason: string } }> = ({ file }) => (
    <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-red-500/20 transition-all">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-slate-500 group-hover:text-red-400">
                <FileText size={14} />
            </div>
            <div>
                <p className="text-xs font-mono font-bold text-slate-300">{file.path}</p>
                <p className="text-[10px] text-slate-500 italic">{file.reason}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-slate-600 uppercase bg-black/40 px-2 py-1 rounded">Alvo de Exclusão</span>
            <AlertTriangle size={14} className="text-red-500/50" />
        </div>
    </div>
);

export default function ProjectCleanup() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-24">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-[100px] pointer-events-none" />
                <div className="space-y-1 relative z-10">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3 leading-none">
                        <ArchiveRestore className="text-red-500" /> Kernel <span className="text-red-500">Purge</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Análise de Redundância e Arquivos Órfãos (v8.0)</p>
                </div>
                <Button variant="danger" onClick={() => haptics.heavy()} className="rounded-[32px] h-16 px-10 shadow-xl shadow-red-900/20 relative z-10 font-black uppercase text-xs" leftIcon={Trash2}>
                    Executar Purge Script
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-[#0a0f1d] border-white/5 p-8 rounded-[40px] border-b-4 border-red-500 shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Arquivos p/ Remoção</p>
                    <h3 className="text-5xl font-black text-white tracking-tighter mt-2">{obsoleteFiles.length}</h3>
                </Card>
                <Card className="bg-[#0a0f1d] border-white/5 p-8 rounded-[40px] border-b-4 border-emerald-500 shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integridade das Rotas</p>
                    <h3 className="text-5xl font-black text-emerald-400 tracking-tighter mt-2">100%</h3>
                </Card>
                <Card className="bg-[#0a0f1d] border-white/5 p-8 rounded-[40px] border-b-4 border-sky-500 shadow-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saneamento Kernel</p>
                    <h3 className="text-5xl font-black text-white tracking-tighter mt-2">v8.0</h3>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="bg-[#0a0f1d] border-white/10 rounded-[56px] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-slate-950/60 p-8 border-b border-white/5">
                        <CardTitle className="flex items-center gap-3 text-red-400 uppercase text-xs font-black tracking-[0.2em]">
                            <ServerCrash size={18} /> Inventário de Lixo Técnico (Backlog)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {obsoleteFiles.map(file => <FileItem key={file.path} file={file} />)}
                        </div>
                    </CardContent>
                </Card>
                
                <div className="bg-amber-500/5 border border-amber-500/20 p-10 rounded-[48px] flex items-start gap-6 shadow-xl">
                    <AlertTriangle className="text-amber-500 shrink-0" size={32} />
                    <div className="space-y-2">
                        <h4 className="text-lg font-black text-white uppercase tracking-tight italic">Protocolo de Exclusão</h4>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            A exclusão física deve ser realizada via <code className="text-amber-500 bg-black/40 px-2 py-0.5 rounded">rm -rf</code> ou gerenciador de arquivos. O Maestro Kernel detectará automaticamente as referências quebradas e solicitará refatoração de imports no próximo boot do servidor de desenvolvimento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
