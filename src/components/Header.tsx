import React from 'react';
import { Calendar, ListTodo, LayoutGrid, Timer, Search, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewTaskModal: () => void;
  isGCalConnected: boolean;
  isSyncing: boolean;
  onSyncGCal: () => void;
  user: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenNewTaskModal,
  isGCalConnected,
  isSyncing,
  onSyncGCal,
  user,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'calendar', label: 'Kalender', icon: <Calendar className="w-4 h-4" /> },
    { id: 'database', label: 'List Tugas', icon: <ListTodo className="w-4 h-4" /> },
    { id: 'eisenhower', label: 'Eisenhower Matrix', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'pomodoro', label: 'Pomodoro Timer', icon: <Timer className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#ffffff] border-b border-[#e0e0e0] px-4 md:px-8 pt-4 pb-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Brand & App Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#0066cc] flex items-center justify-center text-white font-semibold text-lg shadow-sm">
              
            </div>
            <div>
              <h1 className="text-[20px] font-semibold text-[#1d1d1f] tracking-tight leading-tight font-sans">
                Task & Calendar
              </h1>
            </div>
          </div>

          {/* Quick Add Button on Mobile */}
          <button
            onClick={onOpenNewTaskModal}
            className="md:hidden flex items-center justify-center w-10 h-10 bg-[#0066cc] text-white rounded-full transition-transform active:scale-95"
            aria-label="Tambah Tugas"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Control / Navigation Bar */}
        <nav className="flex items-center bg-[#f5f5f7] p-1 rounded-full border border-[#e0e0e0] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0066cc] text-white shadow-sm font-semibold'
                    : 'text-[#1d1d1f] hover:text-[#0066cc] hover:bg-[#ffffff]/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Search, Google Sync, & Primary Action */}
        <div className="flex items-center space-x-2 md:space-x-3 justify-end">
          {/* Search Input (Pill Shaped) */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 absolute left-3 top.1/2 -translate-y-1/2 text-[#7a7a7a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas, tag, catatan..."
              className="w-full bg-[#f5f5f7] border border-[#e0e0e0] focus:border-[#0066cc] focus:bg-[#ffffff] text-[#1d1d1f] text-[14px] rounded-full pl-9 pr-4 py-2 outline-none transition-all placeholder:text-[#7a7a7a]"
            />
          </div>

          {/* Google Calendar Sync Button (Pill shaped as per guidelines) */}
          <button
            onClick={onSyncGCal}
            disabled={isSyncing}
            title={isGCalConnected ? 'Tersambung dengan Google Calendar' : 'Sinkronkan dengan Google Calendar'}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-full text-[13px] font-medium transition-transform active:scale-95 border ${
              isGCalConnected
                ? 'bg-[#ffffff] border-[#0066cc] text-[#0066cc]'
                : 'bg-[#f5f5f7] border-[#e0e0e0] text-[#1d1d1f] hover:border-[#0066cc] hover:text-[#0066cc]'
            }`}
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0066cc]" />
            ) : isGCalConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0066cc]" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-[#7a7a7a]" />
            )}
            <span className="hidden lg:inline">
              {isSyncing
                ? 'Sinkronisasi...'
                : isGCalConnected
                ? 'GCal Aktif'
                : 'Sync Google Calendar'}
            </span>
          </button>

          {/* Primary CTA - Tambah Tugas (Pill shaped) */}
          <button
            onClick={onOpenNewTaskModal}
            className="hidden md:flex items-center space-x-1.5 bg-[#0066cc] hover:bg-[#0071e3] text-white px-4 py-2 rounded-full text-[14px] font-medium transition-transform active:scale-95 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>
        </div>

      </div>
    </header>
  );
};
