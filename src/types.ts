export type TransactionType = 'KELUAR' | 'MASUK';

export interface TransactionItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  docNumber: string;
  date: string; // YYYY-MM-DD
  recipientOrCustomer: string; // "SMK Ar Rohman" / Vendor
  category: string; // e.g. "Bahan Baku & Kertas", "Operasional", "Cetak & Banner", "Desain", dll
  paymentMethod: 'Tunai' | 'Transfer Bank' | 'QRIS' | 'Tempo';
  notes: string;
  items: TransactionItem[];
  subtotal: number;
  taxRate: number; // percentage or nominal
  taxType: 'percentage' | 'nominal';
  taxAmount: number;
  discountRate: number;
  discountType: 'percentage' | 'nominal';
  discountAmount: number;
  grandTotal: number;
  signerName: string;
  status: 'Lunas' | 'Pending' | 'Batal';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreProfile {
  name: string;
  tagline: string;
  phone: string;
  address: string;
  footerNote: string;
  signerTitle: string;
  signerName: string;
  docPrefixKeluar: string;
  docPrefixMasuk: string;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: 'Owner' | 'Admin' | 'Kasir';
  pin: string;
  avatarColor: string;
}

export type ActiveTab = 'input-nota' | 'mingguan' | 'bulanan' | 'rekap-dashboard' | 'riwayat';
