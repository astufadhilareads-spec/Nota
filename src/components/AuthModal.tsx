import React, { useState } from 'react';
import { ShieldCheck, User, KeyRound, X, Check, Lock } from 'lucide-react';
import { UserAccount } from '../types';
import { getUsers, saveUsers, setCurrentUser } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUserChanged: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [users, setUsers] = useState<UserAccount[]>(getUsers());
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // New user form state
  const [newFullName, setNewFullName] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newRole, setNewRole] = useState<UserAccount['role']>('Kasir');
  const [newPin, setNewPin] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.id === selectedUserId);
    if (!user) {
      setErrorMsg('Pengguna tidak ditemukan');
      return;
    }

    if (user.pin && user.pin !== pinInput) {
      setErrorMsg('PIN autentikasi salah. (Default: 1234 untuk admin, 0000 untuk kasir)');
      return;
    }

    setCurrentUser(user);
    onUserChanged(user);
    onClose();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newUsername.trim()) {
      setErrorMsg('Nama lengkap dan username wajib diisi.');
      return;
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      fullName: newFullName.trim(),
      role: newRole,
      pin: newPin || '0000',
      avatarColor: newRole === 'Owner' ? 'bg-indigo-600' : newRole === 'Admin' ? 'bg-blue-600' : 'bg-emerald-600',
    };

    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    setCurrentUser(newUser);
    onUserChanged(newUser);
    setIsAddingNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Autentikasi & Akun Pengguna
              </h3>
              <p className="text-xs text-slate-500">
                Pilih profil kasir/owner untuk mencatat transaksi.
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

        {/* Content */}
        {!isAddingNew ? (
          <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-2">
                Pilih Profil Pengguna:
              </label>
              <div className="space-y-2">
                {users.map((u) => (
                  <label
                    key={u.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedUserId === u.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="selectedUser"
                        value={u.id}
                        checked={selectedUserId === u.id}
                        onChange={() => {
                          setSelectedUserId(u.id);
                          setErrorMsg('');
                        }}
                        className="text-indigo-600"
                      />
                      <div className={`w-8 h-8 rounded-full ${u.avatarColor} text-white font-bold flex items-center justify-center text-xs`}>
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{u.fullName}</div>
                        <span className="text-[10px] text-slate-500">@{u.username} • {u.role}</span>
                      </div>
                    </div>
                    {currentUser.id === u.id && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        Sedang Aktif
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>PIN Masuk (4 Digit)</span>
                <span className="text-[10px] text-slate-400">Default: 1234 / 0000</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Masukkan PIN"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm tracking-widest font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                + Tambah Akun Baru
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Masuk / Ganti Akun
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateUser} className="p-6 space-y-3.5 text-xs">
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="budi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / Jabatan</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                >
                  <option value="Kasir">Kasir</option>
                  <option value="Admin">Admin</option>
                  <option value="Owner">Owner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">PIN Masuk (4 Digit)</label>
              <input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs text-slate-600 font-semibold"
              >
                Kembali
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Buat & Aktifkan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
