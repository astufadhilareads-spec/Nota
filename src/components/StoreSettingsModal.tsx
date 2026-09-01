import React, { useState } from 'react';
import { Store, X, Save, RotateCcw, Check, Sparkles } from 'lucide-react';
import { StoreProfile } from '../types';
import { DEFAULT_STORE_PROFILE } from '../utils/storage';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeProfile: StoreProfile;
  onSave: (profile: StoreProfile) => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  storeProfile,
  onSave,
}) => {
  const [profile, setProfile] = useState<StoreProfile>({ ...storeProfile });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
    onClose();
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan profil toko ke template default "TEJO FOTOCOPI & PRINT"?')) {
      setProfile({ ...DEFAULT_STORE_PROFILE });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Identitas Toko & Template Cetak
              </h3>
              <p className="text-xs text-slate-500">
                Ubah informasi nama usaha, alamat, dan nomor kontak nota.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Usaha / Toko
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Contoh: TEJO"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Sub-Judul / Tagline
              </label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                placeholder="Contoh: FOTOCOPI & PRINT"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Contoh: 0882-1074-2717"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Alamat Lengkap Usaha
            </label>
            <textarea
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Alamat lengkap toko untuk dicetak di pojok bawah nota..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Teks Keterangan Layanan (Kotak Tengah Bawah)
            </label>
            <textarea
              value={profile.footerNote}
              onChange={(e) => setProfile({ ...profile, footerNote: e.target.value })}
              placeholder="Menerima pesanan cetak kartu, print, fotokopi, jilid, kalender, banner, dll..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Teks Penutup TTD
              </label>
              <input
                type="text"
                value={profile.signerTitle}
                onChange={(e) => setProfile({ ...profile, signerTitle: e.target.value })}
                placeholder="Hormat kami,"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Default Kasir / TTD
              </label>
              <input
                type="text"
                value={profile.signerName}
                onChange={(e) => setProfile({ ...profile, signerName: e.target.value })}
                placeholder="Kasir / Pengelola"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Tejo Fotocopi</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
