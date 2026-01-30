import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

/*
* Singleton para evitar múltiples instancias de Prisma en desarrollo
*/
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Para Prisma 7: Configurar adapter para SQLite
// Usa process.cwd() para una resolución más robusta desde la raíz del monorepo
const rootPath = process.cwd();
const dbPath = path.join(rootPath, 'dev.db');
const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter,
    log: ['query'],
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';