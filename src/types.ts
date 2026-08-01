export type EisenhowerQuadrant = 'Do Now' | 'Schedule' | 'Delegate' | 'Delete';

export type TaskProgress = 'Belum Dikerjakan' | 'Lagi Dikerjakan' | 'Selesai';

export type TaskType = 
  | 'Baca' 
  | 'Nulis Makalah' 
  | 'Kuis' 
  | 'Tugas Biasa' 
  | 'Projek Kelompok' 
  | 'Jadwal GCal'
  | string;

export interface TaskItem {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD or ISO string
  time?: string; // HH:mm
  type: TaskType;
  progress: TaskProgress;
  eisenhower: EisenhowerQuadrant;
  notes: string;
  syncedToGCal?: boolean;
  gcalEventId?: string;
  pomodoroSessionsCompleted?: number;
  createdAt: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  htmlLink?: string;
}

export type ActiveTab = 'calendar' | 'database' | 'eisenhower' | 'pomodoro';

export interface UserProfile {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
