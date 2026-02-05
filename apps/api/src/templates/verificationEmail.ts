import { emailStyles } from './emailStyles';

/**
 * Email template configuration for verification emails.
 *
 * @module verificationEmail
 */

/**
 * Parameters for the verification email template.
 */
export interface VerificationEmailParams {
    /** URL for email verification link */
    url: string;
    /** Temporary password for first login */
    tempPassword: string;
}

/**
 * Generates the HTML content for a verification email.
 *
 * This template is used when a new user account is created and needs
 * to verify their email address before accessing the system.
 *
 * @param params - Template parameters including verification URL and temporary password
 * @returns Complete HTML email content as a string
 *
 * @example
 * ```typescript
 * const html = verificationEmailTemplate({
 *   url: 'https://app.example.com/verify?token=abc123',
 *   tempPassword: 'Temp@123456'
 * });
 * ```
 *
 * @remarks
 * **Template Features:**
 * - Responsive design for mobile and desktop
 * - Prominent CTA button for verification
 * - Secure display of temporary password
 * - Warning about link expiration
 * - Professional branding with gradient header
 *
 * **Security Considerations:**
 * - Temporary password is displayed in monospace font for clarity
 * - Includes expiration warning (1 hour)
 * - Advises password change after first login
 */
export const verificationEmailTemplate = ({ url, tempPassword }: VerificationEmailParams): string => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        ${emailStyles}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Verifica tu correo electrónico</h1>
        </div>
        <div class="content">
            <p>¡Bienvenido a Store System!</p>
            <p>Hemos creado tu cuenta exitosamente. Para activarla y comenzar a usar nuestros servicios, necesitas verificar tu correo electrónico.</p>

            <div class="button-container">
                <a href="${url}" class="verify-button">Verificar mi correo electrónico</a>
            </div>

            <div class="credentials-box">
                <p><strong>Tus credenciales de acceso:</strong></p>
                <p>Tu contraseña temporal es:</p>
                <p class="temp-password">${tempPassword}</p>
            </div>

            <div class="warning">
                <p><strong>Importante:</strong> Este enlace expirará en 1 hora. Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez.</p>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">Si no solicitaste esta cuenta, puedes ignorar este correo de forma segura.</p>
        </div>
        <div class="footer">
            <p>© 2026 Store System. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`;
