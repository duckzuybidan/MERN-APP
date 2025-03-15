"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.verifyOrder = exports.getAllOrders = void 0;
const prisma_1 = require("../../lib/prisma");
const getAllOrders = async (_, res) => {
    try {
        const orders = await prisma_1.prisma.cartItem.findMany({
            include: {
                item: true,
                address: true
            }
        });
        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders
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
exports.getAllOrders = getAllOrders;
const verifyOrder = async (req, res) => {
    const { id } = req.body;
    try {
        await prisma_1.prisma.cartItem.update({
            where: {
                id
            },
            data: {
                status: 'VERIFIED'
            }
        });
        const finalOrder = await prisma_1.prisma.cartItem.findUnique({
            where: {
                id
            },
            include: {
                item: true,
                address: true
            }
        });
        res.status(200).json({
            success: true,
            message: "Order verified successfully",
            order: finalOrder
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
exports.verifyOrder = verifyOrder;
const deleteOrder = async (req, res) => {
    const { id } = req.query;
    try {
        const order = await prisma_1.prisma.cartItem.delete({
            where: {
                id: id
            }
        });
        res.status(200).json({
            success: true,
            message: "Order deleted successfully",
            order
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
exports.deleteOrder = deleteOrder;
