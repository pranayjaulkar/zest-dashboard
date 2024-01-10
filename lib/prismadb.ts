import { Prisma, PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismadb = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prismadb;


const productWithCategorySizeColor =
  Prisma.validator<Prisma.ProductDefaultArgs>()({
    include: { category: true, size: true, color: true },
  });

export type ProductWithCategorySizeColor = Prisma.ProductGetPayload<
  typeof productWithCategorySizeColor
>;
const productWithImages =
  Prisma.validator<Prisma.ProductDefaultArgs>()({
    include: { images: true },
  });

export type ProductWithImages = Prisma.ProductGetPayload<
  typeof productWithImages
>;

export default prismadb;
