import { supabase } from '../lib/supabaseClient.ts';
import { Student, MusicClass, Notice, Mission, AttendanceStatus, ContentLibraryItem, School, Profile, MissionStatus } from '../types.ts';
import { Star, Zap, Trophy, Flag } from 'lucide-react';
import { applyXpEvent } from './gamificationService.ts';

// --- ADMIN & GOVERNANCE SERVICES ---

export const getAdminSchools = async (): Promise<School[]> => {
    const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const updateSchoolStatus = async (schoolId: string, isActive: boolean) => {
    const { data, error } = await supabase
        .from('schools')
        .update({ is_active: isActive })
        .eq('id', schoolId)
        .select()
        .single();
    
    if (error) throw error;

    if (!isActive) {
        await supabase.channel('maestro_global_control').send({
            type: 'broadcast',
            event: 'tenant_suspended',
            payload: { school_id: schoolId }
        });
    }

    return data;
};

export const getStudentCountBySchool = async (schoolId: string): Promise<number> => {
    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);
    
    if (error) return 0;
    return count || 0;
};

export const logSecurityAudit = async (action: string, metadata: any = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('audit_logs').insert([{
        professor_id: user.id,
        event_type: `SECURITY_${action}`,
        description: JSON.stringify(metadata),
        created_at: new Date().toISOString()
    }]);
};

