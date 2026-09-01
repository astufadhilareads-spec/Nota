import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Scale, 
  Search, 
  PieChart, 
  Printer, 
  Eye,
  FileSpreadsheet,
  Edit3,
  Trash2
} from 'lucide-react';
import { Transaction, StoreProfile } from '../types';
import { formatRupiah, formatDateIndonesian, formatDateDDMMYYYY, getMonthNameIndo, getTodayDateString } from '../utils/formatters';
import { exportElementToPdf } from '../utils/pdfExport';

interface MonthlyReportProps {
  transactions: Transaction[];
  storeProfile: StoreProfile;
  onSelectTransaction: (trx: Transaction) => void;
  onEditTransaction?: (trx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

interface CategorySummary {
  type: string;
  total: number;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  transactions,
  storeProfile,
  onSelectTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MASUK' | 'KELUAR'>('ALL');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filter transactions for chosen month and year
  const monthlyTransactions = useMemo(() => {
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    return transactions.filter((trx) => {
      if (!trx.date.startsWith(monthPrefix)) return false;
      if (typeFilter !== 'ALL' && trx.type !== typeFilter) return false;
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
  }, [transactions, selectedYear, selectedMonth, typeFilter, searchQuery]);

  // Aggregate monthly stats
  const stats = useMemo(() => {
    let totalMasuk = 0;
    let totalKeluar = 0;
    let countMasuk = 0;
    let countKeluar = 0;
    const categoryTotals: Record<string, CategorySummary> = {};

    monthlyTransactions.forEach((trx) => {
      if (trx.type === 'MASUK') {
        totalMasuk += trx.grandTotal;
        countMasuk += 1;
      } else {
        totalKeluar += trx.grandTotal;
        countKeluar += 1;
      }

      const cat = trx.category || 'Lain-lain';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { type: trx.type, total: 0 };
      }
      categoryTotals[cat].total += trx.grandTotal;
    });

    const selisih = totalMasuk - totalKeluar;
    return { totalMasuk, totalKeluar, selisih, countMasuk, countKeluar, categoryTotals };
  }, [monthlyTransactions]);


  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const monthName = getMonthNameIndo(selectedMonth - 1, true);
    const filename = `Laporan_Bulanan_${monthName}_${selectedYear}`;
    await exportElementToPdf('monthly-report-printable', filename, 'p', 'a4');
    setIsExporting(false);
  };

  const yearsList = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Laporan Bulanan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekapitulasi total uang masuk, uang keluar, dan saldo kas per periode bulan.
            </p>
          </div>

          <button
            type="button"
            id="btn-download-pdf-monthly"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>{isExporting ? 'Memproses PDF...' : 'Unduh PDF Bulanan'}</span>
          </button>
        </div>

        {/* Month & Year Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMonthNameIndo(i, true)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Filter Jenis</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="MASUK">Hanya Uang Masuk</option>
              <option value="KELUAR">Hanya Uang Keluar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pencarian</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nota/nama..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Masuk */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Total Masuk ({getMonthNameIndo(selectedMonth - 1, false)})
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-emerald-950">
              {formatRupiah(stats.totalMasuk)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.countMasuk} Transaksi Nota Pembayaran
            </p>
          </div>
        </div>

        {/* Total Keluar */}
        <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Total Keluar ({getMonthNameIndo(selectedMonth - 1, false)})
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-rose-950">
              {formatRupiah(stats.totalKeluar)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.countKeluar} Transaksi Nota Pengeluaran
            </p>
          </div>
        </div>

        {/* Selisih Bersih */}
        <div className={`rounded-2xl border p-5 shadow-2xs ${
          stats.selisih >= 0
            ? 'bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border-blue-200 text-blue-950'
            : 'bg-gradient-to-br from-rose-50/60 to-amber-50/60 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              Selisih Kas Bersih
            </span>
            <div className="w-8 h-8 rounded-lg bg-white text-blue-700 flex items-center justify-center shadow-2xs">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black font-mono ${
              stats.selisih >= 0 ? 'text-blue-900' : 'text-rose-700'
            }`}>
              {formatRupiah(stats.selisih)}
            </span>
            <p className="text-[11px] opacity-80 mt-1">
              {stats.selisih >= 0 ? 'Surplus Operasional Bersih' : 'Defisit Pengeluaran'}
            </p>
          </div>
        </div>
      </div>

      {/* PRINTABLE MONTHLY REPORT CONTAINER */}
      <div
        id="monthly-report-printable"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6"
      >
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {storeProfile.name || 'TEJO'}
              </h1>
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700">
                {storeProfile.tagline || 'FOTOCOPI & PRINT'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-lg">
              {storeProfile.address}
            </p>
            <p className="text-xs font-mono font-semibold text-slate-700">
              Telp/WA: {storeProfile.phone}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-lg font-extrabold uppercase text-slate-900 tracking-tight">
              LAPORAN KEUANGAN BULANAN
            </h2>
            <p className="text-sm font-bold text-slate-800">
              Bulan: {getMonthNameIndo(selectedMonth - 1, true)} {selectedYear}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Dicetak: {formatDateIndonesian(getTodayDateString())}
            </p>
          </div>
        </div>

        {/* Monthly Recap Box */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Pemasukan</span>
            <span className="font-mono font-black text-emerald-700 text-sm sm:text-lg">
              {formatRupiah(stats.totalMasuk)}
            </span>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Pengeluaran</span>
            <span className="font-mono font-black text-rose-700 text-sm sm:text-lg">
              {formatRupiah(stats.totalKeluar)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Saldo / Selisih</span>
            <span className={`font-mono font-black text-sm sm:text-lg ${
              stats.selisih >= 0 ? 'text-blue-700' : 'text-rose-700'
            }`}>
              {formatRupiah(stats.selisih)}
            </span>
          </div>
        </div>

        {/* Category Breakdown list */}
        {Object.keys(stats.categoryTotals).length > 0 && (
          <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-2 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-indigo-600" />
              Rincian Kas per Kategori:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {(Object.entries(stats.categoryTotals) as [string, CategorySummary][]).map(([cat, data]) => (
                <div key={cat} className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 block truncate">{cat}</span>
                  <span className={`font-mono font-bold text-xs ${
                    data.type === 'MASUK' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {data.type === 'MASUK' ? '+ ' : '- '}
                    {formatRupiah(data.total)}
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3 text-center w-10">No</th>
                <th className="py-2.5 px-3 w-24">Tanggal</th>
                <th className="py-2.5 px-3 w-28">No. Nota</th>
                <th className="py-2.5 px-3">Penerima / Pelanggan</th>
                <th className="py-2.5 px-3">Barang / Keterangan</th>
                <th className="py-2.5 px-3 text-center w-20">Metode</th>
                <th className="py-2.5 px-3 text-right w-28">Uang Masuk</th>
                <th className="py-2.5 px-3 text-right w-28">Uang Keluar</th>
                <th className="py-2.5 px-3 text-center w-28 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {monthlyTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    Belum ada transaksi untuk bulan {getMonthNameIndo(selectedMonth - 1, true)} {selectedYear}.
                  </td>
                </tr>
              ) : (
                monthlyTransactions.map((trx, idx) => {
                  const isMasuk = trx.type === 'MASUK';
                  return (
                    <tr
                      key={trx.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => onSelectTransaction(trx)}
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {formatDateDDMMYYYY(trx.date)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-800 whitespace-nowrap">
                        {trx.docNumber}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <div>{trx.recipientOrCustomer}</div>
                        <span className="text-[10px] font-normal text-slate-500">{trx.category}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <div className="line-clamp-1">
                          {trx.items.map((it) => it.name).join(', ')}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-[10px] font-semibold text-slate-600">
                        {trx.paymentMethod}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">
                        {isMasuk ? formatRupiah(trx.grandTotal) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-800 whitespace-nowrap">
                        {!isMasuk ? formatRupiah(trx.grandTotal) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onSelectTransaction(trx)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Lihat / Cetak Nota"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {onEditTransaction && (
                            <button
                              type="button"
                              onClick={() => onEditTransaction(trx)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              title="Edit / Perbarui Transaksi"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteTransaction && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus transaksi ${trx.docNumber || trx.recipientOrCustomer} (${formatRupiah(trx.grandTotal)})?`)) {
                                  onDeleteTransaction(trx.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs">
                <td colSpan={6} className="py-3 px-3 text-right text-slate-900 uppercase">
                  TOTAL BULAN {getMonthNameIndo(selectedMonth - 1, false)} {selectedYear}:
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                  {formatRupiah(stats.totalMasuk)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-rose-800 text-sm">
                  {formatRupiah(stats.totalKeluar)}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer & Signatures */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-500">Keterangan:</p>
            <p className="text-slate-700 italic mt-0.5">
              Dokumen ini merupakan laporan resmi keuangan bulanan yang sah.
            </p>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-slate-700 font-semibold">{storeProfile.signerTitle || 'Hormat kami,'}</p>
            <div className="h-12 flex items-end">
              <span className="font-handwriting text-lg text-slate-800 font-bold">
                {storeProfile.signerName || 'Pengelola'}
              </span>
            </div>
            <div className="w-32 border-b border-slate-700" />
            <p className="text-[10px] uppercase font-bold text-slate-600 mt-0.5">
              ( {storeProfile.signerName || 'PENGELOLA'} )
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
