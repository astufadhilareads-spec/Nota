import { Transaction, StoreProfile, UserAccount } from '../types';

const TRANSACTIONS_KEY = 'nota_app_transactions_v2';
const STORE_PROFILE_KEY = 'nota_app_store_profile_v2';
const USERS_KEY = 'nota_app_users_v2';
const CURRENT_USER_KEY = 'nota_app_current_user_v2';

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'TEJO',
  tagline: 'FOTOCOPI & PRINT',
  phone: '0882-1074-2717',
  address: 'Samping MTs Ar Rohman Tegalrejo\nSemen, Kec. Nguntoronadi, Kabupaten Magetan, Jawa Timur 63383',
  footerNote: 'Menerima pesanan cetak kartu, print, fotokopi, jilid, kalender, banner, jasa photografi profesional, pamflet, brosur, undangan nikah, ID card, dll.',
  signerTitle: 'Hormat kami,',
  signerName: 'Kasir / Pengelola',
  docPrefixKeluar: 'NK',
  docPrefixMasuk: 'NM'
};

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-admin',
    username: 'admin',
    fullName: 'Tejo S.Kom (Owner)',
    role: 'Owner',
    pin: '1234',
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'user-kasir',
    username: 'kasir1',
    fullName: 'Siti Rahma (Kasir)',
    role: 'Kasir',
    pin: '0000',
    avatarColor: 'bg-emerald-600'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TRANSACTIONS;
  } catch (e) {
    console.error('Error reading transactions from localStorage', e);
    return INITIAL_TRANSACTIONS;
  }
}

export function clearAllTransactions(): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('nota_storage_updated'));
  } catch (e) {
    console.error('Error clearing transactions', e);
  }
}


export function saveAllTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    // Trigger custom event for sync
    window.dispatchEvent(new Event('nota_storage_updated'));
  } catch (e) {
    console.error('Error saving transactions to localStorage', e);
  }
}

export function saveTransaction(trx: Transaction): Transaction[] {
  const current = getStoredTransactions();
  const existingIdx = current.findIndex(t => t.id === trx.id);
  let updated: Transaction[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...trx, updatedAt: new Date().toISOString() };
  } else {
    updated = [trx, ...current];
  }
  saveAllTransactions(updated);
  return updated;
}

export function deleteTransaction(id: string): Transaction[] {
  const current = getStoredTransactions();
  const updated = current.filter(t => t.id !== id);
  saveAllTransactions(updated);
  return updated;
}

export function getStoreProfile(): StoreProfile {
  try {
    const raw = localStorage.getItem(STORE_PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_PROFILE_KEY, JSON.stringify(DEFAULT_STORE_PROFILE));
      return DEFAULT_STORE_PROFILE;
    }
    return { ...DEFAULT_STORE_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading store profile', e);
    return DEFAULT_STORE_PROFILE;
  }
}

export function saveStoreProfile(profile: StoreProfile): void {
  try {
    localStorage.setItem(STORE_PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('nota_store_profile_updated'));
  } catch (e) {
    console.error('Error saving store profile', e);
  }
}

export function getUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): UserAccount {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEFAULT_USERS[0]));
      return DEFAULT_USERS[0];
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS[0];
  }
}

export function setCurrentUser(user: UserAccount): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('nota_user_updated'));
}
