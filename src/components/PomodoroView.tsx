import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Flame, Award, Coffee } from 'lucide-react';
import { TaskItem } from '../types';

interface PomodoroViewProps {
  tasks: TaskItem[];
  onIncrementTaskPomodoro: (taskId: string) => void;
}

type Mode = 'work' | 'shortBreak' | 'longBreak';

const MODE_CONFIGS: Record<Mode, { name: string; durationMinutes: number; color: string }> = {
  work: { name: 'Fokus Kerja', durationMinutes: 25, color: '#0066cc' },
  shortBreak: { name: 'Istirahat Pendek', durationMinutes: 5, color: '#34c759' },
  longBreak: { name: 'Istirahat Panjang', durationMinutes: 15, color: '#ff9500' },
};

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  tasks,
  onIncrementTaskPomodoro,
}) => {
  const [mode, setMode] = useState<Mode>('work');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_CONFIGS.work.durationMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentConfig = MODE_CONFIGS[mode];
  const totalSeconds = currentConfig.durationMinutes * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  // Change mode
  const handleModeChange = (newMode: Mode) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(newMode);
    setTimeLeft(MODE_CONFIGS[newMode].durationMinutes * 60);
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            
            // Audio Chime Signal
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
              gain.gain.setValueAtTime(0.3, ctx.currentTime);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 1.2);
            } catch (e) {
              console.log('Audio feedback triggered');
            }

            // Handle completion
            if (mode === 'work') {
              setCompletedSessionsCount((c) => c + 1);
              if (selectedTaskId) {
                onIncrementTaskPomodoro(selectedTaskId);
              }
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedTaskId, onIncrementTaskPomodoro]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(currentConfig.durationMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Pomodoro Timer Container */}
      <div className="bg-[#ffffff] border border-[#e0e0e0] rounded-[24px] p-8 md:p-10 shadow-xs text-center flex flex-col items-center">
        
        {/* Mode Selector Segmented Pills */}
        <div className="flex items-center bg-[#f5f5f7] p-1.5 rounded-full border border-[#e0e0e0] mb-8">
          {(['work', 'shortBreak', 'longBreak'] as Mode[]).map((m) => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#0066cc] text-white font-semibold shadow-xs'
                    : 'text-[#1d1d1f] hover:text-[#0066cc]'
                }`}
              >
                {MODE_CONFIGS[m].name}
              </button>
            );
          })}
        </div>

        {/* Selected Task Dropdown Binding */}
        <div className="w-full max-w-md bg-[#f5f5f7] border border-[#e0e0e0] rounded-[16px] p-4 mb-8 text-left">
          <label className="block text-[12px] font-semibold text-[#7a7a7a] uppercase tracking-wider mb-1.5">
            Fokus Pada Tugas Ini:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full bg-[#ffffff] border border-[#e0e0e0] text-[#1d1d1f] text-[14px] font-semibold rounded-lg p-2.5 outline-none focus:border-[#0066cc]"
          >
            {tasks.length === 0 ? (
              <option value="">(Belum ada tugas di database)</option>
            ) : (
              tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.type})
                </option>
              ))
            )}
          </select>

          {selectedTask && (
            <div className="mt-2.5 flex items-center justify-between text-[12px] text-[#7a7a7a]">
              <span>Deadline: {selectedTask.deadline}</span>
              <span className="flex items-center space-x-1 text-[#0066cc] font-medium">
                <Award className="w-3.5 h-3.5" />
                <span>{selectedTask.pomodoroSessionsCompleted || 0} Sesi Selesai</span>
              </span>
            </div>
          )}
        </div>

        {/* Circular Apple Progress Ring & Timer */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 my-4 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-[#f5f5f7]"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={currentConfig.color}
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[52px] md:text-[60px] font-bold text-[#1d1d1f] tracking-tighter leading-none font-sans">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[14px] font-medium text-[#7a7a7a] mt-2">
              {currentConfig.name}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-full bg-[#f5f5f7] hover:bg-[#e0e0e0] flex items-center justify-center text-[#1d1d1f] transition-transform active:scale-95"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-full text-[17px] font-semibold text-white transition-transform active:scale-95 shadow-md flex items-center space-x-2 ${
              isRunning ? 'bg-[#ff3b30]' : 'bg-[#0066cc]'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isRunning ? 'Jeda' : 'Mulai Fokus'}</span>
          </button>

          <button
            onClick={() => handleModeChange(mode === 'work' ? 'shortBreak' : 'work')}
            className="w-12 h-12 rounded-full bg-[#f5f5f7] hover:bg-[#e0e0e0] flex items-center justify-center text-[#1d1d1f] transition-transform active:scale-95"
            title="Lewati Sesi"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Stats Summary Card */}
      <div className="bg-[#f5f5f7] border border-[#e0e0e0] rounded-[18px] p-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 flex items-center justify-center text-[#0066cc]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[15px] font-semibold text-[#1d1d1f]">Total Sesi Selesai Hari Ini</h4>
            <p className="text-[12px] text-[#7a7a7a]">Teknik Pomodoro Standard (25 Mnt Kerja / 5 Mnt Istirahat)</p>
          </div>
        </div>

        <div className="text-[24px] font-bold text-[#0066cc]">
          {completedSessionsCount} Sesi
        </div>
      </div>

    </div>
  );
};
