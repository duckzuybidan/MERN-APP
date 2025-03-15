import { prisma } from "./prisma.ts";
export const lucia = async () => {
   const { Lucia } = await import("lucia");
   const { PrismaAdapter } = await import("@lucia-auth/adapter-prisma");
   const adapter = new PrismaAdapter(prisma.session, prisma.user);
   return new Lucia(adapter, {
      sessionCookie: {
         name: process.env.SESSION_NAME || "app-cookie",
         expires: false,
         attributes: {
           secure: process.env.NODE_ENV === "production",
         },
      } 
   })
}