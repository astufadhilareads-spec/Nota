/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  FileText, 
  Eye, 
  Printer, 
  Download, 
  Sparkles, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle,
  Clock,
  Layers,
  PlusCircle
} from 'lucide-react';
import { ActiveTab, StoreProfile, Transaction, UserAccount } from './types';
import { 
  getStoredTransactions, 
  saveTransaction, 
  deleteTransaction, 
  getStoreProfile, 
  saveStoreProfile, 
  getCurrentUser, 
  DEFAULT_STORE_PROFILE,
  DEFAULT_USERS
} from './utils/storage';
import { getTodayDateString, generateDocNumber, formatRupiah } from './utils/formatters';

import { Navbar } from './components/Navbar';
import { TransactionForm } from './components/TransactionForm';
import { ReceiptPreview } from './components/ReceiptPreview';
import { WeeklyReport } from './components/WeeklyReport';
import { MonthlyReport } from './components/MonthlyReport';
import { MonthlyDashboard } from './components/MonthlyDashboard';
import { HistoryTab } from './components/HistoryTab';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { AuthModal } from './components/AuthModal';
import { ReceiptPDFModal } from './components/ReceiptPDFModal';

export default function App() {
  // App state
  const [activeTab, setActiveTab] = useState<ActiveTab>('input-nota');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(DEFAULT_STORE_PROFILE);
  const [currentUser, setCurrentUser] = useState<UserAccount>(DEFAULT_USERS[0]);

  // Modals state
  const [isStoreSettingsOpen, setIsStoreSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfSelectedTransaction, setPdfSelectedTransaction] = useState<Transaction | null>(null);

  // Form editing state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Live draft transaction being typed in the form for real-time preview
  const [liveDraft, setLiveDraft] = useState<Transaction>({
    id: 'draft-initial',
    type: 'KELUAR',
    docNumber: 'NK-20260901-001',
    date: getTodayDateString(),
    recipientOrCustomer: 'Toko Kertas Nusantara',
    category: 'Bahan Baku & Kertas',
    paymentMethod: 'Tunai',
    notes: 'Pembelian kertas HVS 70gr',
    items: [
      {
        id: 'item-1',
        name: 'Kertas HVS A4 70gr (PaperOne)',
        qty: 5,
        unit: 'rim',
        unitPrice: 48000,
        total: 240000,
      },
    ],
    subtotal: 240000,
    taxRate: 0,
    taxType: 'percentage',
    taxAmount: 0,
    discountRate: 0,
    discountType: 'nominal',
    discountAmount: 0,
    grandTotal: 240000,
    signerName: 'Kasir / Pengelola',
    status: 'Lunas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load from localStorage on mount
  const refreshStorageData = useCallback(() => {
    const loadedTrx = getStoredTransactions();
    setTransactions(loadedTrx);
    setStoreProfile(getStoreProfile());
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    refreshStorageData();

    // Listen for storage events across tabs or components
    const handleStorageUpdate = () => refreshStorageData();
    window.addEventListener('nota_storage_updated', handleStorageUpdate);
    window.addEventListener('nota_store_profile_updated', handleStorageUpdate);
    window.addEventListener('nota_user_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('nota_storage_updated', handleStorageUpdate);
      window.removeEventListener('nota_store_profile_updated', handleStorageUpdate);
      window.removeEventListener('nota_user_updated', handleStorageUpdate);
    };
  }, [refreshStorageData]);

  // Save Transaction
  const handleSaveTransaction = (trx: Transaction) => {
    const updated = saveTransaction(trx);
    setTransactions(updated);
    
    // Confetti effect
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    showToast(`Nota ${trx.docNumber} (${formatRupiah(trx.grandTotal)}) berhasil disimpan!`);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = deleteTransaction(id);
    setTransactions(updated);
    showToast('Data transaksi berhasil dihapus.');
  };

  // Duplicate Transaction
  const handleDuplicateTransaction = (trx: Transaction) => {
    const newTrx: Transaction = {
      ...trx,
      id: `trx-${Date.now()}`,
      docNumber: generateDocNumber(trx.type, getTodayDateString(), transactions.length + 1),
      date: getTodayDateString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingTransaction(newTrx);
    setActiveTab('input-nota');
    showToast('Transaksi berhasil diduplikasi ke formulir input.');
  };

  // Edit Transaction from table
  const handleEditTransaction = (trx: Transaction) => {
    setEditingTransaction(trx);
    setActiveTab('input-nota');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View / Print single transaction PDF
  const handleViewTransactionModal = (trx: Transaction) => {
    setPdfSelectedTransaction(trx);
    setIsPdfModalOpen(true);
  };

  // Reset to new transaction
  const handleStartNewTransaction = () => {
    setEditingTransaction(null);
    setActiveTab('input-nota');
  };

  // Save Store Profile
  const handleSaveStoreProfile = (profile: StoreProfile) => {
    saveStoreProfile(profile);
    setStoreProfile(profile);
    showToast('Profil usaha & pengaturan cetak berhasil diperbarui.');
  };

  // Compute current month stats for quick metrics banner
  const currentMonthStats = React.useMemo(() => {
    const currentMonthPrefix = getTodayDateString().substring(0, 7); // e.g. "2026-09"
    let masuk = 0;
    let keluar = 0;
    transactions.forEach((t) => {
      if (t.date.startsWith(currentMonthPrefix)) {
        if (t.type === 'MASUK') masuk += t.grandTotal;
        else keluar += t.grandTotal;
      }
    });
    return {
      masuk,
      keluar,
      saldo: masuk - keluar,
      count: transactions.filter((t) => t.date.startsWith(currentMonthPrefix)).length,
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation (Sleek Indigo-900) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        storeProfile={storeProfile}
        currentUser={currentUser}
        onOpenStoreSettings={() => setIsStoreSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onNewTransaction={handleStartNewTransaction}
        totalTransactionsCount={transactions.length}
      />

      {/* Sleek Sub-Header Ribbon */}
      <div className="bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {activeTab === 'input-nota' && 'Input Nota & Preview Real-Time'}
              {activeTab === 'mingguan' && 'Rekapitulasi Kas Mingguan'}
              {activeTab === 'bulanan' && 'Laporan Arus Kas Bulanan'}
              {activeTab === 'rekap-dashboard' && 'Dashboard Rekap & Analisis Arus Kas'}
              {activeTab === 'riwayat' && 'Riwayat & Manajemen Dokumen Nota'}
            </h1>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Penyimpanan Lokal Aktif
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-medium text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Total Transaksi:</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {transactions.length}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-slate-400">Pengguna:</span>
              <span className="font-semibold text-indigo-700">{currentUser.fullName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: INPUT & PREVIEW NOTA REAL-TIME */}
        {activeTab === 'input-nota' && (
          <div className="space-y-6">
            
            {/* Split Screen Layout (Desktop: Form on Left, Live Preview on Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Form Input */}
              <div className="xl:col-span-6 space-y-6">
                <TransactionForm
                  key={editingTransaction ? editingTransaction.id : 'new-form'}
                  initialTransaction={editingTransaction}
                  storeProfile={storeProfile}
                  currentUser={currentUser}
                  existingTransactionsCount={transactions.length}
                  onChange={(draft) => setLiveDraft(draft)}
                  onSave={(trx) => {
                    handleSaveTransaction(trx);
                    setEditingTransaction(null);
                  }}
                  onCancelEdit={handleStartNewTransaction}
                  onDownloadPdf={() => {
                    setPdfSelectedTransaction(liveDraft);
                    setIsPdfModalOpen(true);
                  }}
                />
              </div>

              {/* Right Column: Live Real-time Receipt Preview */}
              <div className="xl:col-span-6 space-y-4 xl:sticky xl:top-20">
                
                {/* Sleek Quick Metrics Bar (Current Month) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                      Bulan Ini (Masuk)
                    </span>
                    <span className="text-sm sm:text-base font-bold font-mono text-emerald-600 truncate block mt-0.5">
                      {formatRupiah(currentMonthStats.masuk)}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                      Bulan Ini (Keluar)
                    </span>
                    <span className="text-sm sm:text-base font-bold font-mono text-rose-600 truncate block mt-0.5">
                      {formatRupiah(currentMonthStats.keluar)}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                      Sisa Saldo Kas
                    </span>
                    <span className={`text-sm sm:text-base font-bold font-mono truncate block mt-0.5 ${
                      currentMonthStats.saldo >= 0 ? 'text-indigo-600' : 'text-rose-600'
                    }`}>
                      {formatRupiah(currentMonthStats.saldo)}
                    </span>
                  </div>
                </div>

                {/* Preview Header & Actions */}
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Preview Nota Real-Time
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPdfSelectedTransaction(liveDraft);
                        setIsPdfModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Cetak / Unduh PDF</span>
                    </button>
                  </div>
                </div>

                {/* The Paper Receipt Preview (Matching prompt image) */}
                <div className="overflow-x-auto pb-4 bg-slate-200/50 p-3 sm:p-4 rounded-2xl border border-slate-300/80 shadow-inner">
                  <ReceiptPreview
                    transaction={liveDraft}
                    storeProfile={storeProfile}
                    watermarkOpacity={0.08}
                    showTerbilang={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LAPORAN MINGGUAN */}
        {activeTab === 'mingguan' && (
          <WeeklyReport
            transactions={transactions}
            storeProfile={storeProfile}
            onSelectTransaction={(trx) => {
              setPdfSelectedTransaction(trx);
              setIsPdfModalOpen(true);
            }}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {/* TAB 3: LAPORAN BULANAN */}
        {activeTab === 'bulanan' && (
          <MonthlyReport
            transactions={transactions}
            storeProfile={storeProfile}
            onSelectTransaction={(trx) => {
              setPdfSelectedTransaction(trx);
              setIsPdfModalOpen(true);
            }}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {/* TAB 4: REKAPAN & DASHBOARD */}
        {activeTab === 'rekap-dashboard' && (
          <MonthlyDashboard
            transactions={transactions}
            storeProfile={storeProfile}
          />
        )}

        {/* TAB 5: RIWAYAT SEMUA DATA & RESTORE */}
        {activeTab === 'riwayat' && (
          <HistoryTab
            transactions={transactions}
            storeProfile={storeProfile}
            onEditTransaction={handleEditTransaction}
            onViewTransaction={handleViewTransactionModal}
            onDeleteTransaction={handleDeleteTransaction}
            onDuplicateTransaction={handleDuplicateTransaction}
            onRefreshData={refreshStorageData}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} <strong>{storeProfile.name}</strong> • Sistem Nota Keluar & Masuk Harian (Local Storage Ready)
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Template Nota Fisik Otentik</span>
            <span>•</span>
            <span>Ekspor PDF Siap Cetak</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <StoreSettingsModal
        isOpen={isStoreSettingsOpen}
        onClose={() => setIsStoreSettingsOpen(false)}
        storeProfile={storeProfile}
        onSave={handleSaveStoreProfile}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChanged={(u) => {
          setCurrentUser(u);
          showToast(`Berhasil login sebagai ${u.fullName}`);
        }}
      />

      {pdfSelectedTransaction && (
        <ReceiptPDFModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          transaction={pdfSelectedTransaction}
          storeProfile={storeProfile}
        />
      )}
    </div>
  );
}
