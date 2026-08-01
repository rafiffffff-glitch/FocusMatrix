import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpDown, 
  CheckCircle2, 
  Clock, 
  Tag, 
  AlertCircle, 
  MoreHorizontal, 
  Calendar as CalendarIcon,
  Trash2,
  Edit2
} from 'lucide-react';
import { TaskItem, TaskProgress, EisenhowerQuadrant } from '../types';

interface TaskTableViewProps {
  tasks: TaskItem[];
  searchQuery: string;
  onSelectTask: (task: TaskItem) => void;
  onOpenNewTaskModal: () => void;
  onUpdateTaskProgress: (taskId: string, newProgress: TaskProgress) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  searchQuery,
  onSelectTask,
  onOpenNewTaskModal,
  onUpdateTaskProgress,
  onDeleteTask,
}) => {
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('Semua');
  const [selectedProgressFilter, setSelectedProgressFilter] = useState<string>('Semua');
  const [sortField, setSortField] = useState<'deadline' | 'title' | 'progress'>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Collect unique tags
  const allTags = ['Semua', ...Array.from(new Set(tasks.map((t) => t.type)))];

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      selectedTagFilter === 'Semua' || task.type === selectedTagFilter;

    const matchesProgress =
      selectedProgressFilter === 'Semua' || task.progress === selectedProgressFilter;

    return matchesSearch && matchesTag && matchesProgress;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'deadline') {
      comparison = a.deadline.localeCompare(b.deadline);
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'progress') {
      comparison = a.progress.localeCompare(b.progress);
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'deadline' | 'title' | 'progress') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getTagBadgeClass = (type: string) => {
    switch (type) {
      case 'Jadwal GCal':
        return 'bg-[#4285f4]/10 text-[#4285f4] border-[#4285f4]/30';
      case 'Kuis':
        return 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/30';
      case 'Baca':
        return 'bg-[#af52de]/10 text-[#af52de] border-[#af52de]/30';
      case 'Nulis Makalah':
        return 'bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/30';
      case 'Projek Kelompok':
        return 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/30';
      default:
        return 'bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/30';
    }
  };

  const getEisenhowerBadge = (quadrant: EisenhowerQuadrant) => {
    switch (quadrant) {
      case 'Do Now':
        return { label: 'Do Now', bg: 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/30' };
      case 'Schedule':
        return { label: 'Schedule', bg: 'bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/30' };
      case 'Delegate':
        return { label: 'Delegate', bg: 'bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/30' };
      case 'Delete':
        return { label: 'Delete', bg: 'bg-[#8e8e93]/10 text-[#8e8e93] border-[#8e8e93]/30' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Notion Filter Toolbar */}
      <div className="bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        
        {/* Tag Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[12px] font-semibold text-[#7a7a7a] uppercase tracking-wider mr-1">
            Tag:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTagFilter(tag)}
              className={`px-3 py-1 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                selectedTagFilter === tag
                  ? 'bg-[#0066cc] text-white font-semibold shadow-xs'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e0e0e0]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-[12px] font-semibold text-[#7a7a7a] uppercase tracking-wider">
            Status:
          </span>
          <select
            value={selectedProgressFilter}
            onChange={(e) => setSelectedProgressFilter(e.target.value)}
            className="bg-[#f5f5f7] border border-[#e0e0e0] text-[#1d1d1f] text-[13px] rounded-full px-3 py-1.5 outline-none focus:border-[#0066cc]"
          >
            <option value="Semua">Semua Status</option>
            <option value="Belum Dikerjakan">Belum Dikerjakan</option>
            <option value="Lagi Dikerjakan">Lagi Dikerjakan</option>
            <option value="Selesai">Selesai</option>
          </select>

          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center space-x-1.5 bg-[#0066cc] text-white px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-transform active:scale-95 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

      </div>

      {/* Notion Master Table Container */}
      <div className="bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#f5f5f7] border-b border-[#e0e0e0] text-[12px] font-semibold text-[#7a7a7a] uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                
                {/* Title */}
                <th 
                  onClick={() => toggleSort('title')} 
                  className="py-3.5 px-4 cursor-pointer hover:text-[#0066cc] transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Nama Tugas / Acara</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* Deadline */}
                <th 
                  onClick={() => toggleSort('deadline')} 
                  className="py-3.5 px-4 cursor-pointer hover:text-[#0066cc] transition-colors w-36"
                >
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#0066cc]" />
                    <span>Deadline</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* Type Tag */}
                <th className="py-3.5 px-4 w-36">
                  <div className="flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-[#0066cc]" />
                    <span>Tipe</span>
                  </div>
                </th>

                {/* Progress */}
                <th 
                  onClick={() => toggleSort('progress')} 
                  className="py-3.5 px-4 cursor-pointer hover:text-[#0066cc] transition-colors w-40"
                >
                  <div className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0066cc]" />
                    <span>Progress</span>
                  </div>
                </th>

                {/* Eisenhower */}
                <th className="py-3.5 px-4 w-36">
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-[#0066cc]" />
                    <span>Eisenhower</span>
                  </div>
                </th>

                {/* Notes preview */}
                <th className="py-3.5 px-4 max-w-xs">Catatan</th>

                {/* Action */}
                <th className="py-3.5 px-4 w-16 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f0f0f0] text-[14px]">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7a7a7a]">
                    Tidak ada tugas yang ditemukan. Klik "+ Tambah Tugas" untuk membuat tugas baru.
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task, idx) => {
                  const eisenhowerBadge = getEisenhowerBadge(task.eisenhower);
                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="hover:bg-[#f5f5f7]/80 cursor-pointer transition-colors group"
                    >
                      {/* Row number */}
                      <td className="py-3.5 px-4 text-center text-[#7a7a7a] text-[12px] font-mono">
                        {idx + 1}
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4 font-medium text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors">
                        <div className="flex items-center space-x-2">
                          <span className={task.progress === 'Selesai' ? 'line-through text-[#7a7a7a]' : ''}>
                            {task.title}
                          </span>
                          {task.syncedToGCal && (
                            <span 
                              className="text-[10px] font-bold text-[#0066cc] bg-[#0066cc]/10 px-1.5 py-0.5 rounded-full"
                              title="Tersinkron dengan Google Calendar"
                            >
                              GCal
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-4 text-[#1d1d1f] whitespace-nowrap text-[13px]">
                        <div className="font-semibold">{task.deadline}</div>
                        <div className="text-[11px] text-[#7a7a7a]">{task.time || '09:00'}</div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-medium border ${getTagBadgeClass(task.type)}`}>
                          {task.type}
                        </span>
                      </td>

                      {/* Progress Toggle */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.progress}
                          onChange={(e) => onUpdateTaskProgress(task.id, e.target.value as TaskProgress)}
                          className={`text-[12px] font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                            task.progress === 'Selesai'
                              ? 'bg-[#34c759]/15 text-[#34c759] border-[#34c759]/30'
                              : task.progress === 'Lagi Dikerjakan'
                              ? 'bg-[#ff9500]/15 text-[#ff9500] border-[#ff9500]/30'
                              : 'bg-[#f5f5f7] text-[#1d1d1f] border-[#e0e0e0]'
                          }`}
                        >
                          <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                          <option value="Lagi Dikerjakan">Lagi Dikerjakan</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </td>

                      {/* Eisenhower */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${eisenhowerBadge.bg}`}>
                          {eisenhowerBadge.label}
                        </span>
                      </td>

                      {/* Notes Preview */}
                      <td className="py-3.5 px-4 text-[#7a7a7a] text-[13px] truncate max-w-xs">
                        {task.notes || '-'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onSelectTask(task)}
                            className="p-1.5 rounded-full hover:bg-[#e0e0e0] text-[#7a7a7a] hover:text-[#0066cc]"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus "${task.title}"?`)) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="p-1.5 rounded-full hover:bg-[#ff3b30]/10 text-[#7a7a7a] hover:text-[#ff3b30]"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Add Row */}
        <div className="bg-[#f5f5f7] px-4 py-3 border-t border-[#e0e0e0]">
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center space-x-2 text-[#0066cc] hover:text-[#0071e3] text-[13px] font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Baris Tugas Baru</span>
          </button>
        </div>
      </div>

    </div>
  );
};
