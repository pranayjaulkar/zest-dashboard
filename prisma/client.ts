import { PrismaClient } from "@prisma/client";

// Frameworks like Next.js support hot reloading of changed files, which enables you to
// see changes to your application without restarting.
// However, if the framework refreshes the module responsible for exporting PrismaClient,
// this can result in additional, unwanted instances of PrismaClient in a development environment.
//As a workaround, you can store PrismaClient as a global variable in development environments only, as global variables are not reloaded:

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
