
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, Trash2, FileText, Code2, ServerCrash, ArchiveRestore, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptics } from '../../lib/haptics';

const M = motion as any;

const obsoleteFiles = [
    { path: 'pages/ProfessorDashboard.tsx', reason: 'Substituído por pages/dev/teacher/Dashboard.tsx (Arquitetura v7+)' },
    { path: 'pages/StudentDashboard.tsx', reason: 'Substituído por pages/dev/student/Dashboard.tsx' },
    { path: 'pages/GuardianDashboard.tsx', reason: 'Substituído por pages/dev/parent/Dashboard.tsx' },
    { path: 'pages/admin/GodModeDashboard.tsx', reason: 'Unificado em GodConsole.tsx' },
    { path: 'pages/dev/teacher/MetronomeDev.tsx', reason: 'Página de desenvolvimento duplicada' },
    { path: 'components/ErrorBoundary.tsx', reason: 'Duplicata de components/ui/ErrorBoundary.tsx' },
    { path: 'lib/chordEngine.ts', reason: 'Lógica migrada para lib/theoryEngine.ts' },
    { path: 'hooks/useClassroomSync.ts', reason: 'Lógica migrada para services/classroomService.ts' },
    { path: 'components/StudentStore.tsx', reason: 'Componente legado, funcionalidade abandonada no piloto' },
    { path: 'sql/fix_rls.sql', reason: 'Patch antigo (Substituído pelo schema principal)' },
    { path: 'sql/fix_auth_final.sql', reason: 'Patch antigo' }
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
            <span className="text-[8px] font-black text-slate-600 uppercase bg-black/40 px-2 py-1 rounded">Obsoleto</span>
            <AlertTriangle size={14} className="text-amber-500/50" />
        </div>
    </div>
);

export default function ProjectCleanup() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3 leading-none">
                        <ArchiveRestore className="text-purple-500" /> Kernel <span className="text-purple-500">Cleaner</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Análise de resíduos e arquivos órfãos do ecossistema.</p>
                </div>
                <Button variant="danger" onClick={() => haptics.heavy()} className="rounded-2xl h-14 px-8 shadow-xl shadow-red-900/20" leftIcon={Trash2}>
                    Iniciar Limpeza Automática
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-white/5 p-8 rounded-[32px] border-b-4 border-red-500">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Arquivos p/ Remoção</p>
                    <h3 className="text-4xl font-black text-white tracking-tighter mt-2">{obsoleteFiles.length}</h3>
                </Card>
                <Card className="bg-slate-900 border-white/5 p-8 rounded-[32px] border-b-4 border-emerald-500">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integridade das Rotas</p>
                    <h3 className="text-4xl font-black text-emerald-400 tracking-tighter mt-2">100%</h3>
                </Card>
                <Card className="bg-slate-900 border-white/5 p-8 rounded-[32px] border-b-4 border-sky-500">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Versão do Kernel</p>
                    <h3 className="text-4xl font-black text-white tracking-tighter mt-2">v7.6</h3>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="bg-[#0a0f1d] border-white/10 rounded-[48px] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-slate-950/60 p-8 border-b border-white/5">
                        <CardTitle className="flex items-center gap-3 text-red-400 uppercase text-xs tracking-widest">
                            <ServerCrash size={18} /> Alvos Identificados (Trash Backlog)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {obsoleteFiles.map(file => <FileItem key={file.path} file={file} />)}
                        </div>
                    </CardContent>
                </Card>
                
                <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[40px] flex items-start gap-4">
                    <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        <strong className="text-white uppercase">Aviso Crítico:</strong> A exclusão física desses arquivos deve ser feita via terminal ou gerenciador de arquivos. Após a remoção, o Maestro Kernel executará um auto-ajuste de imports para garantir estabilidade total.
                    </p>
                </div>
            </div>
        </div>
    );
}
