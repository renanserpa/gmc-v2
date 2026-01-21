
export enum UserRole {
    Professor = 'professor',
    Student = 'student',
    Guardian = 'guardian',
    Admin = 'admin',
    Manager = 'manager'
}

export interface AccessibilitySettings {
    dyslexicFont: boolean;
    highContrast: boolean;
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    reducedMotion: boolean;
    uiMode: 'standard' | 'kids';
}

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
    badges?: string[];
    reputation_points?: number;
    accessibility_settings?: AccessibilitySettings;
    professor_id?: string;
    school_id?: string | null;
}

export interface Student {
    id: string;
    auth_user_id: string | null;
    professor_id: string;
    name: string;
    instrument: string;
    avatar_url: string | null;
    xp: number;
    coins: number;
    current_level: number;
    current_streak_days: number;
    xpToNextLevel: number;
    invite_code: string | null;
    access_code?: string;
    guardian_id: string | null;
    completed_module_ids: string[];
    completed_content_ids?: string[];
    last_activity_date?: string;
    school_id?: string | null;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    xp_reward: number;
}

export interface PlayerAchievement {
    id: string;
    player_id: string;
    achievement_id: string;
    achieved_at: string;
    achievement?: Achievement;
}

export enum BacklogStatus {
    Idea = 'Idea',
    Planned = 'Planned',
    InProgress = 'InProgress',
    Done = 'Done'
}

export interface BacklogItem {
    id: string;
    title: string;
    description: string;
    status: BacklogStatus;
    type: string;
}

export interface StoreItem {
    id: string;
    name: string;
    description: string;
    price_coins: number;
    is_active: boolean;
    metadata?: any;
}

export interface StoreOrder {
    id: string;
    player_id: string;
    store_item_id: string;
    coins_spent: number;
    is_equipped: boolean;
    created_at: string;
    store_items?: StoreItem;
    students?: Student;
}

export interface MusicClass {
    id: string;
    professor_id: string;
    name: string;
    start_time: string;
    days_of_week: string[];
    age_group: string;
    school_id?: string | null;
}

export interface Notice {
    id: string;
    professor_id: string;
    title: string;
    message: string;
    target_audience: string;
    created_at: string;
}

export enum MissionStatus {
    Pending = 'pending',
    Done = 'done',
    Expired = 'expired'
}

export interface Mission {
    id: string;
    student_id: string;
    professor_id: string;
    title: string;
    description: string;
    week_start: string;
    xp_reward: number;
    coins_reward: number;
    status: MissionStatus;
    position?: number;
    created_at?: string;
}

export interface Lesson {
    id: string;
    professor_id: string;
    student_id: string;
    date: string;
    starts_at: string;
    status: string;
    student_name?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceLog {
    id: string;
    student_id: string;
    music_class_id: string;
    status: AttendanceStatus;
    attendance_date: string;
}

export interface ContentLibraryItem {
    id: string;
    professor_id: string;
    title: string;
    type: 'video' | 'audio' | 'tab' | 'pdf';
    url: string;
    difficulty_level: 'beginner' | 'intermediate' | 'pro';
    created_at?: string;
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

export enum ModuleStatus {
    Locked = 'locked',
    Available = 'available',
    Completed = 'completed'
}

export interface LearningModule {
    id: string;
    trail_id: string;
    title: string;
    description: string;
    order_index: number;
    icon_type: 'theory' | 'technique' | 'repertoire' | 'boss';
    xp_reward: number;
    required_missions: string[];
}

export interface LessonStep {
    id: string;
    title: string;
    type: 'theory' | 'exercise' | 'song' | 'video' | 'movement_break';
    duration_mins: number;
    content?: string;
    metadata?: any;
}

export interface LessonPlan {
    id: string;
    professor_id: string;
    title: string;
    description?: string;
    age_group: '4-6' | '7-10' | 'adult';
    steps: LessonStep[];
    created_at: string;
}

export interface BossState {
    name: string;
    maxHp: number;
    currentHp: number;
    isEnraged: boolean;
    isActive: boolean;
}

export interface ChordSubstitution {
    chord: string;
    type: 'relative' | 'parallel' | 'tritone';
    description: string;
}

export interface Tuning {
    id: string;
    label: string;
    notes: number[];
}

export interface ClassroomCommand {
    type: 'PLAY' | 'PAUSE' | 'SET_BPM' | 'CHANGE_STEP' | 'FOCUS_MODE' | 'SYNC_STATE' | 'TELEMETRY_HIT' | 'END_SESSION' | 'QUICK_FEEDBACK' | 'PECS_MESSAGE';
    timestamp?: number;
    bpm?: number;
    stepId?: string;
    active?: boolean;
    state?: any;
    studentId?: string;
    noteId?: string;
    precision?: 'perfect' | 'good' | 'late';
    resonance?: number;
    summary?: any;
    message?: string;
    studentName?: string;
    messageId?: string;
    label?: string;
}

export enum InstrumentType {
    Guitar = 'guitar',
    Ukulele = 'ukulele',
    Piano = 'piano',
    Drums = 'drums',
    Vocals = 'vocals'
}

export interface SchoolBranding {
    primaryColor: string;
    secondaryColor: string;
    borderRadius: string;
    logoUrl: string | null;
}

export interface School {
    id: string;
    name: string;
    branding: SchoolBranding;
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

export interface Philosopher {
    id: string;
    name: string;
    era: string;
    avatar_url: string;
    system_prompt: string;
}

export interface ChordBlock {
    id: string;
    degree: string;
    label: string;
    color: string;
    notes: string[];
}

export interface WikiArticle {
    id: string;
    title: string;
    category: 'History' | 'Theory' | 'Instruments' | 'Pedagogy';
    content: string;
    tags: string[];
    updated_at: string;
}

export interface SearchResult {
    id: string;
    type: 'student' | 'tool' | 'concept' | 'song';
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
