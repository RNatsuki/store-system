import { prisma } from "@store-system/db";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/mailer";
import { Result, AppError } from "../shared/core/Result";


export interface CreateEmployeeData {
    name: string;
    lastname: string;
    email: string;
    address: string;
    role: string;
    nss: string;
    rfc: string;
    birthdate: string;
}

export async function createEmployeeService(data: CreateEmployeeData): Promise<Result<{ message: string }, AppError>> {
    const { name, lastname, email, address, role, nss, rfc, birthdate } = data;

    try {
        // 1. Validate if user already exists
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return Result.fail(new AppError("El correo ya está en uso", 409));
        }

        const birthdateDate = new Date(birthdate);
        const tempPassword = crypto.randomBytes(8).toString("hex");
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // 2. Prisma atomic transaction (User + Employee)
        await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    password: tempPassword, // Prisma extension will hash it automatically
                    role,
                    isVerified: false,
                    token: verificationToken,
                    tokenExpires: new Date(Date.now() + 3600000), // 1 hour validity
                },
            });

            const employee = await tx.employee.create({
                data: {
                    name,
                    lastname,
                    address,
                    nss,
                    rfc,
                    birthdate: birthdateDate,
                    userId: newUser.id,
                }
            });

            return { newUser, employee };
        });

        // 3. Send verification email
        // Pass the token and generated temporary password
        await sendVerificationEmail(email, verificationToken, tempPassword);

        return Result.ok({ message: "Empleado creado exitosamente. Se ha enviado un correo de verificación." });

    } catch (error) {
        console.error("[createEmployeeService Error]:", error);
        return Result.fail(new AppError("Error interno del servidor", 500));
    }
}

export async function verifyEmployeeAccountService(token: string): Promise<Result<{ message: string }, AppError>> {
    try {
        const user = await prisma.user.findFirst({
            where: {
                token: token,
                tokenExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return Result.fail(new AppError("El token es inválido o ha expirado. Contacta al administrador.", 400));
        }

        // Activation and token cleanup (returns to NULL)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,      // Mark as verified
                token: null,           // Token cleanup after use
                tokenExpires: null,    // Expiration cleanup
            }
        });

        return Result.ok({ message: "Cuenta verificada con éxito. Ahora puedes establecer tu contraseña definitiva." });

    } catch (error) {
        console.error("[verifyEmployeeAccountService Error]:", error);
        return Result.fail(new AppError("Error interno al verificar la cuenta", 500));
    }
}
