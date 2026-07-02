import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { serverEnv } from "@/src/lib/env/server";

type GlobalWithPrisma = typeof globalThis & {
  luxeaPrisma?: PrismaClient;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as GlobalWithPrisma;

export const prisma =
  globalForPrisma.luxeaPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.luxeaPrisma = prisma;
}
