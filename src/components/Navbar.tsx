import React from 'react';
import { 
  FileText, 
  CalendarRange, 
  CalendarDays, 
  BarChart3, 
  Store, 
  PlusCircle, 
  Printer,
  History,
  ShieldCheck
} from 'lucide-react';
import { ActiveTab, StoreProfile, UserAccount } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  storeProfile: StoreProfile;
  currentUser: UserAccount;
  onOpenStoreSettings: () => void;
  onOpenAuth: () => void;
  onNewTransaction: () => void;
  totalTransactionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  storeProfile,
  currentUser,
  onOpenStoreSettings,
  onOpenAuth,
  onNewTransaction,
  totalTransactionsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-indigo-900 text-white shadow-md border-b border-indigo-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Store Identity with Indigo badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner shrink-0 border border-indigo-400/40">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight text-base sm:text-lg truncate">
                  {storeProfile.name || 'TEJO'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-200 border border-indigo-700 shrink-0">
                  {storeProfile.tagline || 'Fotocopi & Print'}
                </span>
              </div>
              <p className="text-[11px] text-indigo-300 truncate hidden sm:block">
                Sistem Nota Keluar & Masuk Harian
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Sleek Interface pill buttons) */}
          <nav className="hidden md:flex items-center gap-1 bg-indigo-950/60 p-1.5 rounded-xl border border-indigo-800/60 text-sm">
            <button
              id="tab-input-nota"
              onClick={() => setActiveTab('input-nota')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'input-nota'
                  ? 'bg-indigo-700 text-white shadow-sm font-bold'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-300" />
              <span>Input & Preview</span>
            </button>

            <button
              id="tab-mingguan"
              onClick={() => setActiveTab('mingguan')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'mingguan'
                  ? 'bg-indigo-700 text-white shadow-sm font-bold'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
              }`}
            >
              <CalendarRange className="w-4 h-4 text-amber-300" />
              <span>Lap. Mingguan</span>
            </button>

            <button
              id="tab-bulanan"
              onClick={() => setActiveTab('bulanan')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bulanan'
                  ? 'bg-indigo-700 text-white shadow-sm font-bold'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-sky-300" />
              <span>Lap. Bulanan</span>
            </button>

            <button
              id="tab-rekap-dashboard"
              onClick={() => setActiveTab('rekap-dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'rekap-dashboard'
                  ? 'bg-indigo-700 text-white shadow-sm font-bold'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-300" />
              <span>Dashboard Rekap</span>
            </button>

            <button
              id="tab-riwayat"
              onClick={() => setActiveTab('riwayat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'riwayat'
                  ? 'bg-indigo-700 text-white shadow-sm font-bold'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
              }`}
            >
              <History className="w-4 h-4 text-purple-300" />
              <span>Semua Data ({totalTransactionsCount})</span>
            </button>
          </nav>

          {/* Right Action Tools & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-new-transaction"
              onClick={() => {
                setActiveTab('input-nota');
                onNewTransaction();
              }}
              className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer border border-indigo-400/40"
              title="Buat Nota Baru"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nota Baru</span>
            </button>

            <button
              id="btn-store-settings"
              onClick={onOpenStoreSettings}
              className="p-2 text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-lg border border-indigo-700/60 transition-colors"
              title="Pengaturan Identitas Toko & Cetak"
            >
              <Store className="w-4 h-4" />
            </button>

            {/* User Auth Switcher */}
            <button
              id="btn-user-auth"
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-indigo-700/60 hover:bg-indigo-800 transition-colors text-left"
              title="Ganti Pengguna / Autentikasi"
            >
              <div className={`w-6 h-6 rounded-full ${currentUser.avatarColor} text-white text-xs flex items-center justify-center font-bold shadow-xs`}>
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden lg:block text-xs">
                <div className="font-semibold text-white flex items-center gap-1 leading-tight">
                  {currentUser.fullName.split(' ')[0]}
                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                </div>
                <span className="text-[10px] text-indigo-300">{currentUser.role}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2.5 border-t border-indigo-800/80 no-scrollbar">
          <button
            onClick={() => setActiveTab('input-nota')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'input-nota' ? 'bg-indigo-700 text-white font-bold' : 'bg-indigo-950/60 text-indigo-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Input & Nota
          </button>
          <button
            onClick={() => setActiveTab('mingguan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'mingguan' ? 'bg-indigo-700 text-white font-bold' : 'bg-indigo-950/60 text-indigo-200'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            Mingguan
          </button>
          <button
            onClick={() => setActiveTab('bulanan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'bulanan' ? 'bg-indigo-700 text-white font-bold' : 'bg-indigo-950/60 text-indigo-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Bulanan
          </button>
          <button
            onClick={() => setActiveTab('rekap-dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'rekap-dashboard' ? 'bg-indigo-700 text-white font-bold' : 'bg-indigo-950/60 text-indigo-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'riwayat' ? 'bg-indigo-700 text-white font-bold' : 'bg-indigo-950/60 text-indigo-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Riwayat ({totalTransactionsCount})
          </button>
        </div>
      </div>
    </header>
  );
};
