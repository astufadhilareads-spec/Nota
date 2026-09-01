import React, { useState, useEffect, useId } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  Download, 
  RotateCcw, 
  AlertCircle, 
  Check, 
  Sparkles, 
  ArrowDownRight, 
  ArrowUpRight,
  Calculator,
  Layers,
  FileCheck
} from 'lucide-react';
import { Transaction, TransactionItem, TransactionType, StoreProfile, UserAccount } from '../types';
import { formatRupiah, getTodayDateString, generateDocNumber } from '../utils/formatters';

interface TransactionFormProps {
  initialTransaction?: Transaction | null;
  storeProfile: StoreProfile;
  currentUser: UserAccount;
  existingTransactionsCount: number;
  onSave: (transaction: Transaction) => void;
  onDownloadPdf: () => void;
  onChange: (transaction: Transaction) => void;
  onCancelEdit?: () => void;
}

const COMMON_UNITS = ['pcs', 'lembar', 'meter', 'rim', 'botol', 'roll', 'paket', 'file', 'buku', 'box', 'set'];

const EXPENSE_CATEGORIES = [
  'Bahan Baku & Kertas',
  'Tinta & Perlengkapan Print',
  'Operasional & Listrik',
  'Gaji & Konsumsi',
  'Maintenance Mesin',
  'Sewa & Bangunan',
  'Lain-lain'
];

const INCOME_CATEGORIES = [
  'Cetak & Digital Print',
  'Jilid & Fotokopi',
  'Jasa Desain Grafis',
  'Merchandise & Sablon',
  'ATK & Penjualan Kertas',
  'Lain-lain'
];

const QUICK_ITEM_PRESETS = [
  { name: 'Cetak banner 3x1 m', unit: 'meter', unitPrice: 17500, type: 'MASUK' },
  { name: 'Desain Grafis / Banner', unit: 'file', unitPrice: 10000, type: 'MASUK' },
  { name: 'Fotocopi A4 Bolak-balik', unit: 'lembar', unitPrice: 250, type: 'MASUK' },
  { name: 'Print Warna A4 Full', unit: 'lembar', unitPrice: 1500, type: 'MASUK' },
  { name: 'Jilid Spiral Kawat + Mika', unit: 'buku', unitPrice: 15000, type: 'MASUK' },
  { name: 'Kertas HVS A4 70gr PaperOne', unit: 'rim', unitPrice: 48000, type: 'KELUAR' },
  { name: 'Tinta Epson 003 Black', unit: 'botol', unitPrice: 85000, type: 'KELUAR' },
  { name: 'Mata Ayam Banner (Eyelet)', unit: 'box', unitPrice: 35000, type: 'KELUAR' },
  { name: 'Token Listrik Workshop', unit: 'paket', unitPrice: 200000, type: 'KELUAR' },
];

