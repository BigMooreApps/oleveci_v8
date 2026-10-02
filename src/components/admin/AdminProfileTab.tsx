import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BusinessCredentialsSection } from '../business-form/BusinessCredentialsSection';
import {
  Store,
  MapPin,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AdminProfileTab: React.FC = () => {
  const {
    adminProfile,
    updateAdminProfile,
    resetAdminProfileToDefault,
  } = useApp();

  // Accordion open/close states matching "Mi Negocio" (Image 2) - all collapsed by default
  const [isMainInfoOpen, setIsMainInfoOpen] = useState(false);
  const [isLocationContactOpen, setIsLocationContactOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  // Local form state initialized from current adminProfile
  const [username, setUsername] = useState(adminProfile.username || 'Admin');
  const [password, setPassword] = useState(adminProfile.password || 'Ole2026');

  const [fullName, setFullName] = useState(adminProfile.fullName || 'Administrador General OleVeci');
  const [phone, setPhone] = useState(adminProfile.phone || '+57 310 555 2026');
  const [whatsappSupport, setWhatsappSupport] = useState(adminProfile.whatsappSupport || '3105552026');
  const [email, setEmail] = useState(adminProfile.email || 'admin@oleveci.com');
  const [supportEmail, setSupportEmail] = useState(adminProfile.supportEmail || 'soporte@oleveci.com');

  const [roleTitle, setRoleTitle] = useState(adminProfile.roleTitle || 'Super Administrador de Plataforma');
  const [municipality, setMunicipality] = useState(adminProfile.municipality || 'Cajicá / Sabana Centro, Cundinamarca');
  const [securityNotes, setSecurityNotes] = useState(
    adminProfile.securityNotes ||
      'Acceso de máxima jerarquía para control territorial, moderación, altas de comercio y auditoría del sistema.'
  );

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    // Validations
    if (!username.trim()) {
      setFeedbackMsg({ type: 'error', text: 'El nombre de usuario no puede estar vacío.' });
      return;
    }
    if (password.length < 3) {
      setFeedbackMsg({ type: 'error', text: 'La contraseña debe tener al menos 3 caracteres.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFeedbackMsg({ type: 'error', text: 'Por favor ingresa un correo electrónico administrativo válido.' });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      updateAdminProfile({
        username: username.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsappSupport: whatsappSupport.trim(),
        email: email.trim(),
        supportEmail: supportEmail.trim(),
        roleTitle: roleTitle.trim(),
        municipality: municipality.trim(),
        securityNotes: securityNotes.trim(),
      });
      setIsSaving(false);
      setFeedbackMsg({
        type: 'success',
        text: '¡Información y credenciales de Superadministrador guardadas correctamente!',
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    }, 300);
  };

  const handleResetDefaults = () => {
    resetAdminProfileToDefault();
    setUsername('Admin');
    setPassword('Ole2026');
    setFullName('Administrador General OleVeci');
    setPhone('+57 310 555 2026');
    setWhatsappSupport('3105552026');
    setEmail('admin@oleveci.com');
    setSupportEmail('soporte@oleveci.com');
    setRoleTitle('Super Administrador de Plataforma');
    setMunicipality('Cajicá / Sabana Centro, Cundinamarca');
    setSecurityNotes(
      'Acceso de máxima jerarquía para control territorial, moderación, altas de comercio y auditoría del sistema.'
    );
    setFeedbackMsg({
      type: 'success',
      text: 'Valores restablecidos a configuración de fábrica (Admin / Ole2026).',
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Alerta de confirmación / error */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in duration-200 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Formulario con Accordions Estilo "Mi Negocio" */}
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* ========================================================================= */}
        {/* ACORDEÓN 1: INFORMACIÓN PRINCIPAL                                        */}
        {/* ========================================================================= */}
        <div
          className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
            isMainInfoOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
          }`}
        >
          <div
            role="button"
            tabIndex={0}
            id="admin-main-info-toggle"
            onClick={() => setIsMainInfoOpen(!isMainInfoOpen)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsMainInfoOpen(!isMainInfoOpen);
              }
            }}
            className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-slate-900">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <Store className="w-3.5 h-3.5" />
              </div>
              <span className="text-[#041f5e] font-extrabold">Información principal</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
              {isMainInfoOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </div>

          {isMainInfoOpen && (
            <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
              {/* Nombre Completo */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Nombre Completo del Administrador <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Administrador General OleVeci"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 bg-white shadow-2xs transition-all"
                />
              </div>

              {/* Cargo y Sede */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Cargo / Rol Institucional
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Super Administrador de Plataforma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 bg-white shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Municipio / Sede Operativa
                  </label>
                  <input
                    type="text"
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    placeholder="Cajicá / Sabana Centro, Cundinamarca"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 bg-white shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Notas de seguridad / alcance */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Descripción del Rol y Alcance de Moderación
                </label>
                <textarea
                  rows={2}
                  value={securityNotes}
                  onChange={(e) => setSecurityNotes(e.target.value)}
                  placeholder="Acceso de máxima jerarquía para auditoría, moderación y control..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 bg-white leading-relaxed resize-none shadow-2xs transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ACORDEÓN 2: UBICACIÓN Y CONTACTO                                          */}
        {/* ========================================================================= */}
        <div
          className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all ${
            isLocationContactOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
          }`}
        >
          <div
            role="button"
            tabIndex={0}
            id="admin-loc-contact-toggle"
            onClick={() => setIsLocationContactOpen(!isLocationContactOpen)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsLocationContactOpen(!isLocationContactOpen);
              }
            }}
            className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-slate-900">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="text-[#041f5e] font-extrabold">Ubicación y contacto</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
              {isLocationContactOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </div>

          {isLocationContactOpen && (
            <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
              {/* Teléfonos: WhatsApp y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    WhatsApp de Soporte a Comercios
                  </label>
                  <div className="flex rounded-xl border border-slate-200 focus-within:border-[#007af7] focus-within:ring-2 focus-within:ring-blue-100 bg-white overflow-hidden shadow-2xs transition-all">
                    <div className="flex items-center gap-1.5 px-3 bg-slate-50 border-r border-slate-200 text-slate-700 text-xs font-bold select-none shrink-0">
                      <span className="text-sm leading-none">🇨🇴</span>
                      <span>+57</span>
                    </div>
                    <input
                      type="tel"
                      value={whatsappSupport}
                      onChange={(e) => setWhatsappSupport(e.target.value)}
                      placeholder="310 555 2026"
                      className="flex-1 px-3 py-2.5 text-xs text-slate-900 focus:outline-hidden bg-transparent font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Teléfono Móvil de Operaciones
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 310 555 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 bg-white shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Correos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Correo Principal (Notificaciones) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@oleveci.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 bg-white shadow-2xs transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Correo de Soporte y Facturación
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="soporte@oleveci.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#007af7] focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 bg-white shadow-2xs transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ACORDEÓN 3: USUARIO Y CONTRASEÑA (COMPONENTE MODULAR IDÉNTICO A MI NEGOCIO)*/}
        {/* ========================================================================= */}
        <BusinessCredentialsSection
          username={username}
          password={password}
          onChangeUsername={(newUsername) => {
            setUsername(newUsername);
          }}
          onChangePassword={(newPass) => {
            setPassword(newPass);
          }}
          onSavePassword={(newPass) => {
            setPassword(newPass);
            updateAdminProfile({ password: newPass });
          }}
          saveButtonText="Guardar Contraseña"
          isOpen={isSecurityOpen}
          onToggleOpen={() => setIsSecurityOpen(!isSecurityOpen)}
          role="admin"
          idPrefix="admin-superuser-creds"
        />

        {/* ACCIONES Y BOTONES DE GUARDADO (ESTILO MI NEGOCIO) */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#007af7] hover:bg-[#0068d6] text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 flex items-center gap-1.5"
            title="Restablecer credenciales originales de fábrica (Admin / Ole2026)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restablecer Fábrica</span>
          </button>
        </div>
      </form>
    </div>
  );
};
