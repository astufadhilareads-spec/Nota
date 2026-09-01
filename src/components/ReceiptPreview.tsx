import React from 'react';
import { StoreProfile, Transaction } from '../types';
import { formatRupiah, formatDateIndonesian, terbilang } from '../utils/formatters';
import { Phone, CheckCircle2, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface ReceiptPreviewProps {
  transaction: Transaction;
  storeProfile: StoreProfile;
  watermarkOpacity?: number;
  showTerbilang?: boolean;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  transaction,
  storeProfile,
  watermarkOpacity = 0.08,
  showTerbilang = true,
}) => {
  const isKeluar = transaction.type === 'KELUAR';
  const MIN_ROWS = 7;
  const items = transaction.items || [];
  const emptyRowsCount = Math.max(0, MIN_ROWS - items.length);

  return (
    <div
      id="receipt-print-area"
      className="receipt-paper relative bg-white border-2 border-slate-800 text-slate-900 rounded-sm p-6 sm:p-8 max-w-3xl mx-auto select-text shadow-sm overflow-hidden"
      style={{ minHeight: '520px' }}
    >
      {/* Corner Crop Marks (Authentic Print Nota Look) */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

      {/* Type Badge on Top Edge */}
      <div className="flex justify-between items-center mb-3 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 font-semibold">
          <span>NO. DOKUMEN:</span>
          <span className="text-slate-800 font-bold">{transaction.docNumber || '-'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isKeluar ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
              <ArrowDownRight className="w-3 h-3" />
              NOTA UANG KELUAR (PENGELUARAN)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ArrowUpRight className="w-3 h-3" />
              NOTA PEMBAYARAN / UANG MASUK
            </span>
          )}
        </div>
      </div>

      {/* HEADER SECTION (Matching the reference image) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start pb-4">
        
        {/* Left: Store Logo & Box */}
        <div className="sm:col-span-5 border-2 border-slate-900 rounded-md p-2.5 flex items-center gap-3 bg-white">
          {/* Printer Logo Graphic */}
          <div className="w-16 h-14 shrink-0 relative bg-slate-900 rounded flex flex-col items-center justify-between p-1 text-white">
            {/* Top paper feeder */}
            <div className="w-8 h-1 bg-slate-400 rounded-xs" />
            
            {/* Middle Printer Body */}
            <div className="w-full flex items-center justify-between px-1">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-magenta-400 bg-pink-500 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 inline-block" />
              </div>
              <span className="text-[8px] font-mono font-bold tracking-tighter">PRINT</span>
            </div>

            {/* Bottom printed output with CMYK colors */}
            <div className="w-12 h-2.5 bg-white rounded-xs flex flex-col justify-end p-0.5 shadow-xs overflow-hidden">
              <div className="w-full h-1 flex">
                <span className="w-1/4 h-full bg-cyan-500" />
                <span className="w-1/4 h-full bg-pink-500" />
                <span className="w-1/4 h-full bg-yellow-400" />
                <span className="w-1/4 h-full bg-slate-900" />
              </div>
            </div>
          </div>

          {/* Store Name & Info */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
              {storeProfile.name || 'TEJO'}
            </h1>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700 mt-0.5">
              {storeProfile.tagline || 'FOTOCOPI & PRINT'}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800 mt-1">
              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="font-mono">{storeProfile.phone || '0882-1074-2717'}</span>
            </div>
          </div>
        </div>

        {/* Right: Date & Recipient / Customer (with dotted underline) */}
        <div className="sm:col-span-7 flex flex-col justify-center space-y-2.5 sm:pl-4">
          
          {/* Hari / Tgl */}
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-bold text-slate-800 w-24 shrink-0">
              Hari/Tgl
            </span>
            <span className="text-xs text-slate-500">:</span>
            <div className="flex-1 pb-0.5 border-b border-dotted border-slate-700 min-h-[26px]">
              <span className="font-serif-receipt text-base sm:text-lg font-bold text-slate-900">
                {formatDateIndonesian(transaction.date) || '—'}
              </span>
            </div>
          </div>

          {/* Kepada Yth / Penerima */}
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-bold text-slate-800 w-24 shrink-0">
              {isKeluar ? 'Penerima' : 'Kepada Yth'}
            </span>
            <span className="text-xs text-slate-500">:</span>
            <div className="flex-1 pb-0.5 border-b border-dotted border-slate-700 min-h-[26px]">
              <span className="font-serif-receipt text-base sm:text-lg font-bold text-slate-900">
                {transaction.recipientOrCustomer || '—'}
              </span>
            </div>
          </div>

          {/* Keterangan / Kategori (if present) */}
          {transaction.notes && (
            <div className="flex items-baseline gap-3 text-xs text-slate-600">
              <span className="font-medium w-24 shrink-0">Keterangan</span>
              <span>:</span>
              <span className="italic truncate flex-1">{transaction.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* TABLE SECTION (Matching exact NO, Nama Barang, QTY, Harga Satuan, Total) */}
      <div className="relative mt-2 border-2 border-slate-900 overflow-hidden bg-white">
        
        {/* Background Watermark */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center select-none"
          style={{ opacity: watermarkOpacity }}
        >
          <div className="text-center transform -rotate-12">
            <div className="text-6xl sm:text-7xl font-black tracking-widest text-slate-900">
              {storeProfile.name || 'TEJO'}
            </div>
            <div className="text-sm sm:text-lg font-bold tracking-widest text-slate-800 uppercase">
              {storeProfile.tagline || 'FOTOCOPI & PRINT'}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <table className="w-full border-collapse text-left relative z-10 text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-slate-900 bg-slate-100/60 text-slate-900 font-bold uppercase text-[11px] sm:text-xs tracking-wider">
              <th className="py-2 px-2 text-center border-r-2 border-slate-900 w-10">NO</th>
              <th className="py-2 px-3 border-r-2 border-slate-900">Nama Barang / Deskripsi</th>
              <th className="py-2 px-2 text-center border-r-2 border-slate-900 w-16">QTY</th>
              <th className="py-2 px-3 text-right border-r-2 border-slate-900 w-28 sm:w-32">Harga Satuan</th>
              <th className="py-2 px-3 text-right w-28 sm:w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id || idx}
                className="border-b border-slate-800/80 hover:bg-slate-50/50 transition-colors"
              >
                <td className="py-1.5 px-2 text-center font-bold font-serif-receipt text-sm sm:text-base border-r-2 border-slate-900">
                  {idx + 1}
                </td>
                <td className="py-1.5 px-3 font-serif-receipt text-sm sm:text-base font-semibold text-slate-950 border-r-2 border-slate-900">
                  <div className="flex items-center justify-between">
                    <span>{item.name || '—'}</span>
                    {item.unit && (
                      <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {item.unit}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-1.5 px-2 text-center font-serif-receipt text-sm sm:text-base font-bold border-r-2 border-slate-900">
                  {item.qty || 0}
                </td>
                <td className="py-1.5 px-3 text-right font-serif-receipt text-sm sm:text-base font-semibold border-r-2 border-slate-900 whitespace-nowrap">
                  {formatRupiah(item.unitPrice)}
                </td>
                <td className="py-1.5 px-3 text-right font-serif-receipt text-sm sm:text-base font-bold text-slate-950 whitespace-nowrap">
                  {formatRupiah(item.total)}
                </td>
              </tr>
            ))}

            {/* Empty filler rows for authentic print nota grid */}
            {Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="border-b border-slate-800/60 h-7 sm:h-8">
                <td className="py-1 px-2 text-center font-serif-receipt text-sm text-slate-700 border-r-2 border-slate-900">
                  {items.length + idx + 1}
                </td>
                <td className="py-1 px-3 border-r-2 border-slate-900">&nbsp;</td>
                <td className="py-1 px-2 border-r-2 border-slate-900">&nbsp;</td>
                <td className="py-1 px-3 border-r-2 border-slate-900">&nbsp;</td>
                <td className="py-1 px-3">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TAX & DISCOUNT BREAKDOWN (if applicable) */}
      {(transaction.taxAmount > 0 || transaction.discountAmount > 0) && (
        <div className="flex justify-end mt-1.5 text-xs">
          <div className="w-64 space-y-0.5 text-right font-medium text-slate-700 pr-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono-num font-semibold">{formatRupiah(transaction.subtotal)}</span>
            </div>
            {transaction.discountAmount > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>
                  Diskon {transaction.discountType === 'percentage' ? `(${transaction.discountRate}%)` : ''}:
                </span>
                <span className="font-mono-num">- {formatRupiah(transaction.discountAmount)}</span>
              </div>
            )}
            {transaction.taxAmount > 0 && (
              <div className="flex justify-between text-slate-800">
                <span>
                  Pajak {transaction.taxType === 'percentage' ? `(${transaction.taxRate}%)` : ''}:
                </span>
                <span className="font-mono-num">+ {formatRupiah(transaction.taxAmount)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER SECTION (Address, Services pill, Jumlah Box, Signature) */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
        
        {/* Left: Store Address & Signature */}
        <div className="sm:col-span-5 text-left">
          <div className="text-[11px] leading-tight text-slate-900 font-bold whitespace-pre-line">
            {storeProfile.address ||
              'Samping MTs Ar Rohman Tegalrejo\nSemen, Kec. Nguntoronadi, Kabupaten Magetan, Jawa Timur 63383'}
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-800">{storeProfile.signerTitle || 'Hormat kami,'}</p>
            
            {/* Signature Box / Placeholder */}
            <div className="h-10 flex items-end">
              <span className="font-handwriting text-lg sm:text-xl text-slate-800 font-bold ml-2">
                {transaction.signerName || storeProfile.signerName || 'TTD'}
              </span>
            </div>
            <div className="w-28 border-b border-slate-700 pt-0.5" />
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600 mt-0.5">
              ( {transaction.signerName || storeProfile.signerName || 'PENGELOLA'} )
            </p>
          </div>
        </div>

        {/* Center: Services / Products Offered Rounded Box */}
        <div className="sm:col-span-4 flex items-center justify-center">
          <div className="border-2 border-slate-900 rounded-xl p-2.5 bg-white text-center shadow-xs">
            <p className="text-[10px] sm:text-[10.5px] leading-tight font-bold text-slate-900">
              {storeProfile.footerNote ||
                'Menerima pesanan cetak kartu, print, fotokopi, jilid, kalender, banner, jasa photografi profesional, pamflet, brosur, undangan nikah, ID card, dll.'}
            </p>
          </div>
        </div>

        {/* Right: JUMLAH BOX (Large Prominent Total) */}
        <div className="sm:col-span-3 flex flex-col items-end justify-end">
          <div className="flex items-center gap-2 w-full justify-end">
            <span className="font-bold text-sm sm:text-base text-slate-900 uppercase tracking-tight">
              Jumlah
            </span>
            <div className="border-2 border-slate-900 bg-sky-100/90 px-3 py-1.5 rounded-sm min-w-[130px] sm:min-w-[150px] text-right shadow-xs">
              <span className="font-serif-receipt text-lg sm:text-2xl font-black text-slate-950 tracking-tight whitespace-nowrap">
                {formatRupiah(transaction.grandTotal)}
              </span>
            </div>
          </div>

          <div className="mt-1 text-[10px] text-slate-500 font-mono text-right flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
            <span>Status: {transaction.status || 'Lunas'} • {transaction.paymentMethod || 'Tunai'}</span>
          </div>
        </div>
      </div>

      {/* Terbilang spellout */}
      {showTerbilang && (
        <div className="mt-3 pt-2 border-t border-dotted border-slate-300 text-[11px] text-slate-700 italic">
          <span className="font-semibold not-italic text-slate-900">Terbilang: </span>
          {terbilang(transaction.grandTotal)}
        </div>
      )}
    </div>
  );
};
