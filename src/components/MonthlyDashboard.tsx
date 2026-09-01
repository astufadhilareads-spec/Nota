import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Scale, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Award,
  Layers
} from 'lucide-react';
import { Transaction, StoreProfile } from '../types';
import { formatRupiah, getMonthNameIndo, formatDateIndonesian, getTodayDateString } from '../utils/formatters';
import { exportElementToPdf } from '../utils/pdfExport';

interface MonthlyDashboardProps {
  transactions: Transaction[];
  storeProfile: StoreProfile;
  onNavigateToMonth?: (year: number, month: number) => void;
}

export const MonthlyDashboard: React.FC<MonthlyDashboardProps> = ({
  transactions,
  storeProfile,
  onNavigateToMonth,
}) => {
  const [selectedRangeMonths, setSelectedRangeMonths] = useState<number>(6); // 6 or 12 months
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Generate monthly series for last N months (e.g. 6 or 12)
  const monthlyData = useMemo(() => {
    const today = new Date();
    const monthsList: {
      key: string;
      year: number;
      month: number;
      label: string;
      totalMasuk: number;
      totalKeluar: number;
      selisih: number;
      trxCount: number;
    }[] = [];

    for (let i = selectedRangeMonths - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const label = `${getMonthNameIndo(month - 1, false)} ${year}`;

      monthsList.push({
        key,
        year,
        month,
        label,
        totalMasuk: 0,
        totalKeluar: 0,
        selisih: 0,
        trxCount: 0,
      });
    }

    // Aggregate transactions into the monthly slots
    transactions.forEach((trx) => {
      if (!trx.date) return;
      const key = trx.date.substring(0, 7); // YYYY-MM
      const slot = monthsList.find((m) => m.key === key);
      if (slot) {
        slot.trxCount += 1;
        if (trx.type === 'MASUK') {
          slot.totalMasuk += trx.grandTotal;
        } else {
          slot.totalKeluar += trx.grandTotal;
        }
      }
    });

    monthsList.forEach((m) => {
      m.selisih = m.totalMasuk - m.totalKeluar;
    });

    return monthsList;
  }, [transactions, selectedRangeMonths]);

  // Overall totals across the selected range
  const overallTotals = useMemo(() => {
    let totalMasuk = 0;
    let totalKeluar = 0;
    let maxMonthMasuk = { label: '-', value: 0 };

    monthlyData.forEach((m) => {
      totalMasuk += m.totalMasuk;
      totalKeluar += m.totalKeluar;
      if (m.totalMasuk > maxMonthMasuk.value) {
        maxMonthMasuk = { label: m.label, value: m.totalMasuk };
      }
    });

    const netProfit = totalMasuk - totalKeluar;
    const avgMonthlyIncome = monthlyData.length > 0 ? totalMasuk / monthlyData.length : 0;
    const expenseRatio = totalMasuk > 0 ? (totalKeluar / totalMasuk) * 100 : 0;

    return {
      totalMasuk,
      totalKeluar,
      netProfit,
      avgMonthlyIncome,
      expenseRatio,
      maxMonthMasuk,
    };
  }, [monthlyData]);

  // Maximum value for chart bar scaling
  const maxBarValue = useMemo(() => {
    let max = 100000;
    monthlyData.forEach((m) => {
      if (m.totalMasuk > max) max = m.totalMasuk;
      if (m.totalKeluar > max) max = m.totalKeluar;
    });
    return max * 1.15; // 15% headroom
  }, [monthlyData]);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const filename = `Rekapan_Dashboard_Bulanan_${selectedRangeMonths}_Bulan`;
    await exportElementToPdf('dashboard-rekap-printable', filename, 'p', 'a4');
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Range Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Dashboard Rekapan Bulanan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis tren pendapatan vs pengeluaran dan rekapitulasi arus kas multi-bulan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedRangeMonths(6)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedRangeMonths === 6
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 Bulan Terakhir
            </button>
            <button
              onClick={() => setSelectedRangeMonths(12)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedRangeMonths === 12
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12 Bulan Terakhir
            </button>
          </div>

          <button
            type="button"
            id="btn-download-pdf-rekap"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isExporting ? 'Membuat PDF...' : 'Unduh PDF Rekap'}</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Akumulasi Masuk */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Total Uang Masuk
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-950">
              {formatRupiah(overallTotals.totalMasuk)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Rata-rata: <span className="font-semibold text-slate-800">{formatRupiah(overallTotals.avgMonthlyIncome)}</span>/bln
            </p>
          </div>
        </div>

        {/* Total Akumulasi Keluar */}
        <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Total Uang Keluar
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-950">
              {formatRupiah(overallTotals.totalKeluar)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Rasio Pengeluaran: <span className="font-semibold text-slate-800">{overallTotals.expenseRatio.toFixed(1)}%</span>
            </p>
          </div>
        </div>

        {/* Total Saldo Bersih */}
        <div className={`rounded-2xl border p-4 shadow-2xs ${
          overallTotals.netProfit >= 0
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : 'bg-rose-50/70 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              Saldo Kas Bersih
            </span>
            <div className="w-7 h-7 rounded-lg bg-white text-emerald-700 flex items-center justify-center shadow-2xs">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className={`text-xl sm:text-2xl font-black font-mono ${
              overallTotals.netProfit >= 0 ? 'text-emerald-900' : 'text-rose-700'
            }`}>
              {formatRupiah(overallTotals.netProfit)}
            </span>
            <p className="text-[11px] opacity-80 mt-1">
              {overallTotals.netProfit >= 0 ? 'Cashflow Surplus' : 'Defisit Arus Kas'}
            </p>
          </div>
        </div>

        {/* Performa Terbaik */}
        <div className="bg-white rounded-2xl border border-indigo-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
              Omzet Tertinggi
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-indigo-950 truncate block">
              {formatRupiah(overallTotals.maxMonthMasuk.value)}
            </span>
            <p className="text-[11px] text-slate-600 mt-1 font-semibold">
              Bulan: {overallTotals.maxMonthMasuk.label}
            </p>
          </div>
        </div>
      </div>

      {/* PRINTABLE CONTAINER (Used for on-screen & PDF Export) */}
      <div
        id="dashboard-rekap-printable"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6"
      >
        {/* Printable Header */}
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
            <p className="text-xs text-slate-600 mt-1 max-w-lg">{storeProfile.address}</p>
            <p className="text-xs font-mono font-semibold text-slate-700">Telp/WA: {storeProfile.phone}</p>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-lg font-extrabold uppercase text-slate-900 tracking-tight">
              REKAPAN ARUS KAS BULANAN
            </h2>
            <p className="text-xs font-semibold text-slate-700">
              Periode: {monthlyData[0]?.label} s/d {monthlyData[monthlyData.length - 1]?.label} ({selectedRangeMonths} Bulan)
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Dicetak: {formatDateIndonesian(getTodayDateString())}
            </p>
          </div>
        </div>

        {/* VISUAL CHART BARS (UANG MASUK VS UANG KELUAR) */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Diagram Perbandingan: Uang Masuk vs Uang Keluar
            </h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span className="text-slate-700">Uang Masuk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
                <span className="text-slate-700">Uang Keluar</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-4 pb-2 grid grid-flow-col auto-cols-fr gap-2 sm:gap-4 items-end min-h-[220px]">
            {monthlyData.map((m) => {
              const masukHeight = Math.max(8, (m.totalMasuk / maxBarValue) * 160);
              const keluarHeight = Math.max(8, (m.totalKeluar / maxBarValue) * 160);

              return (
                <div key={m.key} className="flex flex-col items-center gap-2 text-center group">
                  
                  {/* Pair of Columns */}
                  <div className="flex items-end gap-1 sm:gap-1.5 h-[170px] justify-center w-full">
                    {/* Masuk Bar */}
                    <div
                      className="w-1/2 max-w-[28px] bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all relative flex justify-center group-hover:shadow-md cursor-pointer"
                      style={{ height: `${masukHeight}px` }}
                      title={`Uang Masuk (${m.label}): ${formatRupiah(m.totalMasuk)}`}
                    >
                      {m.totalMasuk > 0 && (
                        <span className="hidden group-hover:block absolute -top-7 text-[10px] font-mono bg-slate-900 text-white px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                          {formatRupiah(m.totalMasuk)}
                        </span>
                      )}
                    </div>

                    {/* Keluar Bar */}
                    <div
                      className="w-1/2 max-w-[28px] bg-rose-500 hover:bg-rose-600 rounded-t-md transition-all relative flex justify-center group-hover:shadow-md cursor-pointer"
                      style={{ height: `${keluarHeight}px` }}
                      title={`Uang Keluar (${m.label}): ${formatRupiah(m.totalKeluar)}`}
                    >
                      {m.totalKeluar > 0 && (
                        <span className="hidden group-hover:block absolute -top-7 text-[10px] font-mono bg-slate-900 text-white px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                          {formatRupiah(m.totalKeluar)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Month Label */}
                  <div className="w-full">
                    <span className="block text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                      {m.label.split(' ')[0]}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-mono">
                      {m.label.split(' ')[1]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MONTHLY RECAP SUMMARY TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3 text-center w-10">No</th>
                <th className="py-3 px-3">Bulan & Tahun</th>
                <th className="py-3 px-3 text-center w-24">Jumlah Trx</th>
                <th className="py-3 px-3 text-right">Total Uang Masuk</th>
                <th className="py-3 px-3 text-right">Total Uang Keluar</th>
                <th className="py-3 px-3 text-right">Selisih (Saldo Kas)</th>
                <th className="py-3 px-3 text-center w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {monthlyData.map((m, idx) => {
                const isSurplus = m.selisih >= 0;
                return (
                  <tr key={m.key} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <span>{m.label}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                      {m.trxCount} Nota
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                      {formatRupiah(m.totalMasuk)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-800">
                      {formatRupiah(m.totalKeluar)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      <span className={isSurplus ? 'text-indigo-700' : 'text-rose-700'}>
                        {formatRupiah(m.selisih)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.totalMasuk === 0 && m.totalKeluar === 0
                            ? 'bg-slate-100 text-slate-600'
                            : isSurplus
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {m.totalMasuk === 0 && m.totalKeluar === 0
                          ? 'Nihil'
                          : isSurplus
                          ? 'Surplus'
                          : 'Defisit'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs">
                <td colSpan={3} className="py-3 px-3 text-right text-slate-900 uppercase">
                  TOTAL REKAPITULASI:
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                  {formatRupiah(overallTotals.totalMasuk)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-rose-800 text-sm">
                  {formatRupiah(overallTotals.totalKeluar)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-indigo-900 text-sm">
                  {formatRupiah(overallTotals.netProfit)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer & Signatures */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-500">Keterangan:</p>
            <p className="text-slate-700 italic mt-0.5">
              Rekapitulasi ini dihasilkan secara otomatis berdasarkan data transaksi yang tercatat di sistem.
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
