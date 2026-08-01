import React from 'react';
import { Plus, Clock, Tag, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { TaskItem, EisenhowerQuadrant, TaskProgress } from '../types';

interface EisenhowerViewProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onOpenNewTaskModal: () => void;
  onUpdateTaskQuadrant: (taskId: string, newQuadrant: EisenhowerQuadrant) => void;
  onUpdateTaskProgress: (taskId: string, newProgress: TaskProgress) => void;
}

const QUADRANTS: {
  id: EisenhowerQuadrant;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
}[] = [
  {
    id: 'Do Now',
    title: 'Urgent & Important (Do Now)',
    subtitle: 'Kerjakan Segera - Prioritas Tertinggi',
    accentColor: 'text-[#ff3b30]',
    badgeBg: 'bg-[#ff3b30]/10 text-[#ff3b30]',
    borderColor: 'border-[#ff3b30]/30',
  },
  {
    id: 'Schedule',
    title: 'Not Urgent but Important (Schedule)',
    subtitle: 'Jadwalkan Waktu Pengerjaan Spesifik',
    accentColor: 'text-[#0066cc]',
    badgeBg: 'bg-[#0066cc]/10 text-[#0066cc]',
    borderColor: 'border-[#0066cc]/30',
  },
  {
    id: 'Delegate',
    title: 'Urgent but Not Important (Delegate)',
    subtitle: 'Mendesak Tapi Bisa Didelegasikan / Otomatisasi',
    accentColor: 'text-[#ff9500]',
    badgeBg: 'bg-[#ff9500]/10 text-[#ff9500]',
    borderColor: 'border-[#ff9500]/30',
  },
  {
    id: 'Delete',
    title: 'Not Urgent & Not Important (Delete)',
    subtitle: 'Eliminasi atau Kerjakan Jika Ada Waktu Luang',
    accentColor: 'text-[#8e8e93]',
    badgeBg: 'bg-[#8e8e93]/10 text-[#8e8e93]',
    borderColor: 'border-[#8e8e93]/30',
  },
];

export const EisenhowerView: React.FC<EisenhowerViewProps> = ({
  tasks,
  onSelectTask,
  onOpenNewTaskModal,
  onUpdateTaskQuadrant,
  onUpdateTaskProgress,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Matrix Subtitle Header */}
      <div className="bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-[20px] font-semibold text-[#1d1d1f] tracking-tight">
            Eisenhower Decision Matrix
          </h2>
          <p className="text-[13px] text-[#7a7a7a] mt-0.5">
            Kelola prioritas tugas Anda secara real-time berdasarkan tingkat urgensi dan kepentingan.
          </p>
        </div>

        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center space-x-1.5 bg-[#0066cc] text-white px-4 py-2 rounded-full text-[14px] font-semibold transition-transform active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* 4 Quadrants Grid Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {QUADRANTS.map((quad) => {
          const quadTasks = tasks.filter((t) => t.eisenhower === quad.id);

          return (
            <div
              key={quad.id}
              className={`bg-[#f5f5f7] border ${quad.borderColor} rounded-[18px] p-5 flex flex-col shadow-xs min-h-[360px]`}
            >
              {/* Quadrant Header */}
              <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3 mb-4">
                <div>
                  <h3 className={`text-[17px] font-semibold tracking-tight ${quad.accentColor}`}>
                    {quad.title}
                  </h3>
                  <p className="text-[12px] text-[#7a7a7a]">{quad.subtitle}</p>
                </div>

                <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${quad.badgeBg}`}>
                  {quadTasks.length} Task
                </span>
              </div>

              {/* Tasks List inside Quadrant */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[480px]">
                {quadTasks.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-[#7a7a7a] border border-dashed border-[#e0e0e0] rounded-[14px]">
                    <p className="text-[13px]">Kosong di kuadran ini</p>
                  </div>
                ) : (
                  quadTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="bg-[#ffffff] border border-[#e0e0e0] hover:border-[#0066cc] p-4 rounded-[14px] cursor-pointer transition-all space-y-3 group shadow-2xs hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[15px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors leading-snug">
                          {task.title}
                        </h4>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-[#f5f5f7] text-[#1d1d1f] whitespace-nowrap">
                          {task.type}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[12px] text-[#7a7a7a] pt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-[#0066cc]" />
                          <span>{task.deadline} {task.time ? `• ${task.time}` : ''}</span>
                        </span>

                        {/* Quick Progress Selector */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={task.progress}
                            onChange={(e) => onUpdateTaskProgress(task.id, e.target.value as TaskProgress)}
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border outline-none cursor-pointer ${
                              task.progress === 'Selesai'
                                ? 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/30'
                                : task.progress === 'Lagi Dikerjakan'
                                ? 'bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/30'
                                : 'bg-[#f5f5f7] text-[#1d1d1f] border-[#e0e0e0]'
                            }`}
                          >
                            <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                            <option value="Lagi Dikerjakan">Lagi Dikerjakan</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </div>
                      </div>

                      {task.notes && (
                        <p className="text-[12px] text-[#7a7a7a] line-clamp-2 pt-2 border-t border-[#f0f0f0]">
                          {task.notes}
                        </p>
                      )}

                      {/* Quick Move Quadrant Control */}
                      <div 
                        className="pt-2 flex items-center justify-between text-[11px] text-[#7a7a7a]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="flex items-center space-x-1 text-[#0066cc]">
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Pindah Kuadran:</span>
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {(['Do Now', 'Schedule', 'Delegate', 'Delete'] as EisenhowerQuadrant[]).map((q) => {
                            if (q === task.eisenhower) return null;
                            return (
                              <button
                                key={q}
                                onClick={() => onUpdateTaskQuadrant(task.id, q)}
                                className="px-2 py-0.5 rounded bg-[#f5f5f7] hover:bg-[#0066cc] hover:text-white transition-colors text-[10px]"
                                title={`Pindah ke ${q}`}
                              >
                                {q.split(' ')[0]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* Add task button inside quadrant */}
              <button
                onClick={onOpenNewTaskModal}
                className="mt-4 w-full py-2 bg-[#ffffff] border border-[#e0e0e0] hover:border-[#0066cc] text-[#0066cc] text-[13px] font-medium rounded-full transition-all flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah ke {quad.id}</span>
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};
