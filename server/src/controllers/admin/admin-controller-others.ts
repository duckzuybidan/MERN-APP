import { Request, Response } from "express"
import { prisma } from '../../lib/prisma'
const getAllAdminEmails = async (_: Request, res: Response) => {
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: 'ADMIN'
            },
            select: {
                email: true
            }
        });
        res.status(200).json({
            success: true,
            message: "Admins fetched successfully!",
            emails : admins.map(admin => admin.email)
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const addAdminEmail = async (req: Request, res: Response) => {
    const {email} = req.body
    try {
        const checkUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if(!checkUser){
            res.status(404).json({
                success: false,
                message: "User not found"
            })
            return
        }
        if(checkUser.role === 'ADMIN'){
            res.status(400).json({
                success: false,
                message: "User is already an admin"
            })
            return
        }
        await prisma.user.update({
            where: {
                id: checkUser.id
            },
            data: {
                role: 'ADMIN'
            }
        })
        res.status(200).json({
            success: true,
            message: "Admin added successfully",
            email
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export { 
    getAllAdminEmails,
    addAdminEmail
}