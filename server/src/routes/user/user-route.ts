import express from "express";
import {
    addToCart,
    deleteCartItem,
    getCartByUserId,
    updateCartItemInfo,
} from '../../controllers/user'

const router = express.Router();

router.post('/add-to-cart', addToCart)
router.get('/get-cart-by-user-id', getCartByUserId)
router.put('/update-cart-item-info', updateCartItemInfo)
router.delete('/delete-cart-item', deleteCartItem)
export default router