export const TransactionForm: React.FC<TransactionFormProps> = ({
  initialTransaction,
  storeProfile,
  currentUser,
  existingTransactionsCount,
  onSave,
  onDownloadPdf,
  onChange,
  onCancelEdit,
}) => {
  const formId = useId();

  // Form State
  const [trxType, setTrxType] = useState<TransactionType>(initialTransaction?.type || 'KELUAR');
  const [date, setDate] = useState<string>(initialTransaction?.date || getTodayDateString());
  const [recipientOrCustomer, setRecipientOrCustomer] = useState<string>(
    initialTransaction?.recipientOrCustomer || (trxType === 'KELUAR' ? 'Toko Kertas Nusantara' : 'SMK Ar Rohman')
  );
  const [docNumber, setDocNumber] = useState<string>(
    initialTransaction?.docNumber || generateDocNumber(trxType, date, existingTransactionsCount + 1)
  );
  const [category, setCategory] = useState<string>(
    initialTransaction?.category || (trxType === 'KELUAR' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
  );
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>(
    initialTransaction?.paymentMethod || 'Tunai'
  );
  const [notes, setNotes] = useState<string>(initialTransaction?.notes || '');
  const [signerName, setSignerName] = useState<string>(
    initialTransaction?.signerName || currentUser.fullName || storeProfile.signerName || 'Pengelola'
  );
  const [status, setStatus] = useState<Transaction['status']>(initialTransaction?.status || 'Lunas');

  // Items State
  const [items, setItems] = useState<TransactionItem[]>(
    initialTransaction?.items && initialTransaction.items.length > 0
      ? initialTransaction.items
      : [
          {
            id: 'item-1',
            name: trxType === 'KELUAR' ? 'Kertas HVS A4 70gr (PaperOne)' : 'Cetak banner 3x1 m',
            qty: trxType === 'KELUAR' ? 5 : 3,
            unit: trxType === 'KELUAR' ? 'rim' : 'meter',
            unitPrice: trxType === 'KELUAR' ? 48000 : 17500,
            total: trxType === 'KELUAR' ? 240000 : 52500,
          },
        ]
  );

  // Taxes & Discounts
  const [taxRate, setTaxRate] = useState<number>(initialTransaction?.taxRate || 0);
  const [taxType, setTaxType] = useState<'percentage' | 'nominal'>(initialTransaction?.taxType || 'percentage');
  const [discountRate, setDiscountRate] = useState<number>(initialTransaction?.discountRate || 0);
  const [discountType, setDiscountType] = useState<'percentage' | 'nominal'>(
    initialTransaction?.discountType || 'nominal'
  );

  // Re-sync form state when initialTransaction changes (e.g. user clicked Edit on a report row)
  useEffect(() => {
    if (initialTransaction) {
      setTrxType(initialTransaction.type);
      setDate(initialTransaction.date);
      setRecipientOrCustomer(initialTransaction.recipientOrCustomer || '');
      setDocNumber(initialTransaction.docNumber || '');
      setCategory(initialTransaction.category || (initialTransaction.type === 'KELUAR' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]));
      setPaymentMethod(initialTransaction.paymentMethod || 'Tunai');
      setNotes(initialTransaction.notes || '');
      setSignerName(initialTransaction.signerName || currentUser.fullName || 'Pengelola');
      setStatus(initialTransaction.status || 'Lunas');
      setItems(initialTransaction.items && initialTransaction.items.length > 0 ? initialTransaction.items : [
        {
          id: `item-${Date.now()}`,
          name: '',
          qty: 1,
          unit: 'pcs',
          unitPrice: 0,
          total: 0,
        }
      ]);
      setTaxRate(initialTransaction.taxRate || 0);
      setTaxType(initialTransaction.taxType || 'percentage');
      setDiscountRate(initialTransaction.discountRate || 0);
      setDiscountType(initialTransaction.discountType || 'nominal');
      setErrors({});
    }
  }, [initialTransaction, currentUser.fullName]);

  // Errors / Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // Recalculate computed values
  const subtotal = items.reduce((acc, it) => acc + (Number(it.total) || 0), 0);

  const taxAmount =
    taxType === 'percentage'
      ? Math.round((subtotal * (Number(taxRate) || 0)) / 100)
      : Math.round(Number(taxRate) || 0);

  const discountAmount =
    discountType === 'percentage'
      ? Math.round((subtotal * (Number(discountRate) || 0)) / 100)
      : Math.round(Number(discountRate) || 0);

  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  // Sync to parent live preview
  useEffect(() => {
    const currentTrx: Transaction = {
      id: initialTransaction?.id || `trx-${Date.now()}`,
      type: trxType,
      docNumber: docNumber || generateDocNumber(trxType, date, existingTransactionsCount + 1),
      date,
      recipientOrCustomer,
      category,
      paymentMethod,
      notes,
      items,
      subtotal,
      taxRate: Number(taxRate) || 0,
      taxType,
      taxAmount,
      discountRate: Number(discountRate) || 0,
      discountType,
      discountAmount,
      grandTotal,
      signerName,
      status,
      createdBy: currentUser.fullName,
      createdAt: initialTransaction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onChange(currentTrx);
  }, [
    trxType,
    date,
    recipientOrCustomer,
    docNumber,
    category,
    paymentMethod,
    notes,
    items,
    subtotal,
    taxRate,
    taxType,
    taxAmount,
    discountRate,
    discountType,
    discountAmount,
    grandTotal,
    signerName,
    status,
    currentUser.fullName,
  ]);

  // Handle Type switch
  const handleTypeChange = (newType: TransactionType) => {
    setTrxType(newType);
    setDocNumber(generateDocNumber(newType, date, existingTransactionsCount + 1));
    if (newType === 'KELUAR') {
      setCategory(EXPENSE_CATEGORIES[0]);
      if (recipientOrCustomer === 'SMK Ar Rohman') {
        setRecipientOrCustomer('Toko Kertas Nusantara');
      }
    } else {
      setCategory(INCOME_CATEGORIES[0]);
      if (recipientOrCustomer === 'Toko Kertas Nusantara') {
        setRecipientOrCustomer('SMK Ar Rohman');
      }
    }
  };

  // Item row operations
  const handleItemChange = (index: number, field: keyof TransactionItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Strict validation: qty & unitPrice cannot be negative
    if (field === 'qty') {
      const num = parseFloat(value);
      item.qty = isNaN(num) ? 0 : Math.max(0, num);
      item.total = item.qty * item.unitPrice;
    } else if (field === 'unitPrice') {
      const num = parseFloat(value);
      item.unitPrice = isNaN(num) ? 0 : Math.max(0, num);
      item.total = item.qty * item.unitPrice;
    }

    updated[index] = item;
    setItems(updated);

    // Clear validation error on touch
    if (errors[`item_${index}_name`]) {
      const newErrors = { ...errors };
      delete newErrors[`item_${index}_name`];
      setErrors(newErrors);
    }
  };

  const addItemRow = () => {
    const newItem: TransactionItem = {
      id: `item-${Date.now()}-${items.length + 1}`,
      name: '',
      qty: 1,
      unit: 'pcs',
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      // Reset single row instead of empty
      setItems([
        {
          id: `item-${Date.now()}`,
          name: '',
          qty: 1,
          unit: 'pcs',
          unitPrice: 0,
          total: 0,
        },
      ]);
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const applyPreset = (preset: typeof QUICK_ITEM_PRESETS[0]) => {
    const newItem: TransactionItem = {
      id: `item-${Date.now()}-${items.length + 1}`,
      name: preset.name,
      qty: 1,
      unit: preset.unit,
      unitPrice: preset.unitPrice,
      total: preset.unitPrice,
    };

    // If first item is empty, replace it
    if (items.length === 1 && !items[0].name && items[0].unitPrice === 0) {
      setItems([newItem]);
    } else {
      setItems([...items, newItem]);
    }
  };

  // Validate and submit
  const handleSaveData = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!recipientOrCustomer.trim()) {
      newErrors.recipientOrCustomer = trxType === 'KELUAR' ? 'Nama penerima / vendor wajib diisi' : 'Nama pelanggan wajib diisi';
    }

    if (!date) {
      newErrors.date = 'Tanggal transaksi wajib dipilih';
    }

    if (items.length === 0) {
      newErrors.items = 'Minimal harus ada 1 item transaksi';
    }

    items.forEach((item, idx) => {
      if (!item.name.trim()) {
        newErrors[`item_${idx}_name`] = `Baris #${idx + 1}: Nama item tidak boleh kosong`;
      }
      if (item.qty <= 0) {
        newErrors[`item_${idx}_qty`] = `Baris #${idx + 1}: Qty harus lebih besar dari 0`;
      }
      if (item.unitPrice < 0) {
        newErrors[`item_${idx}_price`] = `Baris #${idx + 1}: Harga tidak boleh negatif`;
      }
    });

    if (taxRate < 0) {
      newErrors.taxRate = 'Pajak tidak boleh bernilai negatif';
    }

    if (discountRate < 0) {
      newErrors.discountRate = 'Diskon tidak boleh bernilai negatif';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) el.focus();
      return;
    }

    setErrors({});

    const savedTrx: Transaction = {
      id: initialTransaction?.id || `trx-${Date.now()}`,
      type: trxType,
      docNumber: docNumber || generateDocNumber(trxType, date, existingTransactionsCount + 1),
      date,
      recipientOrCustomer: recipientOrCustomer.trim(),
      category,
      paymentMethod,
      notes: notes.trim(),
      items,
      subtotal,
      taxRate: Number(taxRate) || 0,
      taxType,
      taxAmount,
      discountRate: Number(discountRate) || 0,
      discountType,
      discountAmount,
      grandTotal,
      signerName: signerName.trim() || 'Pengelola',
      status,
      createdBy: currentUser.fullName,
      createdAt: initialTransaction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedTrx);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 4000);
  };

  const handleResetForm = () => {
    if (confirm('Kosongkan formulir dan buat input baru?')) {
      setDate(getTodayDateString());
      setTrxType('KELUAR');
      setRecipientOrCustomer('');
      setNotes('');
      setDocNumber(generateDocNumber('KELUAR', getTodayDateString(), existingTransactionsCount + 1));
      setItems([
        {
          id: `item-${Date.now()}`,
          name: '',
          qty: 1,
          unit: 'pcs',
          unitPrice: 0,
          total: 0,
        },
      ]);
      setTaxRate(0);
      setDiscountRate(0);
      setErrors({});
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
      
      {/* Header Form & Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            Input Transaksi Harian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih jenis transaksi untuk membuat Nota Keluar (Pengeluaran) atau Nota Masuk (Pendapatan).
          </p>
        </div>

        {/* Big Switcher: UANG KELUAR vs UANG MASUK */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            id="btn-select-uang-keluar"
            onClick={() => handleTypeChange('KELUAR')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              trxType === 'KELUAR'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            UANG KELUAR (Nota Keluar)
          </button>
          <button
            type="button"
            id="btn-select-uang-masuk"
            onClick={() => handleTypeChange('MASUK')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              trxType === 'MASUK'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            UANG MASUK (Nota Masuk)
          </button>
        </div>
      </div>

      {/* Edit Mode Alert Banner if editing existing transaction */}
      {initialTransaction && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold uppercase text-[10px]">Mode Edit</span>
            <span>Anda sedang mengubah data transaksi: <strong className="font-mono">{initialTransaction.docNumber || initialTransaction.id}</strong></span>
          </div>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal Edit / Buat Baru
            </button>
          )}
        </div>
      )}

      {/* Validation Banner if errors exist */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Mohon perbaiki isian formulir:</span>
            <ul className="list-disc list-inside space-y-0.5 text-rose-700">
              {Object.values(errors).slice(0, 3).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Save Success Alert */}
      {isSavedRecently && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900 text-xs font-semibold animate-pulse">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Data transaksi berhasil disimpan ke localStorage & sinkron ke laporan!</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono">Tersimpan</span>
        </div>
      )}

      {/* MAIN INPUT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tanggal Transaksi */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
            Tanggal (Hari/Tgl) <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setDocNumber(generateDocNumber(trxType, e.target.value, existingTransactionsCount + 1));
            }}
            className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
              errors.date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            }`}
          />
        </div>

        {/* Nomor Dokumen */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
            Nomor Dokumen / Nota
          </label>
          <input
            id="input-doc-number"
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder="Contoh: NK-20260901-001"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Penerima / Pelanggan */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
            {trxType === 'KELUAR' ? 'Penerima / Toko / Vendor' : 'Kepada Yth (Pelanggan)'} <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-recipient"
            type="text"
            value={recipientOrCustomer}
            onChange={(e) => setRecipientOrCustomer(e.target.value)}
            placeholder={trxType === 'KELUAR' ? 'Contoh: Toko Kertas Nusantara' : 'Contoh: SMK Ar Rohman'}
            className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
              errors.recipientOrCustomer ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            }`}
          />
          {errors.recipientOrCustomer && (
            <p className="text-[11px] text-rose-600 mt-1">{errors.recipientOrCustomer}</p>
          )}
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
            Kategori Transaksi
          </label>
          <select
            id="select-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {(trxType === 'KELUAR' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Presets / Fast Fill Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Tambah Cepat Item Sering Digunakan:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ITEM_PRESETS.filter((p) => p.type === trxType).map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3 text-slate-400" />
              <span>{preset.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({formatRupiah(preset.unitPrice)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS TABLE INPUT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Daftar Barang / Jasa ({items.length} Item)
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">• Minimal 1 baris item</span>
          </div>
          <button
            type="button"
            id="btn-add-item-row"
            onClick={addItemRow}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Baris</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full text-left text-xs border-collapse min-w-[620px]">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-3">Nama Barang / Deskripsi</th>
                <th className="py-2.5 px-3 w-20 text-center">QTY</th>
                <th className="py-2.5 px-3 w-24">Satuan</th>
                <th className="py-2.5 px-3 w-36 text-right">Harga Satuan</th>
                <th className="py-2.5 px-3 w-36 text-right">Total</th>
                <th className="py-2.5 px-2 text-center w-12">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Row index */}
                  <td className="py-2 px-3 text-center font-bold text-slate-500">
                    {index + 1}
                  </td>

                  {/* Nama Item */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="Contoh: Cetak banner 3x1 m"
                      className={`w-full px-2.5 py-1.5 bg-slate-50 border rounded text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                        errors[`item_${index}_name`] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300'
                      }`}
                    />
                    {errors[`item_${index}_name`] && (
                      <p className="text-[10px] text-rose-600 mt-0.5">{errors[`item_${index}_name`]}</p>
                    )}
                  </td>

                  {/* Qty */}
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.qty === 0 ? '' : item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      placeholder="1"
                      className="w-full px-2 py-1.5 text-center bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>

                  {/* Satuan */}
                  <td className="py-2 px-2">
                    <div className="relative">
                      <input
                        type="text"
                        list={`units-list-${formId}`}
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        placeholder="pcs"
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <datalist id={`units-list-${formId}`}>
                        {COMMON_UNITS.map((u) => (
                          <option key={u} value={u} />
                        ))}
                      </datalist>
                    </div>
                  </td>

                  {/* Harga Satuan */}
                  <td className="py-2 px-3">
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-[11px] text-slate-400 font-mono">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={item.unitPrice === 0 ? '' : item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        placeholder="0"
                        className="w-full pl-7 pr-2 py-1.5 text-right bg-slate-50 border border-slate-300 rounded text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </td>

                  {/* Total per Item */}
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                    {formatRupiah(item.total)}
                  </td>

                  {/* Delete button */}
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Hapus baris"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CALCULATIONS, TAX, DISCOUNT, AND NOTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 border-t border-slate-200">
        
        {/* Left Column: Notes, Payment Method, Signer */}
        <div className="lg:col-span-7 space-y-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Tunai">Tunai (Cash)</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="QRIS">QRIS</option>
                <option value="Tempo">Tempo / Hutang</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Pembayaran
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Lunas">Lunas</option>
                <option value="Pending">Pending / Belum Lunas</option>
                <option value="Batal">Batal</option>
              </select>
            </div>
          </div>

          {/* Keterangan / Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan / Catatan Transaksi (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan untuk dokumen nota..."
              rows={2}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Penandatangan Nota */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Petugas / TTD Nota
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Nama Kasir / Pengelola"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right Column: Subtotal, Diskon, Pajak & Grand Total */}
        <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3">
          
          {/* Subtotal */}
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Subtotal:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatRupiah(subtotal)}
            </span>
          </div>

          {/* Diskon */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Diskon:</span>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="text-[10px] py-0.5 px-1 bg-white border border-slate-300 rounded text-slate-700 font-medium"
              >
                <option value="nominal">Rp (Nominal)</option>
                <option value="percentage">% (Persen)</option>
              </select>
            </div>
            <div className="w-32">
              <input
                type="number"
                min="0"
                value={discountRate === 0 ? '' : discountRate}
                onChange={(e) => setDiscountRate(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-right font-mono text-xs font-semibold text-rose-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Pajak (Opsional) */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Pajak:</span>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value as any)}
                className="text-[10px] py-0.5 px-1 bg-white border border-slate-300 rounded text-slate-700 font-medium"
              >
                <option value="percentage">% (Persen)</option>
                <option value="nominal">Rp (Nominal)</option>
              </select>
            </div>
            <div className="w-32">
              <input
                type="number"
                min="0"
                value={taxRate === 0 ? '' : taxRate}
                onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-right font-mono text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-slate-200 pt-1" />

          {/* Sleek Dark Grand Total Box */}
          <div className="bg-slate-900 rounded-xl p-4 text-white flex justify-between items-center shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                {trxType === 'KELUAR' ? 'Total Uang Keluar' : 'Total Uang Masuk'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {items.length} Barang / Jasa
              </span>
            </div>
            <div className="text-right">
              <span className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                trxType === 'KELUAR' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS (Save Data & Unduh PDF Wajib) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        
        <button
          type="button"
          onClick={handleResetForm}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer w-full sm:w-auto justify-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Tombol Unduh PDF Nota Harian */}
          <button
            type="button"
            id="btn-download-pdf-nota"
            onClick={onDownloadPdf}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Unduh PDF Nota</span>
          </button>

          {/* Tombol Simpan Data (Wajib) */}
          <button
            type="button"
            id="btn-save-transaction"
            onClick={() => handleSaveData()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{initialTransaction ? 'Perbarui Transaksi' : 'Simpan Transaksi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
