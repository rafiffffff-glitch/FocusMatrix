import React, { useState, useEffect, useCallback } from 'react';
import { 
  TaskItem, 
  ActiveTab, 
  TaskProgress, 
  EisenhowerQuadrant, 
  UserProfile 
} from './types';
import { INITIAL_TASKS } from './mockData';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { TaskTableView } from './components/TaskTableView';
import { EisenhowerView } from './components/EisenhowerView';
import { PomodoroView } from './components/PomodoroView';
import { TaskDrawer } from './components/TaskDrawer';
import { GoogleSyncModal } from './components/GoogleSyncModal';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './lib/firebase';
import { 
  fetchGoogleCalendarEvents, 
  convertGCalEventsToTasks, 
  pushTaskToGoogleCalendar 
} from './lib/gcal';

const STORAGE_KEY = 'apple_notion_productivity_tasks_v1';

export default function App() {
  // Master tasks state with localStorage persistence
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load tasks from local storage', e);
    }
    return INITIAL_TASKS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('database');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer & Modal States
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isGCalModalOpen, setIsGCalModalOpen] = useState(false);

  // Google OAuth Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isGCalConnected, setIsGCalConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save tasks to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to local storage', e);
    }
  }, [tasks]);

  // Show Toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync Google Calendar Events
  const syncWithGoogleCalendar = useCallback(async (token: string) => {
    setIsSyncing(true);
    try {
      const events = await fetchGoogleCalendarEvents(token);
      setTasks((prevTasks) => {
        const updated = convertGCalEventsToTasks(events, prevTasks);
        return updated;
      });
      setIsGCalConnected(true);
      showToast(`Berhasil menyinkronkan ${events.length} acara dari Google Calendar!`);
    } catch (err: any) {
      console.error('Error syncing Google Calendar:', err);
      showToast(`Gagal sinkronisasi GCal: ${err.message || 'Izin ditolak'}`);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initialize Auth on App Load
  useEffect(() => {
    const unsubscribe = initAuth(
      (u, token) => {
        setUser({
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
        });
        setIsGCalConnected(true);
        if (token) {
          syncWithGoogleCalendar(token);
        }
      },
      () => {
        setUser(null);
        setIsGCalConnected(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [syncWithGoogleCalendar]);

  // Handle Login button
  const handleGoogleLogin = async () => {
    setIsSyncing(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser({
          displayName: res.user.displayName,
          email: res.user.email,
          photoURL: res.user.photoURL,
        });
        setIsGCalConnected(true);
        await syncWithGoogleCalendar(res.accessToken);
        setIsGCalModalOpen(false);
      }
    } catch (err: any) {
      showToast('Gagal otorisasi Google: ' + (err.message || 'User cancelled'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsGCalConnected(false);
    setIsGCalModalOpen(false);
    showToast('Tersambung dengan Google Calendar telah diputuskan.');
  };

  const handleManualSyncClick = async () => {
    const token = await getAccessToken();
    if (token) {
      await syncWithGoogleCalendar(token);
    } else {
      setIsGCalModalOpen(true);
    }
  };

  // Open Drawer for New Task
  const handleOpenNewTaskModal = () => {
    setEditingTask(null);
    setIsTaskDrawerOpen(true);
  };

  // Open Drawer for Specific Date
  const handleAddNewTaskOnDate = (dateStr: string) => {
    setEditingTask({
      id: '',
      title: '',
      deadline: dateStr,
      time: '09:00',
      type: 'Tugas Biasa',
      progress: 'Belum Dikerjakan',
      eisenhower: 'Do Now',
      notes: '',
      createdAt: new Date().toISOString(),
    });
    setIsTaskDrawerOpen(true);
  };

  // Select Task for Edit
  const handleSelectTask = (task: TaskItem) => {
    setEditingTask(task);
    setIsTaskDrawerOpen(true);
  };

  // Save Task Handler (Create or Update)
  const handleSaveTask = async (taskToSave: TaskItem, shouldSyncToGCal: boolean) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === taskToSave.id);
      if (exists) {
        return prev.map((t) => (t.id === taskToSave.id ? taskToSave : t));
      } else {
        return [taskToSave, ...prev];
      }
    });

    showToast(editingTask ? 'Tugas berhasil diperbarui!' : 'Tugas baru berhasil dibuat!');

    // Handle Google Calendar Push
    if (shouldSyncToGCal && isGCalConnected) {
      const token = await getAccessToken();
      if (token && !taskToSave.gcalEventId) {
        try {
          const eventId = await pushTaskToGoogleCalendar(token, taskToSave);
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskToSave.id
                ? { ...t, syncedToGCal: true, gcalEventId: eventId }
                : t
            )
          );
          showToast('Tugas juga berhasil dikirim ke Google Calendar Anda!');
        } catch (err: any) {
          console.error('Push to GCal failed', err);
          showToast('Tugas tersimpan lokal (Gagal kirim ke GCal: ' + err.message + ')');
        }
      }
    }
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Tugas telah dihapus.');
  };

  // Quick Progress Update
  const handleUpdateTaskProgress = (taskId: string, newProgress: TaskProgress) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, progress: newProgress } : t))
    );
    showToast(`Status tugas diubah menjadi "${newProgress}"`);
  };

  // Quick Eisenhower Quadrant Update
  const handleUpdateTaskQuadrant = (taskId: string, newQuadrant: EisenhowerQuadrant) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, eisenhower: newQuadrant } : t))
    );
    showToast(`Dipindahkan ke kuadran "${newQuadrant}"`);
  };

  // Pomodoro Completion Increment
  const handleIncrementTaskPomodoro = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, pomodoroSessionsCompleted: (t.pomodoroSessionsCompleted || 0) + 1 }
          : t
      )
    );
    showToast('Sesi Pomodoro selesai! Ditambahkan ke statistik tugas.');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans flex flex-col selection:bg-[#0066cc]/20">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1d1d1f] text-white text-[13px] font-medium px-4 py-3 rounded-full shadow-lg border border-[#333333] flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#0066cc]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewTaskModal={handleOpenNewTaskModal}
        isGCalConnected={isGCalConnected}
        isSyncing={isSyncing}
        onSyncGCal={handleManualSyncClick}
        user={user}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onAddNewTaskOnDate={handleAddNewTaskOnDate}
            isGCalConnected={isGCalConnected}
            onSyncGCal={handleManualSyncClick}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'database' && (
          <TaskTableView
            tasks={tasks}
            searchQuery={searchQuery}
            onSelectTask={handleSelectTask}
            onOpenNewTaskModal={handleOpenNewTaskModal}
            onUpdateTaskProgress={handleUpdateTaskProgress}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'eisenhower' && (
          <EisenhowerView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onOpenNewTaskModal={handleOpenNewTaskModal}
            onUpdateTaskQuadrant={handleUpdateTaskQuadrant}
            onUpdateTaskProgress={handleUpdateTaskProgress}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroView
            tasks={tasks}
            onIncrementTaskPomodoro={handleIncrementTaskPomodoro}
          />
        )}
      </main>

      {/* Side-Peek Layer / Task Drawer Modal */}
      <TaskDrawer
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        editingTask={editingTask}
        isGCalConnected={isGCalConnected}
      />

      {/* Google Calendar Authorization Modal */}
      <GoogleSyncModal
        isOpen={isGCalModalOpen}
        onClose={() => setIsGCalModalOpen(false)}
        isGCalConnected={isGCalConnected}
        isSyncing={isSyncing}
        user={user}
        onLoginWithGoogle={handleGoogleLogin}
        onManualSync={handleManualSyncClick}
        onLogout={handleLogout}
      />

      {/* Footer */}
      <footer className="bg-[#ffffff] border-t border-[#e0e0e0] py-6 px-8 mt-12 text-center text-[12px] text-[#7a7a7a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Mobile Productivity Engine. Designed strictly under Apple Design System Guidelines.
          </div>
          <div className="flex items-center space-x-4 text-[#0066cc]">
            <span>Pure White Canvas (#ffffff)</span>
            <span>•</span>
            <span>Parchment Surface (#f5f5f7)</span>
            <span>•</span>
            <span>Action Blue (#0066cc)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
