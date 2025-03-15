"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const lucia_1 = require("../lib/lucia");
const prisma_1 = require("../lib/prisma");
const authMiddleware = async (req, res, next) => {
    const sessionId = req.cookies[process.env.SESSION_NAME || "E-COMMERCE-cookie"];
    if (!sessionId) {
        res.status(401).json({
            success: false,
            message: "Unauthorised user!",
        });
        return;
    }
    const { session, user } = await (0, lucia_1.lucia)().then((lucia) => lucia.validateSession(sessionId));
    try {
        if (session?.fresh) {
            const sessionCookie = await (0, lucia_1.lucia)().then((lucia) => lucia.createSessionCookie(session.id));
            res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
        if (!session) {
            const sessionCookie = await (0, lucia_1.lucia)().then((lucia) => lucia.createBlankSessionCookie());
            res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
        const dbUser = await prisma_1.prisma.user.findUnique({
            where: {
                id: user?.id
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                avatar: true,
                phone: true,
                addresses: true
            },
        });
        if (!dbUser) {
            res.status(401).json({
                success: false,
                message: "Unauthorised user!",
            });
            return;
        }
        req.body.user = dbUser;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.authMiddleware = authMiddleware;
