
export type Tab = 'home' | 'shift' | 'history' | 'signal' | 'settings';
export type ShiftViewState = 'menu' | 'calendar' | 'edit' | 'history_calendar' | 'history_list' | 'month_select' | 'correction' | 'correction_edit';

export interface AttendanceLog {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  location: string;
  status: 'normal' | 'late' | 'early';
}

export interface ShiftDay {
  date: number;
  status: 'empty' | 'requested' | 'draft';
  startTime?: string;
  endTime?: string;
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
