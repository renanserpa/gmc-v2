
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
    // Added missing roles to satisfy layouts/AdminLayout.tsx and pages/ProfileSelector.tsx
    Admin = 'admin',
    SuperAdmin = 'super_admin'
}

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole | string;
    school_id: string | null;
    avatar_url?: string | null;
    badges?: string[];
    reputation_points?: number;
    accessibility_settings?: AccessibilitySettings;
    professor_id?: string;
}

export interface AccessibilitySettings {
  dyslexicFont: boolean;
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reducedMotion: boolean;
  uiMode: 'standard' | 'kids';
}

export interface SchoolBranding {
    primaryColor: string;
    secondaryColor: string;
    borderRadius: string;
    logoUrl: string | null;
}

export interface MusicClass {
    id: string;
    school_id: string;
    name: string;
    day_of_week: string;
    start_time: string;
    capacity: number;
    teacher_id?: string;
    professor_id?: string;
    occupied?: number;
    // Added missing age_group to satisfy components/forms/AddStudentForm.tsx
    age_group?: string;
}

export interface School {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    owner_id?: string; 
    billing_model: 'hourly' | 'per_student' | 'fixed';
    hourly_rate: number;
    monthly_fee: number;
    branding: SchoolBranding;
    contract_status: 'trial' | 'active' | 'suspended' | 'canceled';
    cnpj?: string;
}

export interface Student {
  id: string;
  auth_user_id: string | null;
  professor_id: string;
  school_id: string;
  name: string;
  instrument: string;
  xp: number;
  coins: number;
  current_level: number;
  current_streak_days: number;
  invite_code: string;
  completed_module_ids: string[];
  xpToNextLevel?: number;
  avatar_url?: string | null;
  parent_email?: string | null;
  completed_content_ids?: string[];
  guardian_id?: string | null;
  school_grade?: string;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    xp_reward: number;
    status: MissionStatus;
    student_id: string;
    professor_id: string;
    school_id: string | null;
    created_at?: string;
    // Added missing week_start to satisfy pages/TaskManager.tsx
    week_start?: string;
}

export enum MissionStatus {
    Pending = 'pending',
    Done = 'done',
    Expired = 'expired'
}

export interface Notice {
    id: string;
    title: string;
    message: string;
    content?: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    target_audience: string;
    school_id: string | null;
    professor_id?: string;
    created_at: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface ChordBlock {
    id: string;
    degree: string;
    label: string;
    color: string;
    notes: string[];
}

export interface SearchResult {
    id: string;
    type: 'tool' | 'concept' | 'student';
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

// Added missing types to satisfy various services and components

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon_url?: string;
    xp_reward: number;
}

export interface PlayerAchievement {
    id: string;
    player_id: string;
    achievement_id: string;
    achieved_at: string;
    achievements?: Achievement;
}

export interface ContentLibraryItem {
    id: string;
    title: string;
    type: 'video' | 'audio' | 'tab' | 'pdf';
    url: string;
    difficulty_level: 'beginner' | 'intermediate' | 'pro';
    professor_id: string;
    school_id: string | null;
    created_at?: string;
}

export interface StoreItem {
    id: string;
    name: string;
    description?: string;
    price_coins: number;
    image_url?: string;
    is_active: boolean;
    metadata?: any;
}

export interface StoreOrder {
    id: string;
    player_id: string;
    store_item_id: string;
    coins_spent: number;
    is_equipped: boolean;
    created_at?: string;
    store_items?: StoreItem;
}

export interface LessonStep {
    id: string;
    title: string;
    type: 'video' | 'exercise' | 'song' | 'theory' | 'movement_break';
    duration_mins: number;
    metadata?: any;
}

export interface LessonPlan {
    id: string;
    title: string;
    description?: string;
    age_group: string;
    steps: LessonStep[];
}

export interface ChordSubstitution {
    chord: string;
    type: 'relative' | 'parallel' | 'tritone' | 'secondary_dominant';
    description: string;
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
    required_missions?: string[];
}

export interface Tuning {
    id: string;
    label: string;
    notes: number[];
}

export interface ClassroomCommand {
    type: 'PLAY' | 'PAUSE' | 'CELEBRATE' | 'END_SESSION' | 'PECS_MESSAGE';
    payload?: any;
    summary?: any;
    studentId?: string;
    studentName?: string;
    messageId?: string;
    label?: string;
    timestamp?: number;
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
