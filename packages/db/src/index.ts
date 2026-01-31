import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';

/*
* Singleton para evitar múltiples instancias de Prisma en desarrollo.
* Usamos el tipo del cliente extendido para mantener el soporte de TypeScript.
*/
const globalForPrisma = globalThis as unknown as { prisma: any };

// Adapter configuration for Better SQLite3
const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

//  Base Prisma Instance
const basePrisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
/**
 * ! Client extension to hash passwords automatically on create and update operations.
 * @returns {PrismaClient} Extended Prisma Client with password hashing.
 */
export const prisma = basePrisma.$extends({
    query: {
        user: {
            async create({ args, query }: any) {
                if (args.data.password) {
                    const salt = await bcrypt.genSalt(10);
                    args.data.password = await bcrypt.hash(args.data.password, salt);
                }
                return query(args);
            },
            async update({ args, query }: any) {
                // Hash password if it's being updated
                if (args.data.password && typeof args.data.password === 'string') {
                    const salt = await bcrypt.genSalt(10);
                    args.data.password = await bcrypt.hash(args.data.password, salt);
                }
                return query(args);
            }
        }
    }
});

// Singleton pattern for development
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';