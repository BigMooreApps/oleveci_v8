/**
 * Utilidades de credenciales de acceso para comerciantes:
 * - Consecutivo de usuario autogenerado y no modificable: "OLE0101", "OLE0102", "OLE0103"...
 * - Contraseña predefinida por defecto: "Veci2026"
 * - Restitución de contraseña por correo electrónico
 */

export const DEFAULT_PREDEFINED_PASSWORD = 'Veci2026';

export function parseUsernameNumber(username?: string): number | null {
  if (!username) return null;
  const match = username.trim().toUpperCase().match(/^OLE(\d+)$/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  return isNaN(num) ? null : num;
}

export function formatUsernameFromNumber(num: number): string {
  // Asegura el formato OLE0101, OLE0102, etc. con 4 dígitos como base
  return `OLE${String(num).padStart(4, '0')}`;
}

export function getNextConsecutiveUsername(existingBusinesses: { username?: string }[]): string {
  let highest = 100; // Base inicial para que el primer negocio sea 101 -> OLE0101

  for (const b of existingBusinesses) {
    const num = parseUsernameNumber(b.username);
    if (num !== null && num > highest) {
      highest = num;
    }
  }

  const nextNum = highest + 1;
  return formatUsernameFromNumber(nextNum);
}

export interface PasswordResetResult {
  success: boolean;
  destinationEmail: string;
  username: string;
  tempToken: string;
  timestamp: string;
  message: string;
}

export function simulatePasswordResetEmail(
  businessName: string,
  username: string,
  email?: string
): PasswordResetResult {
  const targetEmail = email?.trim() || 'comercio@oleveci.com';
  const tempToken = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = new Date().toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return {
    success: true,
    destinationEmail: targetEmail,
    username,
    tempToken,
    timestamp,
    message: `Se han enviado las instrucciones de restitución para el usuario ${username} al correo ${targetEmail}.`,
  };
}
