import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"



const getAllOrders = async (_: Request, res: Response) => {
    try {
        const orders = await prisma.cartItem.findMany({
            include: {
                item: true,
                address: true
            }
        })
        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
     
}
const verifyOrder = async (req: Request, res: Response) => {
    const { id } = req.body
    try {
        await prisma.cartItem.update({
            where: {
                id
            },
            data: {
                status: 'VERIFIED'
            }
        })
        const finalOrder = await prisma.cartItem.findUnique({
            where: {
                id
            },
            include: {
                item: true,
                address: true
            }
        })
        res.status(200).json({
            success: true,
            message: "Order verified successfully",
            order: finalOrder
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
const deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.query
    try {
        const order = await prisma.cartItem.delete({
            where: {
                id: id as string
            }
        })
        res.status(200).json({
            success: true,
            message: "Order deleted successfully",
            order
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
    getAllOrders,
    verifyOrder,
    deleteOrder
}