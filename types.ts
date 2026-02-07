
export interface LessonStep {
    id: string;
    title: string;
    type: 'video' | 'metronome' | 'whiteboard' | 'material' | 'challenge' | 'theory' | 'exercise' | 'song' | 'movement_break' | 'book_page';
    duration_mins?: number;
    config?: {
        bpm?: number;
        scale?: string;
        instrument?: 'guitar' | 'piano';
        url?: string;
        targetNotes?: string[];
        description?: string;
        bookPage?: number;
        bookImageUrl?: string;
    };
}

export type PerformanceRating = 'mastered' | 'progressing' | 'review';

export interface ClassroomCommand {
    type: 'PLAY' | 'PAUSE' | 'CELEBRATE' | 'END_SESSION' | 'PECS_MESSAGE' | 'TROPHY' | 'HEART' | 'ZAP' | 'FRETBOARD_UPDATE' | 'PIANO_UPDATE' | 'CONTENT_LAUNCH' | 'STUDENT_SHOUTOUT' | 'QUIZ_FEEDBACK' | 'SET_BPM' | 'VIDEO_FOCUS' | 'EXIT_VIDEO' | 'MEASURE_TICK' | 'COMMAND_STICKER' | 'SCALE_HIGHLIGHT' | 'BOOK_PAGE_VIEW' | 'BOOK_MARKER_MOVE' | 'CERTIFICATE_AWARD';
    payload?: any;
    summary?: any;
    studentId?: string;
    studentName?: string;
    messageId?: string;
    label?: string;
    timestamp?: number;
}

export enum UserRole {
    GodMode = 'god_mode',
    SaaSAdminGlobal = 'saas_admin_global',
    SaaSAdminFinance = 'saas_admin_finance',
    SaaSAdminOps = 'saas_admin_ops',
    TeacherOwner = 'teacher_owner',
    Professor = 'professor',
    Student = 'student',
    Guardian = 'guardian',
    Manager = 'manager',
    SchoolManager = 'school_manager',
    Admin = 'admin',
    SuperAdmin = 'super_admin'
}

export enum MissionStatus { Pending = 'pending', Done = 'done', Expired = 'expired' }

export interface StudentStats {
    id: string;
    student_id: string;
    max_bpm: number;
    notes_mastered: number;
    recorded_at: string;
    master_tip?: string;
}

export interface LibraryAsset {
    id: string;
    title: string;
    type: 'video' | 'pdf' | 'image';
    url: string;
    module_link?: string;
    lesson_link?: string;
    professor_id: string;
    created_at: string;
}

export interface Profile { 
    id: string; 
    email: string; 
    full_name: string; 
    role: string; 
    school_id?: string; 
    professor_id?: string; 
    reputation_points?: number; 
    avatar_url?: string; 
    badges?: string[]; 
    created_at?: string; 
    instrument?: string; 
    metadata?: any; 
    accessibility_settings?: AccessibilitySettings;
}

export interface Student { 
    id: string; 
    auth_user_id: string; 
    professor_id: string; 
    school_id: string; 
    name: string; 
    instrument: string; 
    avatar_url?: string | null; 
    xp: number; 
    coins: number; 
    current_level: number; 
    current_streak_days: number; 
    xpToNextLevel?: number; 
    metadata?: any; 
    completed_content_ids?: string[]; 
}

export interface MusicClass { 
    id: string; 
    name: string; 
    professor_id: string; 
    school_id: string; 
    day_of_week: string; 
    start_time: string; 
    age_group?: string; 
    capacity: number; 
}

export interface Mission { 
    id: string; 
    student_id: string; 
    professor_id: string; 
    title: string; 
    description: string; 
    xp_reward: number; 
    status: MissionStatus; 
    created_at?: string; 
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface LessonPlan { 
    id: string; 
    class_id: string; 
    professor_id: string; 
    school_id: string; 
    title: string; 
    steps: LessonStep[]; 
    age_group?: string; 
}

export interface PlayerAchievement {
    id: string;
    player_id: string;
    achievement_id: string;
    achieved_at: string;
    achievements?: any;
}

export interface Notice {
    id: string;
    title: string;
    message: string;
    target_audience: 'all' | 'student' | 'professor';
    priority?: 'low' | 'normal' | 'high' | 'critical';
    created_at: string;
    professor_id?: string;
}

export interface ContentLibraryItem {
    id: string;
    title: string;
    type: 'video' | 'audio' | 'tab' | 'pdf';
    url: string;
    difficulty_level: 'beginner' | 'intermediate' | 'pro';
    category: string;
    is_favorite: boolean;
    professor_id: string;
    school_id: string | null;
    created_at: string;
}

export interface SchoolBranding {
    primaryColor: string;
    secondaryColor: string;
    borderRadius: string;
    logoUrl?: string | null;
}

export interface School {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    owner_id?: string;
    billing_model: string;
    monthly_fee: number;
    fee_per_student: number;
    branding: SchoolBranding;
    contract_status: string;
    maintenance_mode: boolean;
    cnpj?: string;
    phone?: string;
    enabled_modules?: any;
    created_at?: string;
}

export interface StoreItem {
    id: string;
    name: string;
    price_coins: number;
    category: string;
    rarity: string;
    description?: string;
    metadata?: any;
    is_active: boolean;
}

export interface StoreOrder {
    id: string;
    player_id: string;
    item_id: string;
    is_equipped: boolean;
    store_items?: StoreItem;
}

export interface ChordSubstitution {
    chord: string;
    type: 'relative' | 'parallel' | 'tritone' | 'other';
    description: string;
}

export interface LearningModule {
    id: string;
    title: string;
    icon_type: 'theory' | 'technique' | 'repertoire' | 'boss';
    xp_reward: number;
    description?: string;
    is_template?: boolean;
}

export enum ModuleStatus {
    Locked = 'locked',
    Available = 'available',
    Completed = 'completed'
}

export interface Tuning {
    id: string;
    label: string;
    notes: number[];
}

export interface AccessibilitySettings {
    dyslexicFont: boolean;
    highContrast: boolean;
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    reducedMotion: boolean;
    uiMode: 'standard' | 'kids';
}

export enum InstrumentType {
    Guitar = 'guitar',
    Ukulele = 'ukulele',
    Piano = 'piano',
    Drums = 'drums',
    Vocals = 'vocals'
}

export interface HistoryEra {
    id: string;
    name: string;
    period: string;
    description: string;
    color: string;
    font: string;
    icon: any;
}

export interface ChordBlock {
    id: string;
    degree: string;
    label: string;
    color: string;
    notes: string[];
}

export interface SearchResult {
    id: string;
    type: 'tool' | 'concept' | 'student' | 'lesson';
    title: string;
    subtitle: string;
    path: string;
    icon: any;
}

export interface TeacherTip {
    id: string;
    trigger: string;
    title: string;
    description: string;
    color: string;
}

export interface ProfessorDashboardStats {
    totalStudents: number;
    upcomingLessonsCount: number;
    pendingMissionsCount: number;
    recentCompletedMissionsCount: number;
}

export interface StudentGuardianOverview {
    studentId: string;
    studentName: string;
    instrument: string;
    level: number;
    xp: number;
    streak: number;
    coins: number;
    attendanceRate: number;
    recentLessons: any[];
    missionsSummary: {
        total: number;
        done: number;
        pending: number;
    };
    upcomingMissions: any[];
    recentAchievements: any[];
}

export interface Philosopher {
    id: string;
    name: string;
    era: string;
    avatar_url: string;
    system_prompt: string;
}
