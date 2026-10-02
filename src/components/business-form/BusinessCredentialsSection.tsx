import React, { useState } from 'react';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DEFAULT_PREDEFINED_PASSWORD } from '../../utils/credentialUtils';

export interface BusinessCredentialsSectionProps {
  username: string;
  password?: string;
  onChangeUsername?: (newUsername: string) => void;
  onChangePassword?: (newPassword: string) => void;
  onSavePassword?: (newPassword: string) => void;
  saveButtonText?: string;
  saveSuccessMessage?: string | null;
  saveErrorMessage?: string | null;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  isAdmin?: boolean;
  role?: 'admin' | 'business';
  className?: string;
  idPrefix?: string;
}

export const BusinessCredentialsSection: React.FC<BusinessCredentialsSectionProps> = ({
  username,
  password = DEFAULT_PREDEFINED_PASSWORD,
  onChangeUsername,
  onChangePassword,
  onSavePassword,
  saveButtonText = 'Guardar Contraseña',
  saveSuccessMessage,
  saveErrorMessage,
  isOpen = false,
  onToggleOpen,
  role = 'business',
  className = '',
  idPrefix = 'biz-creds',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isSectionOpen = onToggleOpen !== undefined ? isOpen : internalIsOpen;
  const toggleSection = onToggleOpen || (() => setInternalIsOpen((prev) => !prev));

  // Visualización de la contraseña actual
  const [showPassword, setShowPassword] = useState(false);

  // Estado para la opción separada de cambiar contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  const handleSaveNewPassword = () => {
    setValidationError(null);
    const trimmedNew = (newPassword || '').trim();
    const trimmedConfirm = (confirmPassword || '').trim();

    if (!trimmedNew) {
      setValidationError('Por favor ingresa la nueva contraseña.');
      return;
    }
    if (trimmedNew.length < 3) {
      setValidationError('La nueva contraseña debe tener al menos 3 caracteres.');
      return;
    }
    if (trimmedConfirm && trimmedNew !== trimmedConfirm) {
      setValidationError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    if (onChangePassword) {
      onChangePassword(trimmedNew);
    }
    if (onSavePassword) {
      onSavePassword(trimmedNew);
    }
    setLocalSuccess(`¡Contraseña actualizada correctamente a "${trimmedNew}"!`);
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
    setTimeout(() => setLocalSuccess(null), 4000);
  };

  return (
    <div
      className={`bg-white/95 rounded-2xl border border-slate-200/90 shadow-[0_2px_14px_rgba(4,31,94,0.04)] hover:border-slate-300/80 transition-all ${
        isSectionOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
      } ${className}`}
    >
      <div
        role="button"
        tabIndex={0}
        id={`${idPrefix}-toggle-header`}
        onClick={toggleSection}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSection();
          }
        }}
        className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-slate-900">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <KeyRound className="w-3.5 h-3.5" />
          </div>
          <span className="text-[#041f5e] font-extrabold">Usuario y Contraseña</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
          {isSectionOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#007af7]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </div>

      {isSectionOpen && (
        <div className="pt-2 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
          {/* Fila Principal: Credenciales Actuales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Campo Usuario Asignado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {role === 'admin' ? 'Usuario Superadmin' : 'Usuario asignado'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id={`${idPrefix}-username-input`}
                  readOnly={!onChangeUsername}
                  disabled={!onChangeUsername}
                  value={username}
                  onChange={onChangeUsername ? (e) => onChangeUsername(e.target.value) : undefined}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border ${
                    onChangeUsername
                      ? 'border-slate-200/90 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white text-slate-900 focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10'
                      : 'border-slate-200/80 bg-slate-100/90 text-slate-700 cursor-not-allowed'
                  } text-xs font-mono font-bold select-all shadow-2xs transition-all`}
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Campo Contraseña Actual */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  id={`${idPrefix}-toggle-pass-btn`}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id={`${idPrefix}-password-input`}
                  value={password}
                  readOnly
                  disabled
                  placeholder="Veci2026"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-slate-100/90 text-slate-700 text-xs font-mono font-bold cursor-not-allowed select-all shadow-2xs"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {(localSuccess || saveSuccessMessage) && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{localSuccess || saveSuccessMessage}</span>
            </div>
          )}

          {saveErrorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{saveErrorMessage}</span>
            </div>
          )}

          {/* Opción para cambiar contraseña (Aparte) */}
          {(onChangePassword || onSavePassword) && (
            <div className="pt-2 border-t border-slate-100">
              {!isChangingPassword ? (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    id={`${idPrefix}-open-change-pass-btn`}
                    onClick={() => {
                      setIsChangingPassword(true);
                      setValidationError(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#041f5e] bg-gradient-to-r from-blue-50 to-indigo-50/80 hover:from-blue-100/80 hover:to-indigo-100/90 border border-blue-200/70 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#0056d6]" />
                    <span>Cambiar contraseña</span>
                  </button>
                </div>
              ) : (
                /* Bloque Aparte: Formulario de Cambio de Contraseña */
                <div
                  id={`${idPrefix}-change-password-panel`}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAFD] border border-slate-200/90 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#041f5e] to-[#0056d6] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">
                        Cambiar Contraseña
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setNewPassword('');
                        setConfirmPassword('');
                        setValidationError(null);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nueva contraseña */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Nueva Contraseña
                        </label>
                        <button
                          type="button"
                          id={`${idPrefix}-toggle-new-pass-btn`}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showNewPassword ? 'Ocultar' : 'Ver'}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id={`${idPrefix}-new-pass-input`}
                          value={newPassword}
                          autoFocus
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveNewPassword();
                            }
                          }}
                          placeholder="Ingresa la nueva contraseña"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200/90 focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-white font-mono font-bold shadow-2xs transition-all"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Confirmar Contraseña
                        </label>
                        <button
                          type="button"
                          id={`${idPrefix}-toggle-confirm-pass-btn`}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showConfirmPassword ? 'Ocultar' : 'Ver'}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id={`${idPrefix}-confirm-pass-input`}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveNewPassword();
                            }
                          }}
                          placeholder="Repite la nueva contraseña"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200/90 focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-white font-mono font-bold shadow-2xs transition-all"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Error de validación */}
                  {validationError && (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      id={`${idPrefix}-cancel-new-pass-btn`}
                      onClick={() => {
                        setIsChangingPassword(false);
                        setNewPassword('');
                        setConfirmPassword('');
                        setValidationError(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      id={`${idPrefix}-submit-new-pass-btn`}
                      onClick={handleSaveNewPassword}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#041f5e] to-[#0056d6] hover:brightness-110 text-white text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{saveButtonText || 'Guardar Contraseña'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
