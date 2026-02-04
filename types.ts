
export interface ClassroomCommand {
    /**
     * DNA OLIE: Protocolo de Orquestração Pedagógica.
     */
    type: 'PLAY' | 'PAUSE' | 'CELEBRATE' | 'END_SESSION' | 'PECS_MESSAGE' | 'TROPHY' | 'HEART' | 'ZAP' | 'FRETBOARD_UPDATE' | 'PIANO_UPDATE' | 'CONTENT_LAUNCH' | 'STUDENT_SHOUTOUT';
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

/* Added MissionStatus enum */
export enum MissionStatus {
    Pending = 'pending',
    Done = 'done',
    Expired = 'expired'
}

/* Added ModuleStatus enum */
export enum ModuleStatus {
    Locked = 'locked',
    Available = 'available',
    Completed = 'completed'
}

/* Added InstrumentType enum */
export enum InstrumentType {
    Guitar = 'Guitar',
    Ukulele = 'Ukulele',
    Piano = 'Piano',
    Drums = 'Drums',
    Vocals = 'Vocals'
}

/* Added Profile interface */
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
    accessibility_settings?: AccessibilitySettings;
    created_at?: string;
    instrument?: string;
}

/* Added Student interface */
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
    invite_code?: string;
    guardian_id?: string | null;
    completed_module_ids?: string[];
    completed_content_ids?: string[];
}

/* Added PlayerAchievement interface */
export interface PlayerAchievement {
    id: string;
    player_id: string;
    achievement_id: string;
    created_at: string;
    achievements?: {
        name: string;
        description: string;
    };
}

/* Added MusicClass interface */
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

/* Added Notice interface */
export interface Notice {
    id: string;
    title: string;
    message: string;
    target_audience: string;
    professor_id: string;
    created_at: string;
    priority?: 'low' | 'normal' | 'high' | 'critical';
}

/* Added Mission interface */
export interface Mission {
    id: string;
    student_id: string;
    professor_id: string;
    school_id?: string | null;
    title: string;
    description: string;
    xp_reward: number;
    status: MissionStatus;
    week_start?: string;
    is_template?: boolean;
    created_at?: string;
    students?: {
        name: string;
    };
}

/* Added AttendanceStatus type */
export type AttendanceStatus = 'present' | 'absent' | 'late';

/* Added SchoolBranding interface */
export interface SchoolBranding {
    primaryColor: string;
    secondaryColor: string;
    borderRadius: string;
    logoUrl?: string | null;
}

/* Added School interface */
export interface School {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    owner_id?: string;
    billing_model: string;
    monthly_fee: number;
    fee_per_student: number;
    hourly_rate?: number;
    branding: SchoolBranding;
    contract_status: string;
    maintenance_mode: boolean;
    enabled_modules?: any;
    created_at?: string;
}

/* Added ContentLibraryItem interface with difficulty_level and tab type */
export interface ContentLibraryItem {
    id: string;
    title: string;
    category: 'repertoire' | 'exercise' | 'theory' | 'backing_track';
    type: 'video' | 'pdf' | 'audio' | 'link' | 'tab';
    url: string;
    is_favorite: boolean;
    tags: string[];
    professor_id: string;
    created_at: string;
    difficulty_level?: 'beginner' | 'intermediate' | 'pro';
}

/* Added LessonStep interface */
export interface LessonStep {
    id: string;
    title: string;
    duration_mins: number;
    type: 'theory' | 'exercise' | 'song' | 'video' | 'movement_break';
}

/* Updated LessonPlan interface */
export interface LessonPlan {
    id: string;
    class_id: string;
    title: string;
    items: string[]; // IDs de ContentLibraryItem
    steps: LessonStep[];
    age_group?: string;
    professor_id: string;
    created_at: string;
}

/* Added StoreItem interface */
export interface StoreItem {
    id: string;
    name: string;
    price_coins: number;
    is_active: boolean;
    metadata?: any;
}

/* Added StoreOrder interface */
export interface StoreOrder {
    id: string;
    player_id: string;
    store_item_id: string;
    coins_spent: number;
    is_equipped: boolean;
    store_items?: StoreItem;
}

/* Added Tuning interface */
export interface Tuning {
    id: string;
    label: string;
    notes: number[];
}

/* Added AccessibilitySettings interface */
export interface AccessibilitySettings {
    dyslexicFont: boolean;
    highContrast: boolean;
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    reducedMotion: boolean;
    uiMode: 'standard' | 'kids';
}

/* Added LearningModule interface */
export interface LearningModule {
    id: string;
    title: string;
    icon_type: 'theory' | 'technique' | 'repertoire' | 'boss';
    xp_reward: number;
}

/* Added HistoryEra interface */
export interface HistoryEra {
    id: string;
    name: string;
    period: string;
    description: string;
    color: string;
    font: string;
    icon: any;
}

/* Added ChordBlock interface */
export interface ChordBlock {
    id: string;
    degree: string;
    label: string;
    color: string;
    notes: string[];
}

/* Added SearchResult interface */
export interface SearchResult {
    id: string;
    type: 'tool' | 'concept' | 'student';
    title: string;
    subtitle: string;
    path: string;
    icon: any;
}

/* Added TeacherTip interface */
export interface TeacherTip {
    id: string;
    trigger: string;
    title: string;
    description: string;
    color: string;
}

/* Added ProfessorDashboardStats interface */
export interface ProfessorDashboardStats {
    totalStudents: number;
    upcomingLessonsCount: number;
    pendingMissionsCount: number;
    recentCompletedMissionsCount: number;
}

/* Added StudentGuardianOverview interface */
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

/* Added Philosopher interface */
export interface Philosopher {
    id: string;
    name: string;
    era: string;
    avatar_url: string;
    system_prompt: string;
}

/* Added ChordSubstitution interface */
export interface ChordSubstitution {
    chord: string;
    type: string;
    description: string;
}
