import { Request, Response } from "express"
import { prisma } from '../../lib/prisma'

const addToCart = async (req: Request, res: Response) => {
    const { userId, itemId, quantity, phone, addressId, paymentMethod, price } = req.body
    try {
        const checkCart = await prisma.cart.findFirst({
            where: {
                userId,
            },
            include: {
                cartItems: true
            }
        })
        if(!checkCart) {
            await prisma.cart.create({
                data: {
                    userId,
                    cartItems: {
                        create: {
                            itemId,
                            quantity,
                            phone,
                            addressId,
                            paymentMethod,
                            price
                        }
                    }
                }
            })
        }
        if(checkCart) {
            await prisma.cartItem.create({
                data: {
                    cartId: checkCart.id,
                    itemId,
                    quantity,
                    phone,
                    addressId,
                    paymentMethod,
                    price
                }
            })
        }
        const finalCart = await prisma.cart.findFirst({
            where: {
                userId,
            },
            include: {
                cartItems: {
                    include: {
                        item: true,
                        address: true
                    }
                }
            }
        })
        res.status(200).json({
            success: true,
            message: 'Product variant added to cart successfully',
            cart: finalCart
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
const getCartByUserId = async (req: Request, res: Response) => {
    const { userId } = req.query
    try {
        const cart = await prisma.cart.findUnique({
            where: {
                userId: userId as string
            },
            include: {
                cartItems: {
                    include: {
                        item: true,
                        address: true,
                    }
                }
            }
        })
        res.status(200).json({
            success: true,
            message: 'Cart fetched successfully',
            cart
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

const updateCartItemInfo = async (req: Request, res: Response) => {
    const { cartItemId, phone, addressId, paymentMethod } = req.body
    try {
        await prisma.cartItem.update({
            where: {
                id: cartItemId
            },
            data: {
                phone,
                addressId,
                paymentMethod
            }
        })
        const finalCartItem = await prisma.cartItem.findFirst({
            where: {
                id: cartItemId
            },
            include: {
                item: true,
                address: true
            }
        })
        res.status(200).json({
            success: true,
            message: 'Cart info updated successfully',
            cartItem: finalCartItem
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
const deleteCartItem = async (req: Request, res: Response) => {
    const {id} = req.query
    try {
        const cartItem = await prisma.cartItem.delete({
            where: {
                id: id as string
            }
        })
        res.status(200).json({
            success: true,
            message: 'Cart item deleted successfully',
            cartItem
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
export { 
    addToCart,
    getCartByUserId,
    updateCartItemInfo,
    deleteCartItem
}