import React, { useState } from 'react';
import { Download, Printer, X, FileText, Check } from 'lucide-react';
import { Transaction, StoreProfile } from '../types';
import { ReceiptPreview } from './ReceiptPreview';
import { exportElementToPdf } from '../utils/pdfExport';

interface ReceiptPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  storeProfile: StoreProfile;
}

export const ReceiptPDFModal: React.FC<ReceiptPDFModalProps> = ({
  isOpen,
  onClose,
  transaction,
  storeProfile,
}) => {
  const [paperFormat, setPaperFormat] = useState<'a4' | 'a5'>('a4');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const prefix = transaction.type === 'KELUAR' ? 'Nota_Keluar' : 'Nota_Masuk';
    const filename = `${prefix}_${transaction.docNumber || transaction.date}`;
    await exportElementToPdf('modal-receipt-printable', filename, 'p', paperFormat);
    setIsExporting(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl border border-slate-300 shadow-2xl max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Cetak & Unduh Dokumen Nota
              </h3>
              <p className="text-xs text-slate-500">
                {transaction.docNumber} • {transaction.recipientOrCustomer}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak (Print)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Membuat PDF...' : 'Unduh PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body containing Receipt */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-200/60 flex justify-center">
          <div className="w-full max-w-3xl">
            <div id="modal-receipt-printable">
              <ReceiptPreview
                transaction={transaction}
                storeProfile={storeProfile}
                watermarkOpacity={0.08}
                showTerbilang={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
