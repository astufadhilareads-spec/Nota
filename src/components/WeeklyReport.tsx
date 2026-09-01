import React, { useState, useMemo } from 'react';
import { 
  CalendarRange, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Scale, 
  Search, 
  Filter, 
  FileText, 
  Printer,
  ChevronRight,
  Eye,
  CheckCircle,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Transaction, StoreProfile } from '../types';
import { formatRupiah, formatDateIndonesian, formatDateDDMMYYYY, getTodayDateString } from '../utils/formatters';
import { exportElementToPdf } from '../utils/pdfExport';

interface WeeklyReportProps {
  transactions: Transaction[];
  storeProfile: StoreProfile;
  onSelectTransaction: (trx: Transaction) => void;
  onEditTransaction?: (trx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({
  transactions,
  storeProfile,
  onSelectTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  // Mode: "this_week" or "custom"
  const [rangeMode, setRangeMode] = useState<'this_week' | 'custom'>('this_week');

  // Compute this week's start (Monday) and end (Sunday) based on current date
  const defaultWeekRange = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return {
      start: formatDate(monday),
      end: formatDate(sunday),
    };
  }, []);

  const [startDate, setStartDate] = useState<string>(defaultWeekRange.start);
  const [endDate, setEndDate] = useState<string>(defaultWeekRange.end);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MASUK' | 'KELUAR'>('ALL');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Set preset for this week
  const handleSelectThisWeek = () => {
    setRangeMode('this_week');
    setStartDate(defaultWeekRange.start);
    setEndDate(defaultWeekRange.end);
  };

  // Filter transactions within range
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      // Date range filter
      if (startDate && trx.date < startDate) return false;
      if (endDate && trx.date > endDate) return false;

      // Type filter
      if (typeFilter !== 'ALL' && trx.type !== typeFilter) return false;

      // Search query filter (docNumber, recipient, notes, or item names)
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
  }, [transactions, startDate, endDate, typeFilter, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalMasuk = 0;
    let totalKeluar = 0;
    let countMasuk = 0;
    let countKeluar = 0;

    filteredTransactions.forEach((trx) => {
      if (trx.type === 'MASUK') {
        totalMasuk += trx.grandTotal;
        countMasuk += 1;
      } else {
        totalKeluar += trx.grandTotal;
        countKeluar += 1;
      }
    });

    const selisih = totalMasuk - totalKeluar;
    return { totalMasuk, totalKeluar, selisih, countMasuk, countKeluar };
  }, [filteredTransactions]);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const filename = `Laporan_Mingguan_${startDate}_sd_${endDate}`;
    await exportElementToPdf('weekly-report-printable', filename, 'p', 'a4');
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Control Panel: Date Selector & Presets */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-amber-600" />
              Laporan Mingguan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekapitulasi arus kas masuk, keluar, dan saldo selisih per rentang mingguan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-range-this-week"
              onClick={handleSelectThisWeek}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                rangeMode === 'this_week'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Minggu Ini
            </button>
            <button
              type="button"
              id="btn-range-custom"
              onClick={() => setRangeMode('custom')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                rangeMode === 'custom'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Kustom Tanggal
            </button>
            <button
              type="button"
              id="btn-download-pdf-weekly"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{isExporting ? 'Membuat PDF...' : 'Unduh PDF Mingguan'}</span>
            </button>
          </div>
        </div>

        {/* Date Inputs & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setRangeMode('custom');
              }}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setRangeMode('custom');
              }}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Filter Kategori / Tipe</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="MASUK">Hanya Uang Masuk (Income)</option>
              <option value="KELUAR">Hanya Uang Keluar (Expense)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cari Dokumen / Nama</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nota, nama, barang..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Uang Masuk */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Total Uang Masuk
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
              Dari <span className="font-semibold text-slate-800">{stats.countMasuk}</span> transaksi masuk
            </p>
          </div>
        </div>

        {/* Total Uang Keluar */}
        <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Total Uang Keluar
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
              Dari <span className="font-semibold text-slate-800">{stats.countKeluar}</span> transaksi pengeluaran
            </p>
          </div>
        </div>

        {/* Selisih (Saldo Bersih) */}
        <div className={`rounded-2xl border p-5 shadow-2xs relative overflow-hidden ${
          stats.selisih >= 0 
            ? 'bg-gradient-to-br from-indigo-50/50 to-sky-50/50 border-indigo-200 text-indigo-950'
            : 'bg-gradient-to-br from-rose-50/50 to-amber-50/50 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              Selisih (Masuk − Keluar)
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/80 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black font-mono ${
              stats.selisih >= 0 ? 'text-indigo-900' : 'text-rose-700'
            }`}>
              {formatRupiah(stats.selisih)}
            </span>
            <p className="text-[11px] opacity-80 mt-1">
              {stats.selisih >= 0 ? 'Surplus / Saldo Positif' : 'Defisit / Pengeluaran lebih besar'}
            </p>
          </div>
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER (Used for on-screen & PDF Generation) */}
      <div
        id="weekly-report-printable"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6"
      >
        {/* Report Header */}
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
              LAPORAN KAS MINGGUAN
            </h2>
            <p className="text-xs font-semibold text-slate-700">
              Periode: {formatDateIndonesian(startDate)} s/d {formatDateIndonesian(endDate)}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Dicetak: {formatDateIndonesian(getTodayDateString())}
            </p>
          </div>
        </div>

        {/* Mini Summary Strip for Print Document */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl text-center text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Masuk</span>
            <span className="font-mono font-black text-emerald-700 text-sm sm:text-base">
              {formatRupiah(stats.totalMasuk)}
            </span>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Keluar</span>
            <span className="font-mono font-black text-rose-700 text-sm sm:text-base">
              {formatRupiah(stats.totalKeluar)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Selisih Bersih</span>
            <span className={`font-mono font-black text-sm sm:text-base ${
              stats.selisih >= 0 ? 'text-indigo-700' : 'text-rose-700'
            }`}>
              {formatRupiah(stats.selisih)}
            </span>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3 text-center w-10">No</th>
                <th className="py-2.5 px-3 w-24">Tanggal</th>
                <th className="py-2.5 px-3 w-28">No. Dokumen</th>
                <th className="py-2.5 px-3">Penerima / Pelanggan</th>
                <th className="py-2.5 px-3">Rincian Barang / Jasa</th>
                <th className="py-2.5 px-3 text-center w-24">Jenis</th>
                <th className="py-2.5 px-3 text-right w-28">Uang Masuk</th>
                <th className="py-2.5 px-3 text-right w-28">Uang Keluar</th>
                <th className="py-2.5 px-3 text-center w-28 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    Belum ada transaksi pada rentang tanggal {startDate} s/d {endDate}.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx, idx) => {
                  const isMasuk = trx.type === 'MASUK';
                  return (
                    <tr
                      key={trx.id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
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
                        <div className="line-clamp-2">
                          {trx.items.map((it) => `${it.name} (${it.qty} ${it.unit})`).join(', ')}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isMasuk
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isMasuk ? 'Masuk' : 'Keluar'}
                        </span>
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
                  TOTAL PERIODE:
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

        {/* Report Footer & Signatures */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-500">Catatan:</p>
            <p className="text-slate-700 italic mt-0.5">
              Laporan ini dibuat otomatis dari sistem Nota Keluar & Masuk Harian.
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
