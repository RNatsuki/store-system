import nodemailer from "nodemailer";
import { verificationEmailTemplate } from '../templates/verificationEmail';
import dotenv from 'dotenv';
dotenv.config();
/**
 * Sends a verification email to a new user.
 *
 * This function creates and sends an email containing a verification link
 * and temporary password to allow the user to activate their account.
 *
 * @param email - Recipient's email address
 * @param token - Unique verification token
 * @param tempPass - Temporary password for first login
 *
 * @throws Will throw an error if the email fails to send
 *
 * @example
 * ```typescript
 * await sendVerificationEmail(
 *   'user@example.com',
 *   'abc123xyz',
 *   'TempPass@123'
 * );
 * ```
 *
 * @remarks
 * **Environment Variables Required:**
 * - `FRONTEND_URL`: Base URL for the frontend application
 * - `MAIL_HOST`: SMTP server host
 * - `MAIL_PORT`: SMTP server port
 * - `MAIL_USER`: SMTP authentication username
 * - `MAIL_PASS`: SMTP authentication password
 *
 * **Email Configuration:**
 * - Uses secure SMTP connection (TLS)
 * - Sender: "Store System" with configured email
 * - Subject: "Verificación de correo electrónico"
 * - Template: Professional HTML template with verification link
 */
export const sendVerificationEmail = async(email: string, token: string, tempPass: string) => {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${email}`;

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"Store System" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Verificación de correo electrónico",
        html: verificationEmailTemplate({ url, tempPassword: tempPass }),
    });
}
