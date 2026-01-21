
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment, Float, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Maximize2, Headphones, Info, Zap } from 'lucide-react';
import { haptics } from '../../lib/haptics';
import { cn } from '../../lib/utils';

// Workaround for intrinsic JSX elements in restricted environments
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const BoxGeometry = 'boxGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

const Hotspot = ({ position, label, content }: { position: [number, number, number], label: string, content: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Html position={position}>
            <div className="relative">
                <button 
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                    onClick={() => haptics.light()}
                    className="w-4 h-4 bg-sky-500 rounded-full border-2 border-white shadow-[0_0_10px_#38bdf8] animate-pulse"
                />
                {isOpen && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-slate-900/90 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl z-50 pointer-events-none">
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-xs text-slate-300 font-medium">{content}</p>
                    </div>
                )}
            </div>
        </Html>
    );
};

/**
 * 3D Instrument Model component using R3F.
 */
const InstrumentModel = ({ type }: { type: string }) => {
    return (
        <Group>
            {/* Corpo Simplificado */}
            <Mesh castShadow receiveShadow>
                <BoxGeometry args={[1, 2, 0.3]} />
                <MeshStandardMaterial color="#8b4513" metalness={0.2} roughness={0.3} />
            </Mesh>
            {/* Braço */}
            <Mesh position={[0, 1.5, 0]}>
                <BoxGeometry args={[0.3, 2, 0.1]} />
                <MeshStandardMaterial color="#2d1d0c" />
            </Mesh>
            
            <Hotspot position={[0, 0, 0.2]} label="Roca" content="Onde o som ganha vida e ressoa pela caixa de madeira." />
            <Hotspot position={[0, 1.8, 0.1]} label="Pestana" content="Divide o comprimento das cordas, afinando o início da escala." />
        </Group>
    );
};

export const InstrumentMuseum: React.FC = () => {
    const [selected, setSelected] = useState('viola_da_gamba');

    return (
        <div className="relative w-full h-[600px] bg-slate-900 rounded-[48px] overflow-hidden border-4 border-white/5 shadow-2xl">
            <div className="absolute top-8 left-10 z-20 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500 rounded-2xl text-slate-950 shadow-lg">
                        <Info size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Galeria de Organologia</h3>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Estudo Anatômico Maestro</p>
                    </div>
                </div>
            </div>

            <Canvas shadows className="bg-slate-950">
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <Stage environment="city" intensity={0.5} contactShadow={true} shadowBias={-0.001}>
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <InstrumentModel type={selected} />
                        </Float>
                    </Stage>
                    <OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={10} />
                </Suspense>
            </Canvas>

            <div className="absolute bottom-8 left-10 right-10 flex justify-between items-center z-20 pointer-events-none">
                <div className="flex gap-4 pointer-events-auto">
                    <button className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/10 hover:bg-sky-500 transition-all text-white flex items-center gap-3 shadow-2xl">
                        <Headphones size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ouvir Timbre Real</span>
                    </button>
                    <button className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/10 hover:bg-white hover:text-slate-900 transition-all text-white shadow-2xl">
                        <Maximize2 size={20} />
                    </button>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl pointer-events-auto">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Seletor de Acervo</p>
                    <div className="flex gap-2">
                        {['Viola da Gamba', 'Cravo', 'Gibson L-1'].map(name => (
                            <button 
                                key={name}
                                onClick={() => setSelected(name)}
                                className={cn(
                                    "px-4 py-2 rounded-xl border text-[9px] font-black transition-colors",
                                    selected === name ? "bg-sky-500 border-white text-white" : "bg-slate-950 border-white/5 text-slate-400 hover:text-white"
                                )}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
