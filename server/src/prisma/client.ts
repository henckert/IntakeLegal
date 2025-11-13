import { PrismaClient } from '@prisma/client';
import { ENV } from '../env.js';

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  if (!ENV.DATABASE_URL) return null;
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}