export const updateUserInfo = async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const createAdminSchool = async (schoolData: Partial<School> & { slug: string }) => {
    const { data, error } = await supabase
        .from('schools')
        .insert([{
            name: schoolData.name,
            slug: schoolData.slug,
            is_active: true,
            branding: schoolData.branding || { primaryColor: '#38bdf8', secondaryColor: '#a78bfa', borderRadius: '24px', logoUrl: null },
            settings: schoolData.settings || { max_students: 50, storage_gb: 5 }
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

/**
 * Provisionamento de Mestre com Sincronia Realtime Garantida.
 * O retorno .select().single() dispara o trigger de CDC do Postgres.
 */
export const createAdminProfessor = async (profData: { email: string, full_name: string, school_id?: string }) => {
    const { data: profile, error: pError } = await supabase
        .from('profiles')
        .insert([{
            email: profData.email,
            full_name: profData.full_name,
            role: 'professor',
            school_id: profData.school_id || null
        }])
        .select()
        .single();

    if (pError) throw pError;
    return profile;
};

/**
 * Atualiza configurações globais do sistema.
 * Utiliza upsert para garantir que a chave exista e o broadcast seja emitido.
 */
export const updateSystemConfig = async (key: string, value: any) => {
    const { data, error } = await supabase
        .from('system_configs')
        .upsert({ 
            key, 
            value,
            updated_at: new Date().toISOString()
        }, { onConflict: 'key' })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

// --- MISSION SERVICES ---

export const getMissionsByStudent = async (studentId: string): Promise<Mission[]> => {
    const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
    return data || [];
};

export const updateMissionStatus = async (missionId: string, studentId: string, status: MissionStatus, xpReward: number) => {
    const { data, error } = await supabase
        .from('missions')
        .update({ status })
        .eq('id', missionId)
        .select()
        .single();

    if (error) throw error;

    if (status === MissionStatus.Done) {
        const { data: student } = await supabase.from('students').select('school_id').eq('id', studentId).single();
        await applyXpEvent({
            studentId,
            eventType: 'MISSION_COMPLETE',
            xpAmount: xpReward,
            contextType: 'mission',
            contextId: missionId,
            schoolId: student?.school_id || ""
        });
    }
    return data;
};

export const updateMission = async (missionId: string, updates: Partial<Mission>) => {
    const { data, error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', missionId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteMission = async (missionId: string) => {
    const { error } = await supabase.from('missions').delete().eq('id', missionId);
    if (error) throw error;
    return true;
};

export const createMission = async (mission: Partial<Mission>) => {
  const { data, error } = await supabase.from('missions').insert([mission]).select().single();
  if (error) throw error;
  return data;
};

/**
 * Criação de Missão Mestra (Template Global)
 */
export const createMasterMission = async (mission: Partial<Mission>) => {
    const { data, error } = await supabase
        .from('missions')
        .insert([{
            ...mission,
            student_id: null, // Identifica como global
            status: 'pending'
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

// --- EXTRA SERVICES FOR FRONTEND FIXES ---

/**
 * Recupera estatísticas globais do sistema para o cockpit administrativo.
 */
export const getSystemStats = async () => {
    const [resStudents, resProfs, resContent] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'professor'),
        supabase.from('content_library').select('id', { count: 'exact', head: true })
    ]);

    return {
        totalStudents: resStudents.count || 0,
        totalProfs: resProfs.count || 0,
        totalContent: resContent.count || 0
    };
};

/**
 * Atualiza os dados de um estudante na tabela relacional.
 */
export const updateStudent = async (studentId: string, updates: Partial<Student>) => {
    const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

/**
 * Vincula a conta de usuário logado a um registro de estudante via código de convite.
 */
export const linkStudentAccount = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
        .from('students')
        .update({ auth_user_id: user.id })
        .eq('invite_code', code.toUpperCase())
        .is('auth_user_id', null)
        .select()
        .single();

    if (error) return { success: false, message: "Código inválido ou já utilizado." };
    return { success: true, data };
};

/**
 * Vincula um perfil de guardião a um estudante via código.
 */
export const linkGuardianAccount = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data: student, error: findError } = await supabase
        .from('students')
        .select('id')
        .eq('invite_code', code.toUpperCase())
        .single();

    if (findError) return { success: false, message: "Código não encontrado." };

    const { error: updateError } = await supabase
        .from('students')
        .update({ guardian_id: user.id })
        .eq('id', student.id);

    if (updateError) return { success: false, message: updateError.message };
    return { success: true };
};

/**
 * Recupera as turmas associadas a um professor.
 */
export const getMusicClasses = async (professorId: string): Promise<MusicClass[]> => {
    const { data, error } = await supabase
        .from('music_classes')
        .select('*')
        .eq('professor_id', professorId);
    if (error) throw error;
    return data || [];
};

/**
 * Recupera todos os estudantes vinculados a um professor.
 */
export const getStudentsByTeacher = async (professorId: string): Promise<Student[]> => {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('professor_id', professorId);
    if (error) throw error;
    return data || [];
};

/**
 * Recupera conquistas e marcos históricos de um estudante (Simulado).
 */
export const getStudentMilestones = async (studentId: string) => {
    // Mocking milestones para o pipeline de visualização
    return [
        { id: '1', title: 'Primeira Sinfonia', date: new Date().toISOString(), icon: Star, xp: 100 },
        { id: '2', title: 'Maestro Aprendiz', date: new Date().toISOString(), icon: Flag, xp: 250, isUpcoming: true }
    ];
};

/**
 * Recupera tendências de prática recente.
 */
export const getPracticeTrends = async (studentId: string) => {
    const { data } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(7);
    return data || [];
};

/**
 * Recupera a última sessão de prática processada.
 */
export const getLatestPracticeStats = async (studentId: string) => {
    const { data } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    return data;
};

/**
 * Recupera o repertório de músicas em estudo por um aluno.
 */
export const getStudentRepertoire = async (studentId: string) => {
    const { data } = await supabase
        .from('student_songs')
        .select('*, songs(*)')
        .eq('student_id', studentId);
    return data || [];
};

/**
 * Salva uma nova sessão de prática no banco de dados.
 */
export const savePracticeSession = async (session: any) => {
    const { data, error } = await supabase
        .from('practice_sessions')
        .insert([session])
        .select()
        .single();
    if (error) throw error;
    return data;
};

/**
 * Incrementa a contagem de curtidas sociais (High Five) em uma performance.
 */
export const giveHighFive = async (hallId: string) => {
    const { data, error } = await supabase.rpc('increment_high_fives', { hall_id: hallId });
    if (error) throw error;
    return data;
};

/**
 * Registra a presença de um aluno em uma aula.
 */
export const markAttendance = async (studentId: string, classId: string, status: AttendanceStatus, professorId: string) => {
    const date = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .eq('date', date)
        .maybeSingle();

    if (existing) return false;

    const { error } = await supabase.from('attendance').insert({
        student_id: studentId,
        class_id: classId,
        professor_id: professorId,
        status,
        date
    });

    if (error) throw error;
    return true;
};

/**
 * Recupera o mapa de chamadas realizadas no dia atual para uma turma.
 */
export const getTodayAttendanceForClass = async (classId: string) => {
    const date = new Date().toISOString().split('T')[0];
    const { data } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', classId)
        .eq('date', date);
    
    const map: Record<string, AttendanceStatus> = {};
    data?.forEach(r => map[r.student_id] = r.status);
    return map;
};

/**
 * Calcula a taxa de assiduidade histórica de um estudante.
 */
export const getStudentAttendanceRate = async (studentId: string): Promise<number> => {
    const { count: total } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', studentId);
    const { count: present } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'present');
    if (!total) return 100;
    return Math.round((present! / total) * 100);
};

/**
 * Recupera dossiê completo de estatísticas de um estudante.
 */
export const getStudentDetailedStats = async (studentId: string) => {
    const recordings = await supabase
        .from('performance_recordings')
        .select('*, songs(title)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

    return { recordings: recordings.data || [] };
};

/**
 * Adiciona um novo material à biblioteca de conteúdo.
 */
export const addLibraryItem = async (item: Partial<ContentLibraryItem>) => {
    const { data, error } = await supabase
        .from('content_library')
        .insert([item])
        .select()
        .single();
    if (error) throw error;
    return data;
};

/**
 * Recupera avisos do mural baseados no perfil e audiência.
 */
export const getNotices = async (userId: string, audience: string): Promise<Notice[]> => {
    const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

/**
 * Publica um novo aviso no sistema.
 */
export const createNotice = async (notice: Partial<Notice>) => {
    const { data, error } = await supabase
        .from('notices')
        .insert([notice])
        .select()
        .single();
    if (error) throw error;
    return data;
};
