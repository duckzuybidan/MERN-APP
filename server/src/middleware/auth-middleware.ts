import { NextFunction, Request, Response } from "express";
import { lucia } from '../lib/lucia';
import {prisma} from '../lib/prisma'
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.cookies[process.env.SESSION_NAME || "E-COMMERCE-cookie"];
    if(!sessionId) {
        res.status(401).json({
            success: false,
            message: "Unauthorised user!",
          });
        return
    }
    const { session, user} = await lucia().then((lucia) => lucia.validateSession(sessionId));
    try {
        if(session?.fresh) {
            const sessionCookie = await lucia().then((lucia) => lucia.createSessionCookie(session.id));
            res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
        if(!session){
            const sessionCookie = await lucia().then((lucia) => lucia.createBlankSessionCookie());
            res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
        const dbUser = await prisma.user.findUnique({
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
        })
        if(!dbUser) {
            res.status(401).json({
                success: false,
                message: "Unauthorised user!",
              });
            return
        }
        req.body.user = dbUser
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
  };
export {
    authMiddleware
}