

import React, { useState } from 'react';
import { BacklogItem, BacklogStatus } from '../types';
import { KANBAN_COLUMNS } from '../constants';
import { GripVertical } from 'lucide-react';
// FIX: CardDescription is now exported from ./ui/Card
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { uiSounds } from '../lib/uiSounds';
import { haptics } from '../lib/haptics';
import { motion } from 'framer-motion';

interface KanbanBoardProps {
  items: BacklogItem[];
  onUpdateItems: (items: BacklogItem[]) => void;
}

const getStatusColor = (status: BacklogStatus) => {
    switch (status) {
        case BacklogStatus.Idea: return 'bg-purple-500/20 text-purple-300 border-purple-500';
        case BacklogStatus.Planned: return 'bg-sky-500/20 text-sky-300 border-sky-500';
        case BacklogStatus.InProgress: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500';
        case BacklogStatus.Done: return 'bg-green-500/20 text-green-300 border-green-500';
        default: return 'bg-slate-700';
    }
};

const KanbanCard: React.FC<{ item: BacklogItem }> = ({ item }) => (
    /* Use any to bypass Framer Motion properties error */
    <motion.div
        layoutId={item.id as any}
        draggable
        // Use any to bypass Framer Motion's internal signature conflict with native onDragStart
        onDragStart={(e: any) => {
            if (e.dataTransfer) {
                e.dataTransfer.setData("itemId", item.id);
            }
            uiSounds.playHover(); 
            haptics.light();
        }}
        whileHover={{ scale: 1.03, rotate: 1 } as any}
        whileTap={{ scale: 0.95 } as any}
        className="bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-grab active:cursor-grabbing mb-2 hover:border-slate-500 transition-colors shadow-sm hover:shadow-lg"
    >
        <p className="font-bold text-sm text-slate-100 mb-1">{item.title}</p>
        <p className="text-xs text-slate-400">{item.description}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block ${getStatusColor(item.status)}`}>
            {item.type}
        </span>
    </motion.div>
);

const KanbanColumn: React.FC<{
    status: BacklogStatus,
    items: BacklogItem[],
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void,
}> = ({ status, items, onDrop }) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        onDrop(e);
        setIsOver(false);
    };

    return (
        <div className="w-full md:w-1/4 bg-slate-900 rounded-lg p-2 flex flex-col">
            <div className={`p-2 font-bold text-slate-200 border-b-4 mb-2 ${getStatusColor(status)}`}>
                {status} ({items.length})
            </div>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-grow min-h-[200px] p-2 rounded-md transition-all duration-200 ${isOver ? 'bg-sky-500/10 border-2 border-dashed border-sky-500/50' : 'border-2 border-transparent'}`}
            >
                {items.map(item => <KanbanCard key={item.id} item={item} />)}
            </div>
        </div>
    );
}

export default function KanbanBoard({ items, onUpdateItems }: KanbanBoardProps) {

    const handleDrop = (targetStatus: BacklogStatus) => (e: React.DragEvent<HTMLDivElement>) => {
        const itemId = e.dataTransfer.getData("itemId");
        if (!itemId) return;
        
        const updatedItems = items.map(item =>
            item.id === itemId ? { ...item, status: targetStatus } : item
        );
        uiSounds.playClick(); 
        haptics.medium();
        onUpdateItems(updatedItems);
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Backlog do Produto</CardTitle>
                <CardDescription>Organize ideias, features e bugs com o God Mode.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                    {KANBAN_COLUMNS.map(status => (
                        <KanbanColumn
                            key={status}
                            status={status as BacklogStatus}
                            items={items.filter(item => item.status === (status as BacklogStatus))}
                            onDrop={handleDrop(status as BacklogStatus)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}