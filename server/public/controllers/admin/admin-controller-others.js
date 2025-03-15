"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAdminEmail = exports.getAllAdminEmails = void 0;
const prisma_1 = require("../../lib/prisma");
const getAllAdminEmails = async (_, res) => {
    try {
        const admins = await prisma_1.prisma.user.findMany({
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
            emails: admins.map(admin => admin.email)
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.getAllAdminEmails = getAllAdminEmails;
const addAdminEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const checkUser = await prisma_1.prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!checkUser) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }
        if (checkUser.role === 'ADMIN') {
            res.status(400).json({
                success: false,
                message: "User is already an admin"
            });
            return;
        }
        await prisma_1.prisma.user.update({
            where: {
                id: checkUser.id
            },
            data: {
                role: 'ADMIN'
            }
        });
        res.status(200).json({
            success: true,
            message: "Admin added successfully",
            email
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.addAdminEmail = addAdminEmail;
