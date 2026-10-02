import React, { useState, useEffect } from 'react';
import { Business } from '../../types';
import {
  X,
  Key,
  Lock,
  Mail,
  User,
  Phone,
  Check,
  Eye,
  EyeOff,
  Copy,
  Sparkles,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface AdminCredentialsModalProps {
  isOpen: boolean;
  business: Business | null;
  onClose: () => void;
  onSave: (
    businessId: string,
    credentials: {
      accessEmail?: string;
      accessPassword?: string;
      accessPin?: string;
      ownerName?: string;
      ownerPhone?: string;
    }
  ) => void;
}

export const AdminCredentialsModal: React.FC<AdminCredentialsModalProps> = ({
  isOpen,
  business,
  onClose,
  onSave,
}) => {
  const [accessEmail, setAccessEmail] = useState(
    business?.accessEmail || (business ? `${business.slug || business.id}@oleveci.com` : '')
  );
  const [accessPassword, setAccessPassword] = useState(
    business?.accessPassword || 'Veci2026!'
  );
  const [accessPin, setAccessPin] = useState(business?.accessPin || '1234');
  const [ownerName, setOwnerName] = useState(
    business?.ownerName || 'Propietario / Gerente'
  );
  const [ownerPhone, setOwnerPhone] = useState(
    business?.ownerPhone || business?.phone || business?.whatsapp || ''
  );

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (business && isOpen) {
      setAccessEmail(business.accessEmail || `${business.slug || business.id}@oleveci.com`);
      setAccessPassword(business.accessPassword || 'Veci2026!');
      setAccessPin(business.accessPin || '1234');
      setOwnerName(business.ownerName || 'Propietario / Gerente');
      setOwnerPhone(business.ownerPhone || business.phone || business.whatsapp || '');
      setSuccessToast(false);
    }
  }, [business, isOpen]);

  if (!isOpen || !business) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAccessPassword(res);
  };

  const handleGeneratePin = () => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setAccessPin(newPin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    onSave(business.id, {
      accessEmail: accessEmail.trim(),
      accessPassword: accessPassword.trim(),
      accessPin: accessPin.trim(),
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
    });
    setSuccessToast(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#041f5e] to-[#0b3899] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-base leading-tight truncate">
                Gestión de Credenciales y Claves
              </h3>
              <p className="text-xs text-blue-200 mt-0.5 truncate">
                {business.name} · {business.city}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1">
          {successToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Credenciales actualizadas con efecto cascada en toda la app.</span>
            </div>
          )}

          {/* Business overview badge */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#007af7] flex items-center justify-center font-bold text-xs shrink-0">
                  {business.name.slice(0, 2)}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-bold text-slate-800 block truncate">{business.name}</span>
                <span className="text-[11px] text-slate-500 block truncate">ID: {business.id}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 shrink-0">
              Comercio Activo
            </span>
          </div>

          {/* Access Email / User */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Usuario / Correo de Acceso
              </span>
              <button
                type="button"
                onClick={() => handleCopy(accessEmail, 'email')}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'email' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </label>
            <input
              type="text"
              required
              value={accessEmail}
              onChange={(e) => setAccessEmail(e.target.value)}
              placeholder="ejemplo@oleveci.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs"
            />
          </div>

          {/* Access Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Contraseña Comercial
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 cursor-pointer transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(accessPassword, 'pass')}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'pass' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                placeholder="Contraseña de acceso"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick PIN Code (used in quick selector) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                PIN Rápido (4 dígitos para login rápido)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGeneratePin}
                  className="text-[10px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 cursor-pointer transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generar PIN</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(accessPin, 'pin')}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'pin' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'pin' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              maxLength={6}
              value={accessPin}
              onChange={(e) => setAccessPin(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono tracking-widest font-black text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs"
            />
          </div>

          {/* Owner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Nombre del Titular
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Nombre del comerciante"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="3101234567"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-5 py-2.5 sm:py-2 rounded-xl bg-[#007af7] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
