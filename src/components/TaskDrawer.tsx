import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Tag, CheckCircle, AlertCircle, FileText, CalendarPlus, Trash2 } from 'lucide-react';
import { TaskItem, TaskType, TaskProgress, EisenhowerQuadrant } from '../types';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: TaskItem, syncToGCal: boolean) => void;
  onDeleteTask?: (taskId: string) => void;
  editingTask: TaskItem | null;
  isGCalConnected: boolean;
}

const DEFAULT_TAGS: TaskType[] = [
  'Tugas Biasa',
  'Baca',
  'Nulis Makalah',
  'Kuis',
  'Projek Kelompok',
  'Jadwal GCal',
];

const EISENHOWER_OPTIONS: { id: EisenhowerQuadrant; label: string; desc: string; badgeBg: string }[] = [
  { id: 'Do Now', label: 'Do Now (Kuadran I)', desc: 'Mendesak & Penting', badgeBg: 'bg-[#ff3b30]/10 text-[#ff3b30]' },
  { id: 'Schedule', label: 'Schedule (Kuadran II)', desc: 'Tidak Mendesak, Penting', badgeBg: 'bg-[#0066cc]/10 text-[#0066cc]' },
  { id: 'Delegate', label: 'Delegate (Kuadran III)', desc: 'Mendesak, Tidak Penting', badgeBg: 'bg-[#ff9500]/10 text-[#ff9500]' },
  { id: 'Delete', label: 'Delete (Kuadran IV)', desc: 'Tidak Mendesak & Tidak Penting', badgeBg: 'bg-[#8e8e93]/10 text-[#8e8e93]' },
];

