import React from 'react';
import ReactPlayer from 'react-player';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
    url: string;
    title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
    return (
        <Card className="border-slate-800 bg-slate-900 overflow-hidden group hover:border-sky-500/30 transition-colors">
            <CardHeader className="bg-slate-950/50 pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-slate-200">
                    <PlayCircle size={18} className="text-sky-400" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 aspect-video bg-black relative">
                <ReactPlayer 
                    url={url} 
                    width="100%" 
                    height="100%" 
                    controls 
                    light 
                    playIcon={
                        <div className="w-16 h-16 bg-sky-500/90 rounded-full flex items-center justify-center pl-1 shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform">
                            <PlayCircle size={40} className="text-white" fill="currentColor" />
                        </div>
                    }
                />
            </CardContent>
        </Card>
    );
};