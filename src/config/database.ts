import { PrismaClient } from "../../generated/prisma/client";
import { env } from "./env";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });

export const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();
  console.log(`✅ Database connected (${env.NODE_ENV})`);
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};
