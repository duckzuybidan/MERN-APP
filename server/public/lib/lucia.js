"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lucia = void 0;
const prisma_1 = require("./prisma");
const lucia = async () => {
    const { Lucia } = await import("lucia");
    const { PrismaAdapter } = await import("@lucia-auth/adapter-prisma");
    const adapter = new PrismaAdapter(prisma_1.prisma.session, prisma_1.prisma.user);
    return new Lucia(adapter, {
        sessionCookie: {
            name: process.env.SESSION_NAME || "app-cookie",
            expires: false,
            attributes: {
                secure: process.env.NODE_ENV === "production",
            },
        }
    });
};
exports.lucia = lucia;