export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  onDeleteTask,
  editingTask,
  isGCalConnected,
}) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<TaskType>('Tugas Biasa');
  const [customType, setCustomType] = useState('');
  const [isCustomTypeActive, setIsCustomTypeActive] = useState(false);
  const [progress, setProgress] = useState<TaskProgress>('Belum Dikerjakan');
  const [eisenhower, setEisenhower] = useState<EisenhowerQuadrant>('Do Now');
  const [notes, setNotes] = useState('');
  const [syncToGCal, setSyncToGCal] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDeadline(editingTask.deadline || new Date().toISOString().split('T')[0]);
      setTime(editingTask.time || '09:00');
      if (DEFAULT_TAGS.includes(editingTask.type)) {
        setType(editingTask.type);
        setIsCustomTypeActive(false);
      } else {
        setType(editingTask.type);
        setCustomType(editingTask.type);
        setIsCustomTypeActive(true);
      }
      setProgress(editingTask.progress);
      setEisenhower(editingTask.eisenhower);
      setNotes(editingTask.notes || '');
      setSyncToGCal(editingTask.syncedToGCal || false);
    } else {
      // Reset form for new task
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDeadline(today);
      setTime('09:00');
      setType('Tugas Biasa');
      setIsCustomTypeActive(false);
      setCustomType('');
      setProgress('Belum Dikerjakan');
      setEisenhower('Do Now');
      setNotes('');
      setSyncToGCal(isGCalConnected);
    }
  }, [editingTask, isOpen, isGCalConnected]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedType = isCustomTypeActive && customType.trim() ? customType.trim() : type;

    const taskToSave: TaskItem = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: title.trim(),
      deadline: deadline || new Date().toISOString().split('T')[0],
      time: time || '09:00',
      type: selectedType,
      progress,
      eisenhower,
      notes: notes.trim(),
      syncedToGCal: editingTask ? editingTask.syncedToGCal : syncToGCal,
      gcalEventId: editingTask?.gcalEventId,
      pomodoroSessionsCompleted: editingTask ? editingTask.pomodoroSessionsCompleted : 0,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
    };

    onSaveTask(taskToSave, syncToGCal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Side Peek Drawer Sheet */}
      <div className="relative w-full max-w-lg bg-[#ffffff] h-full shadow-2xl overflow-y-auto flex flex-col z-10 border-l border-[#e0e0e0]">
        
        {/* Drawer Header */}
        <div className="sticky top-0 bg-[#ffffff] border-b border-[#e0e0e0] px-6 py-4 flex items-center justify-between z-20">
          <div>
            <h2 className="text-[19px] font-semibold text-[#1d1d1f] tracking-tight">
              {editingTask ? 'Edit Detail Tugas' : 'Tambah Tugas Baru'}
            </h2>
            <p className="text-[12px] text-[#7a7a7a]">
              Master Database Notion × Synchronized Layer
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e0e0e0] flex items-center justify-center text-[#1d1d1f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 space-y-6">
          
          {/* 1. Nama Tugas / Acara */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wider mb-2">
              Nama Tugas / Acara <span className="text-[#ff3b30]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Misal: Persiapan TKA 2026, Review UUD 1945..."
              className="w-full bg-[#f5f5f7] border border-[#e0e0e0] focus:border-[#0066cc] focus:bg-[#ffffff] text-[#1d1d1f] text-[16px] rounded-lg px-4 py-3 outline-none transition-all placeholder:text-[#7a7a7a]"
            />
          </div>

          {/* 2. Deadline & Waktu */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-1 text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wider mb-2">
                <CalendarIcon className="w-3.5 h-3.5 text-[#0066cc]" />
                <span>Deadline</span>
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#f5f5f7] border border-[#e0e0e0] focus:border-[#0066cc] text-[#1d1d1f] text-[14px] rounded-lg px-3 py-2.5 outline-none"
              />
            </div>
            <div>
              <label className="flex items-center space-x-1 text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 text-[#0066cc]" />
                <span>Jam</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#f5f5f7] border border-[#e0e0e0] focus:border-[#0066cc] text-[#1d1d1f] text-[14px] rounded-lg px-3 py-2.5 outline-none"
              />
            </div>
          </div>

          {/* 3. Tipe (Customizable Tags) */}
          <div>
            <label className="flex items-center space-x-1 text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wider mb-2">
              <Tag className="w-3.5 h-3.5 text-[#0066cc]" />
              <span>Tipe / Tag Tugas</span>
            </label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {DEFAULT_TAGS.map((tagItem) => {
                const isSelected = !isCustomTypeActive && type === tagItem;
                return (
                  <button
                    key={tagItem}
                    type="button"
                    onClick={() => {
                      setType(tagItem);
                      setIsCustomTypeActive(false);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                      isSelected
                        ? 'bg-[#0066cc] text-white shadow-xs'
                        : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e0e0e0]'
                    }`}
                  >
                    {tagItem}
                  </button>
                );
              })}
              
              <button
                type="button"
                onClick={() => setIsCustomTypeActive(true)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium border border-dashed transition-all ${
                  isCustomTypeActive
                    ? 'border-[#0066cc] bg-[#0066cc]/10 text-[#0066cc]'
                    : 'border-[#7a7a7a] text-[#7a7a7a] hover:border-[#0066cc]'
                }`}
              >
                + Custom Tag
              </button>
            </div>

            {isCustomTypeActive && (
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Tuliskan nama tag kustom Anda..."
                className="w-full bg-[#f5f5f7] border border-[#0066cc] text-[#1d1d1f] text-[14px] rounded-lg px-3 py-2 outline-none animate-fade-in"
              />
            )}
          </div>

          {/* 4. Progress (Customizable Status) */}
          <div>
            <label className="flex items-center space-x-1 text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wider mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#0066cc]" />
              <span>Status Progress</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Belum Dikerjakan', 'Lagi Dikerjakan', 'Selesai'] as TaskProgress[]).map((p) => {
                const isSelected = progress === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProgress(p)}
                    className={`py-2 px-2 rounded-lg text-[13px] font-medium border transition-all ${
                      isSelected
                        ? p === 'Selesai'
                          ? 'bg-[#34c759]/10 border-[#34c759] text-[#34c759] font-semibold'
                          : p === 'Lagi Dikerjakan'
                          ? 'bg-[#ff9500]/10 border-[#ff9500] text-[#ff9500] font-semibold'
                          : 'bg-[#0066cc]/10 border-[#0066cc] text-[#0066cc] font-semibold'
                        : 'bg-[#f5f5f7] border-[#e0e0e0] text-[#1d1d1f]'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Eisenhower Matrix Quadrant */}
          <div>
            <label className="flex items-center space-x-1 text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wider mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#0066cc]" />
              <span>Kuadran Eisenhower</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {EISENHOWER_OPTIONS.map((opt) => {
                const isSelected = eisenhower === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setEisenhower(opt.id)}
                    className={`p-3 rounded-[12px] border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#0066cc] bg-[#0066cc]/5 ring-1 ring-[#0066cc]'
                        : 'border-[#e0e0e0] bg-[#f5f5f7] hover:border-[#7a7a7a]'
                    }`}
                  >
                    <div>
                      <div className="text-[14px] font-semibold text-[#1d1d1f]">
                        {opt.label}
                      </div>
                      <div className="text-[12px] text-[#7a7a7a]">{opt.desc}</div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${opt.badgeBg}`}>
                      {opt.id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. Notes / Catatan Detail */}
          <div>
            <label className="flex items-center space-x-1 text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5 text-[#0066cc]" />
              <span>Catatan / Ketentuan Penilaian</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan ketentuan tugas, materi bab, link referensi, atau catatan tambahan di sini..."
              className="w-full bg-[#f5f5f7] border border-[#e0e0e0] focus:border-[#0066cc] focus:bg-[#ffffff] text-[#1d1d1f] text-[14px] rounded-lg p-3 outline-none transition-all placeholder:text-[#7a7a7a]"
            />
          </div>

          {/* 7. Google Calendar Sync Checkbox */}
          <div className="bg-[#f5f5f7] border border-[#e0e0e0] rounded-[14px] p-4 flex items-center space-x-3">
            <input
              type="checkbox"
              id="sync-gcal-checkbox"
              checked={syncToGCal}
              onChange={(e) => setSyncToGCal(e.target.checked)}
              className="w-5 h-5 text-[#0066cc] rounded border-[#e0e0e0] focus:ring-[#0066cc] cursor-pointer"
            />
            <label htmlFor="sync-gcal-checkbox" className="text-[13px] text-[#1d1d1f] cursor-pointer flex-1">
              <span className="font-semibold block flex items-center space-x-1.5">
                <CalendarPlus className="w-4 h-4 text-[#0066cc]" />
                <span>Otomatis Sinkronkan ke Google Calendar</span>
              </span>
              <span className="text-[11px] text-[#7a7a7a] block mt-0.5">
                {isGCalConnected 
                  ? 'Tugas ini akan otomatis dikirim sebagai acara di Google Calendar Anda.'
                  : 'Anda dapat mengotorisasi Google Calendar di tombol Sync pada header.'}
              </span>
            </label>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#ffffff] border-t border-[#e0e0e0] px-6 py-4 flex items-center justify-between z-20">
          {editingTask && onDeleteTask ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
                  onDeleteTask(editingTask.id);
                  onClose();
                }
              }}
              className="flex items-center space-x-1.5 text-[#ff3b30] hover:bg-[#ff3b30]/10 px-3 py-2 rounded-full text-[13px] font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </button>
          ) : <div />}

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-[14px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-full text-[14px] font-semibold bg-[#0066cc] hover:bg-[#0071e3] text-white transition-transform active:scale-95 shadow-sm"
            >
              {editingTask ? 'Simpan Perubahan' : 'Buat Tugas'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
