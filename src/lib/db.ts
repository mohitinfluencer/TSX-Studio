import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import type { Config } from "@libsql/client";

// Use the DATABASE_URL from environment or default path
const libsqlConfig: Config = {
  url: process.env.DATABASE_URL || "file:prisma/dev.db",
};

const adapter = new PrismaLibSql(libsqlConfig);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

export const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
