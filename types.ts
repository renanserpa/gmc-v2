
export enum UserRole {
    Professor = 'professor',
    Student = 'student',
    Guardian = 'guardian',
    Admin = 'admin',
    SuperAdmin = 'super_admin',
    SchoolManager = 'school_manager',
    Manager = 'manager'
}

export interface Enrollment {
    id: string;
    student_id: string;
    class_id: string;
    created_at: string;
}

export interface MusicClass {
    id: string;
    school_id: string;
    name: string;
    day_of_week: string;
    start_time: string;
    capacity: number;
    teacher_id?: string;
    occupied?: number; // Calculado no front
    age_group?: string; 
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
    slug?: string;
    is_active: boolean;
    owner_id?: string; 
    billing_model?: 'hourly' | 'per_student' | 'fixed';
    hourly_rate?: number;
    monthly_fee?: number;
    contract_status?: 'trial' | 'active' | 'suspended' | string;
    branding: SchoolBranding;
    settings?: {
        max_students?: number;
        [key: string]: any;
    };
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
    school_id?: string | null;
    avatar_url: string | null;
    created_at: string;
    badges?: string[];
    reputation_points?: number;
    professor_id?: string;
    accessibility_settings?: AccessibilitySettings;
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
  xpToNextLevel?: number; // Calculated field
  avatar_url?: string | null;
  completed_content_ids?: string[];
  guardian_id?: string | null;
}

export enum MissionStatus {
    Pending = 'pending',
    Done = 'done',
    Expired = 'expired'
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Mission {
    id: string;
    title: string;
    description?: string;
    xp_reward: number;
    status: MissionStatus;
    student_id: string;
    professor_id: string;
    school_id?: string | null;
    created_at?: string;
    week_start?: string;
    is_template?: boolean;
    metadata?: any;
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    message?: string; 
    priority: 'low' | 'normal' | 'high' | 'critical';
    target_audience: 'all' | 'students' | 'professors' | string;
    professor_id?: string;
    school_id?: string | null;
    created_at: string;
    expires_at?: string;
}

export interface ContentLibraryItem {
    id: string;
    title: string;
    type: 'video' | 'audio' | 'tab' | 'pdf';
    url: string;
    difficulty_level: 'beginner' | 'intermediate' | 'pro';
    professor_id?: string;
    school_id?: string | null;
    created_at?: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon_url?: string;
}

export interface PlayerAchievement {
    id: string;
    player_id: string;
    achievement_id: string;
    unlocked_at: string;
    achievements?: Achievement;
}

export interface ChordSubstitution {
    chord: string;
    type: 'relative' | 'parallel' | 'tritone';
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
    description?: string;
    order_index: number;
    icon_type: 'theory' | 'technique' | 'repertoire' | 'boss' | string;
    xp_reward: number;
    required_missions?: string[];
}

export interface Tuning {
    id: string;
    label: string;
    notes: number[];
}

export interface ClassroomCommand {
    type: 'PLAY' | 'PAUSE' | 'CELEBRATE' | 'END_SESSION' | 'PECS_MESSAGE' | string;
    timestamp?: number;
    summary?: any;
    studentId?: string;
    studentName?: string;
    messageId?: string;
    label?: string;
    [key: string]: any;
}

export interface LessonStep {
    id: string;
    title: string;
    type: 'theory' | 'exercise' | 'song' | 'video' | 'movement_break' | string;
    duration_mins: number;
    metadata?: any;
}

export interface LessonPlan {
    id: string;
    title: string;
    age_group: '4-6' | '7-12' | 'adult';
    steps: LessonStep[];
}

export enum InstrumentType {
    Guitar = 'Violão',
    Ukulele = 'Ukulele',
    Piano = 'Piano',
    Drums = 'Bateria',
    Vocals = 'Canto',
    Bass = 'Baixo'
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

export interface StoreItem {
  id: string;
  name: string;
  description?: string;
  price_coins: number;
  category?: string; 
  image_url?: string;
  metadata?: any;
  is_active: boolean;
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
