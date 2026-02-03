
import React, { useState } from 'react';
import { Search, Fingerprint, UserPlus, Building2, UserCog } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { useRealtimeSync } from '../../hooks/useRealtimeSync.ts';
import { cn } from '../../lib/utils.ts';

export default function UserDirectory() {
    const [search, setSearch] = useState('');
    const { data: users, loading } = useRealtimeSync<any>('profiles');

    const filteredUsers = users.filter(u => 
        u.email?.toLowerCase().includes(search.toLowerCase()) || 
        u.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[48px] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">User <span className="text-sky-500">Directory</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Identidades Ativas no Ecossistema</p>
                </div>
            </header>

            <Card className="bg-slate-900 border-white/5 p-2 rounded-3xl shadow-lg">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                        value={search} onChange={e => setSearch(e.target.value)} 
                        placeholder="Buscar por e-mail ou nome..." 
                        className="w-full bg-transparent border-none outline-none py-5 pl-14 pr-6 text-sm text-white font-mono" 
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredUsers.map(u => (
                    <Card key={u.id} className="bg-[#0a0f1d] border-white/5 rounded-[40px] p-8 transition-all hover:border-sky-500/30">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-slate-900 rounded-2xl text-sky-400"><Fingerprint size={28} /></div>
                            <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-slate-900 text-slate-500">{u.role}</span>
                        </div>
                        <h4 className="text-lg font-black text-white uppercase truncate">{u.full_name || 'N/A'}</h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">{u.email}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
