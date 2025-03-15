"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCartItem = exports.updateCartItemInfo = exports.getCartByUserId = exports.addToCart = void 0;
const prisma_1 = require("../../lib/prisma");
const addToCart = async (req, res) => {
    const { userId, itemId, quantity, phone, addressId, paymentMethod, price } = req.body;
    try {
        const checkCart = await prisma_1.prisma.cart.findFirst({
            where: {
                userId,
            },
            include: {
                cartItems: true
            }
        });
        if (!checkCart) {
            await prisma_1.prisma.cart.create({
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
            });
        }
        if (checkCart) {
            await prisma_1.prisma.cartItem.create({
                data: {
                    cartId: checkCart.id,
                    itemId,
                    quantity,
                    phone,
                    addressId,
                    paymentMethod,
                    price
                }
            });
        }
        const finalCart = await prisma_1.prisma.cart.findFirst({
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
        });
        res.status(200).json({
            success: true,
            message: 'Product variant added to cart successfully',
            cart: finalCart
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.addToCart = addToCart;
const getCartByUserId = async (req, res) => {
    const { userId } = req.query;
    try {
        const cart = await prisma_1.prisma.cart.findUnique({
            where: {
                userId: userId
            },
            include: {
                cartItems: {
                    include: {
                        item: true,
                        address: true,
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: 'Cart fetched successfully',
            cart
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getCartByUserId = getCartByUserId;
const updateCartItemInfo = async (req, res) => {
    const { cartItemId, phone, addressId, paymentMethod } = req.body;
    try {
        await prisma_1.prisma.cartItem.update({
            where: {
                id: cartItemId
            },
            data: {
                phone,
                addressId,
                paymentMethod
            }
        });
        const finalCartItem = await prisma_1.prisma.cartItem.findFirst({
            where: {
                id: cartItemId
            },
            include: {
                item: true,
                address: true
            }
        });
        res.status(200).json({
            success: true,
            message: 'Cart info updated successfully',
            cartItem: finalCartItem
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateCartItemInfo = updateCartItemInfo;
const deleteCartItem = async (req, res) => {
    const { id } = req.query;
    try {
        const cartItem = await prisma_1.prisma.cartItem.delete({
            where: {
                id: id
            }
        });
        res.status(200).json({
            success: true,
            message: 'Cart item deleted successfully',
            cartItem
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.deleteCartItem = deleteCartItem;
