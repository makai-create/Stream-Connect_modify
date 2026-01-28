
export type Tab = 'home' | 'shift' | 'history' | 'signal' | 'settings';
export type ShiftViewState = 'menu' | 'calendar' | 'edit' | 'history_calendar' | 'history_list' | 'month_select' | 'correction' | 'correction_edit';

export type AppState = 'login' | 'setup_avatar' | 'setup_profile' | 'main';
export type AttendanceStatus = 'none' | 'working' | 'break' | 'finished';

export interface AttendanceLog {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  location: string;
  status: 'normal' | 'late' | 'early';
}

export interface AttendanceLogWithCorrection extends AttendanceLog {
  correctionStatus?: 'none' | 'pending' | 'approved';
  correctionData?: {
    type: string;
    punchType: string;
    time: string;
    reason: string;
  };
}

export interface ShiftDay {
  date: number;
  status: 'empty' | 'requested' | 'draft';
  startTime?: string;
  endTime?: string;
}

export interface ExtendedShiftDayLocal extends ShiftDay {
  memo?: string;
  type: 'none' | 'desired' | 'any' | 'negotiable'; // ー, ●, ⚪︎, △
}

export interface User {
  name: string;
  nickname?: string;
  birthday?: string;
  hobbies?: string;
  goal?: string;
  joinDate?: string;
  rank: string;
  location: string;
  role: string;
  department: string;
  base: string;
  avatar: string;
}

export interface AppNotification {
  id: string;
  dateLabel: string; // "今日", "昨日", or "12月15日"
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  type: 'shift' | 'correction' | 'info';
}
