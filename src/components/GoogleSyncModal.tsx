import React from 'react';
import { X, Calendar, CheckCircle2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface GoogleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGCalConnected: boolean;
  isSyncing: boolean;
  user: UserProfile | null;
  onLoginWithGoogle: () => void;
  onManualSync: () => void;
  onLogout: () => void;
}

export const GoogleSyncModal: React.FC<GoogleSyncModalProps> = ({
  isOpen,
  onClose,
  isGCalConnected,
  isSyncing,
  user,
  onLoginWithGoogle,
  onManualSync,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs animate-fade-in p-4">
      <div className="bg-[#ffffff] border border-[#e0e0e0] rounded-[24px] max-w-md w-full p-6 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#4285f4]/10 flex items-center justify-center text-[#4285f4]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-[#1d1d1f] tracking-tight">
                Integrasi Google Calendar
              </h3>
              <p className="text-[12px] text-[#7a7a7a]">
                Sinkronisasi Dua Arah (Two-Way Sync)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e0e0e0] flex items-center justify-center text-[#1d1d1f]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Status */}
        {isGCalConnected ? (
          <div className="space-y-4">
            <div className="bg-[#34c759]/10 border border-[#34c759]/30 rounded-[16px] p-4 flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-[#34c759] shrink-0" />
              <div>
                <div className="text-[14px] font-semibold text-[#1d1d1f]">
                  Google Calendar Terhubung!
                </div>
                <div className="text-[12px] text-[#7a7a7a]">
                  {user?.email ? `Akun: ${user.email}` : 'Otorisasi Google OAuth berhasil.'}
                </div>
              </div>
            </div>

            <ul className="text-[13px] text-[#1d1d1f] space-y-2 list-disc pl-5">
              <li>Acara Google Calendar Anda akan otomatis muncul di Kalender & List Tugas.</li>
              <li>Tugas baru dengan deadline dapat disinkronkan ke Google Calendar Anda.</li>
            </ul>

            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="w-full py-3 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-[14px] font-semibold transition-transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>

              <button
                onClick={onLogout}
                className="w-full py-2.5 rounded-full bg-[#f5f5f7] hover:bg-[#e0e0e0] text-[#ff3b30] text-[13px] font-medium transition-colors flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Putuskan Sambungan Akun</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#f5f5f7] border border-[#e0e0e0] rounded-[16px] p-4 text-[13px] text-[#1d1d1f] space-y-2">
              <p className="font-semibold text-[#1d1d1f]">
                Fitur Sinkronisasi Google Calendar:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[#7a7a7a]">
                <li>Sinkronkan jadwal kuliah, kuis, dan rapat ke Kalender aplikasi.</li>
                <li>Setiap tugas baru dapat dibuatkan pengingat di Google Calendar.</li>
              </ul>
            </div>

            <button
              onClick={onLoginWithGoogle}
              disabled={isSyncing}
              className="w-full py-3 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-[14px] font-semibold transition-transform active:scale-95 flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
              </svg>
              <span>{isSyncing ? 'Proses Otorisasi...' : 'Sync with Google Calendar'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
