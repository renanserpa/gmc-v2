
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { School, SchoolBranding } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface ThemeContextType {
    activeSchool: School | null;
    schools: School[];
    switchSchool: (schoolId: string | null) => void;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_BRANDING: SchoolBranding = {
    primaryColor: '#38bdf8', // Sky 400
    secondaryColor: '#a78bfa', // Purple 400
    borderRadius: '24px',
    logoUrl: null
};

export const ThemeProvider = ({ children }: { children?: ReactNode }) => {
    const { user, role } = useAuth();
    const [activeSchool, setActiveSchool] = useState<School | null>(null);
    const [schools, setSchools] = useState<School[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carrega escolas disponíveis para o professor
    useEffect(() => {
        if (user && role === 'professor') {
            loadTeacherSchools();
        } else if (user && (role === 'student' || role === 'guardian')) {
            loadStudentSchool();
        } else {
            setIsLoading(false);
        }
    }, [user, role]);

    const loadTeacherSchools = async () => {
        setIsLoading(true);

        // --- BYPASS PARA MODO DEV (Mock Users) ---
        if (user?.email?.endsWith('@oliemusic.dev') || localStorage.getItem('oliemusic_dev_user_id')) {
            // Updated mockSchool to include missing properties required by the School interface
            const mockSchool: School = {
                id: 'school-dev-id',
                name: 'OlieMusic HQ (Dev)',
                slug: 'oliemusic-hq-dev',
                is_active: true,
                billing_model: 'fixed',
                hourly_rate: 0,
                monthly_fee: 0,
                branding: DEFAULT_BRANDING,
                contract_status: 'active'
            };
            setSchools([mockSchool]);
            const savedId = localStorage.getItem('maestro_active_school');
            if (savedId === mockSchool.id) {
                applyBranding(mockSchool);
            } else {
                applyBranding(mockSchool);
            }
            setIsLoading(false);
            return;
        }

        try {
            // Busca via tabela de junção professor_schools
            const { data, error } = await supabase
                .from('professor_schools')
                .select('schools(*)')
                .eq('professor_id', user.id);

            if (error) {
                // Erro silencioso: Tabela pode não existir ou RLS bloqueou.
                // Não logar como WARN para não sujar o console, apenas info.
                console.info("[ThemeContext] Escolas indisponíveis ou não configuradas.", error.message);
                setSchools([]);
            } else {
                // @ts-ignore - Supabase typing mapping issue workaround
                const schoolList = data?.map(d => d.schools).filter(Boolean) as School[];
                setSchools(schoolList);

                // Tenta restaurar última escola do localStorage
                const savedId = localStorage.getItem('maestro_active_school');
                const initial = schoolList.find(s => s.id === savedId) || schoolList[0] || null;
                applyBranding(initial);
            }
        } catch (e) {
            console.error("[ThemeContext] Falha na inicialização do tema:", e);
            setSchools([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStudentSchool = async () => {
        // Bypass para Aluno Dev
        if (user?.email?.endsWith('@oliemusic.dev')) {
             setIsLoading(false);
             return;
        }

        try {
            const table = role === 'student' ? 'students' : 'profiles';
            const { data, error } = await supabase.from(table).select('school_id').eq('id', user.id).maybeSingle();
            
            if (data?.school_id) {
                const { data: school } = await supabase.from('schools').select('*').eq('id', data.school_id).maybeSingle();
                if (school) applyBranding(school as School);
            }
        } catch (e) {
            // Silencioso
        } finally {
            setIsLoading(false);
        }
    };

    const applyBranding = (school: School | null) => {
        setActiveSchool(school);
        const branding = school?.branding || DEFAULT_BRANDING;
        
        const root = document.documentElement;
        root.style.setProperty('--brand-primary', branding.primaryColor);
        root.style.setProperty('--brand-secondary', branding.secondaryColor);
        root.style.setProperty('--brand-radius', branding.borderRadius);
        
        if (school) {
            localStorage.setItem('maestro_active_school', school.id);
        } else {
            localStorage.removeItem('maestro_active_school');
        }
    };

    const switchSchool = (schoolId: string | null) => {
        if (!schoolId) {
            applyBranding(null);
            return;
        }
        const school = schools.find(s => s.id === schoolId);
        if (school) applyBranding(school);
    };

    return (
        <ThemeContext.Provider value={{ activeSchool, schools, switchSchool, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
    return context;
};
