"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../../controllers/user");
const router = express_1.default.Router();
router.post('/add-to-cart', user_1.addToCart);
router.get('/get-cart-by-user-id', user_1.getCartByUserId);
router.put('/update-cart-item-info', user_1.updateCartItemInfo);
router.delete('/delete-cart-item', user_1.deleteCartItem);
exports.default = router;
