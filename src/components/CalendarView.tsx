import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { TaskItem } from '../types';

interface CalendarViewProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onAddNewTaskOnDate: (dateStr: string) => void;
  isGCalConnected: boolean;
  onSyncGCal: () => void;
  isSyncing: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onSelectTask,
  onAddNewTaskOnDate,
  isGCalConnected,
  onSyncGCal,
  isSyncing,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() - 7);
      setCurrentDate(newD);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() + 7);
      setCurrentDate(newD);
    }
  };

  const todayPeriod = () => {
    setCurrentDate(new Date());
    setSelectedDateStr(new Date().toISOString().split('T')[0]);
  };

  // Generate Days for Month View
  const getDaysInMonth = () => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date: prevDate,
        dateStr: prevDate.toISOString().split('T')[0],
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const currDate = new Date(year, month, d);
      days.push({
        date: currDate,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: true,
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let j = 1; j <= remaining; j++) {
      const nextDate = new Date(year, month + 1, j);
      days.push({
        date: nextDate,
        dateStr: nextDate.toISOString().split('T')[0],
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Generate Days for Week View
  const getDaysInWeek = () => {
    const curr = new Date(currentDate);
    const firstDayOfWeek = curr.getDate() - curr.getDay();
    const days = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(curr.setDate(firstDayOfWeek + i));
      const y = dayDate.getFullYear();
      const m = String(dayDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayDate.getDate()).padStart(2, '0');
      days.push({
        date: new Date(dayDate),
        dateStr: `${y}-${m}-${d}`,
        isCurrentMonth: dayDate.getMonth() === month,
      });
    }
    return days;
  };

  const daysList = viewMode === 'month' ? getDaysInMonth() : getDaysInWeek();

  // Tasks for the selected date
  const tasksForSelectedDate = tasks.filter((t) => t.deadline === selectedDateStr);

  const getTagColorClass = (type: string) => {
    switch (type) {
      case 'Jadwal GCal':
        return 'bg-[#4285f4]/15 text-[#4285f4] border-[#4285f4]/30';
      case 'Kuis':
        return 'bg-[#ff3b30]/15 text-[#ff3b30] border-[#ff3b30]/30';
      case 'Baca':
        return 'bg-[#af52de]/15 text-[#af52de] border-[#af52de]/30';
      case 'Nulis Makalah':
        return 'bg-[#ff9500]/15 text-[#ff9500] border-[#ff9500]/30';
      case 'Projek Kelompok':
        return 'bg-[#34c759]/15 text-[#34c759] border-[#34c759]/30';
      default:
        return 'bg-[#0066cc]/15 text-[#0066cc] border-[#0066cc]/30';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Calendar Control Header */}
      <div className="bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        
        {/* Month Title & Nav */}
        <div className="flex items-center space-x-3">
          <h2 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight min-w-[200px]">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center bg-[#f5f5f7] border border-[#e0e0e0] rounded-full p-0.5">
            <button
              onClick={prevPeriod}
              className="p-1.5 hover:bg-[#ffffff] rounded-full text-[#1d1d1f] transition-colors"
              aria-label="Sebelummnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={todayPeriod}
              className="px-3 py-1 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#ffffff] rounded-full transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 hover:bg-[#ffffff] rounded-full text-[#1d1d1f] transition-colors"
              aria-label="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle & GCal Sync CTA */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          
          {/* Segmented Control Month/Week */}
          <div className="flex items-center bg-[#f5f5f7] p-1 rounded-full border border-[#e0e0e0]">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1 text-[13px] font-medium rounded-full transition-all ${
                viewMode === 'month'
                  ? 'bg-[#0066cc] text-white font-semibold shadow-xs'
                  : 'text-[#1d1d1f] hover:text-[#0066cc]'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3.5 py-1 text-[13px] font-medium rounded-full transition-all ${
                viewMode === 'week'
                  ? 'bg-[#0066cc] text-white font-semibold shadow-xs'
                  : 'text-[#1d1d1f] hover:text-[#0066cc]'
              }`}
            >
              Mingguan
            </button>
          </div>

          {/* Sync Button */}
          <button
            onClick={onSyncGCal}
            disabled={isSyncing}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-[13px] font-medium transition-transform active:scale-95 border ${
              isGCalConnected
                ? 'bg-[#0066cc]/10 border-[#0066cc] text-[#0066cc]'
                : 'bg-[#f5f5f7] border-[#e0e0e0] text-[#1d1d1f] hover:border-[#0066cc]'
            }`}
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0066cc]" />
            ) : isGCalConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0066cc]" />
            ) : (
              <CalendarIcon className="w-3.5 h-3.5 text-[#7a7a7a]" />
            )}
            <span>{isGCalConnected ? 'Tersinkron GCal' : 'Sync GCal'}</span>
          </button>
        </div>

      </div>

      {/* Main Grid & Inspector Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Calendar Grid (3 Cols on Large) */}
        <div className="lg:col-span-3 bg-[#ffffff] border border-[#e0e0e0] rounded-[18px] p-4 md:p-6 shadow-xs">
          
          {/* Day Names Row */}
          <div className="grid grid-cols-7 text-center mb-3">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-[12px] font-semibold text-[#7a7a7a] uppercase py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className={`grid grid-cols-7 gap-1 md:gap-2 ${viewMode === 'week' ? 'min-h-[280px]' : ''}`}>
            {daysList.map((dayItem, idx) => {
              const dayTasks = tasks.filter((t) => t.deadline === dayItem.dateStr);
              const isToday = dayItem.dateStr === todayStr;
              const isSelected = dayItem.dateStr === selectedDateStr;

              return (
                <div
                  key={`${dayItem.dateStr}-${idx}`}
                  onClick={() => setSelectedDateStr(dayItem.dateStr)}
                  className={`min-h-[90px] md:min-h-[110px] p-2 rounded-[14px] border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0066cc] bg-[#0066cc]/5 ring-1 ring-[#0066cc]'
                      : isToday
                      ? 'border-[#0066cc]/50 bg-[#f5f5f7]'
                      : dayItem.isCurrentMonth
                      ? 'border-[#f0f0f0] bg-[#ffffff] hover:border-[#0066cc]/40 hover:bg-[#f5f5f7]/50'
                      : 'border-[#f0f0f0] bg-[#f5f5f7]/40 text-[#7a7a7a]/50'
                  }`}
                >
                  {/* Date Number Badge */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[13px] font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#0066cc] text-white'
                          : dayItem.isCurrentMonth
                          ? 'text-[#1d1d1f]'
                          : 'text-[#7a7a7a]'
                      }`}
                    >
                      {dayItem.date.getDate()}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-[#0066cc] bg-[#0066cc]/10 px-1.5 py-0.5 rounded-full">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Chips on Date Cell */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(task);
                        }}
                        className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md border truncate transition-transform hover:scale-102 ${getTagColorClass(
                          task.type
                        )}`}
                      >
                        {task.time ? `${task.time} ` : ''}{task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[10px] text-[#7a7a7a] font-medium pl-1">
                        +{dayTasks.length - 2} tugas lainnya
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Selected Date Inspector Panel (1 Col) */}
        <div className="bg-[#f5f5f7] border border-[#e0e0e0] rounded-[18px] p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3 mb-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[#1d1d1f] tracking-tight">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <p className="text-[12px] text-[#7a7a7a]">
                  {tasksForSelectedDate.length} agenda/tugas tercatat
                </p>
              </div>

              <button
                onClick={() => onAddNewTaskOnDate(selectedDateStr)}
                className="w-8 h-8 rounded-full bg-[#0066cc] text-white flex items-center justify-center hover:bg-[#0071e3] transition-transform active:scale-95 shadow-xs"
                title="Tambah tugas pada tanggal ini"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of Tasks on Selected Date */}
            {tasksForSelectedDate.length === 0 ? (
              <div className="py-12 text-center text-[#7a7a7a] space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-[#e0e0e0]" />
                <p className="text-[14px]">Tidak ada agenda di tanggal ini.</p>
                <button
                  onClick={() => onAddNewTaskOnDate(selectedDateStr)}
                  className="text-[13px] text-[#0066cc] font-medium hover:underline mt-2 inline-block"
                >
                  + Tambah tugas baru
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {tasksForSelectedDate.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="bg-[#ffffff] border border-[#e0e0e0] hover:border-[#0066cc] p-3.5 rounded-[14px] cursor-pointer transition-all space-y-2 group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[14px] font-semibold text-[#1d1d1f] leading-snug group-hover:text-[#0066cc] transition-colors">
                        {task.title}
                      </h4>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${getTagColorClass(task.type)}`}>
                        {task.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[12px] text-[#7a7a7a]">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-[#0066cc]" />
                        <span>{task.time || 'Sepanjang Hari'}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        task.progress === 'Selesai'
                          ? 'bg-[#34c759]/10 text-[#34c759]'
                          : task.progress === 'Lagi Dikerjakan'
                          ? 'bg-[#ff9500]/10 text-[#ff9500]'
                          : 'bg-[#8e8e93]/10 text-[#8e8e93]'
                      }`}>
                        {task.progress}
                      </span>
                    </div>

                    {task.notes && (
                      <p className="text-[12px] text-[#7a7a7a] line-clamp-2 pt-1 border-t border-[#f0f0f0]">
                        {task.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onAddNewTaskOnDate(selectedDateStr)}
            className="mt-4 w-full py-2.5 bg-[#ffffff] border border-[#e0e0e0] hover:border-[#0066cc] hover:text-[#0066cc] text-[#1d1d1f] text-[13px] font-medium rounded-full transition-all flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-[#0066cc]" />
            <span>Tambah ke {selectedDateStr}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
