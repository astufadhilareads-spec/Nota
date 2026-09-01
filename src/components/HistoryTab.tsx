import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Upload, 
  RefreshCw,
  Copy,
  Calendar,
  FileCheck
} from 'lucide-react';
import { Transaction, StoreProfile } from '../types';
import { formatRupiah, formatDateDDMMYYYY, formatDateIndonesian } from '../utils/formatters';
import { saveAllTransactions } from '../utils/storage';

interface HistoryTabProps {
  transactions: Transaction[];
  storeProfile: StoreProfile;
  onEditTransaction: (trx: Transaction) => void;
  onViewTransaction: (trx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDuplicateTransaction: (trx: Transaction) => void;
  onRefreshData: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  transactions,
  storeProfile,
  onEditTransaction,
  onViewTransaction,
  onDeleteTransaction,
  onDuplicateTransaction,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MASUK' | 'KELUAR'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((trx) => {
      if (typeFilter !== 'ALL' && trx.type !== typeFilter) return false;
      if (categoryFilter !== 'ALL' && trx.category !== categoryFilter) return false;
      if (startDate && trx.date < startDate) return false;
      if (endDate && trx.date > endDate) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDoc = trx.docNumber?.toLowerCase().includes(q);
        const matchRecipient = trx.recipientOrCustomer?.toLowerCase().includes(q);
        const matchNotes = trx.notes?.toLowerCase().includes(q);
        const matchItems = trx.items?.some((it) => it.name.toLowerCase().includes(q));
        if (!matchDoc && !matchRecipient && !matchNotes && !matchItems) return false;
      }

      return true;
    }).sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [transactions, typeFilter, categoryFilter, startDate, endDate, searchQuery]);

  // JSON Backup Export
  const handleExportJson = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Data_Nota_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON Backup Import
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          saveAllTransactions(parsed);
          onRefreshData();
          alert(`Berhasil memulihkan ${parsed.length} data transaksi!`);
        } else {
          alert('Format file JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Riwayat Semua Transaksi ({transactions.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Semua data tersimpan otomatis di localStorage browser Anda secara permanen.
            </p>
          </div>

          {/* Backup & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
              title="Cadangkan data ke file JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cari Kata Kunci</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="No. nota, nama, item..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Transaksi</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">Semua Transaksi</option>
              <option value="MASUK">Hanya Uang Masuk</option>
              <option value="KELUAR">Hanya Uang Keluar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3 text-center w-10">No</th>
                <th className="py-3 px-3 w-24">Tanggal</th>
                <th className="py-3 px-3 w-28">No. Dokumen</th>
                <th className="py-3 px-3">Penerima / Pelanggan</th>
                <th className="py-3 px-3">Daftar Item</th>
                <th className="py-3 px-3 text-center w-24">Jenis</th>
                <th className="py-3 px-3 text-right w-28">Total Nominal</th>
                <th className="py-3 px-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    Tidak ada data transaksi yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((trx, idx) => {
                  const isMasuk = trx.type === 'MASUK';
                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {formatDateDDMMYYYY(trx.date)}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-800 whitespace-nowrap">
                        {trx.docNumber}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div>{trx.recipientOrCustomer}</div>
                        <span className="text-[10px] font-normal text-slate-500">{trx.category}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <div className="line-clamp-2">
                          {trx.items.map((it) => `${it.name} (${it.qty} ${it.unit})`).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isMasuk
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isMasuk ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        isMasuk ? 'text-emerald-800' : 'text-rose-800'
                      }`}>
                        {formatRupiah(trx.grandTotal)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onViewTransaction(trx)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Preview Nota"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditTransaction(trx)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                            title="Edit Nota"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateTransaction(trx)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                            title="Duplikasi Nota"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus transaksi ${trx.docNumber} (${trx.recipientOrCustomer})?`)) {
                                onDeleteTransaction(trx.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
};
