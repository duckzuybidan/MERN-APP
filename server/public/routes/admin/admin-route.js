"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handle_file_middleware_1 = require("../../middleware/handle-file-middleware");
const admin_controller_category_1 = require("../../controllers/admin/admin-controller-category");
const admin_controller_product_1 = require("../../controllers/admin/admin-controller-product");
const admin_controller_event_1 = require("../../controllers/admin/admin-controller-event");
const admin_controller_others_1 = require("../../controllers/admin/admin-controller-others");
const admin_controller_order_1 = require("../../controllers/admin/admin-controller-order");
const router = express_1.default.Router();
router.put('/update-web-interface', handle_file_middleware_1.uploadWebInterfaceMiddleware, (_, res) => {
    res.status(200).json({
        success: true,
        message: "Web interface updated successfully"
    });
});
router.post('/create-category', admin_controller_category_1.createCategory);
router.get('/get-all-categories', admin_controller_category_1.getAllCategories);
router.put('/update-category', handle_file_middleware_1.updateCategoryImageMiddleware, admin_controller_category_1.updateCategory);
router.delete('/delete-category', handle_file_middleware_1.deleteCategoryImageMiddleware, admin_controller_category_1.deleteCategory);
router.post('/create-product', admin_controller_product_1.createProduct);
router.get('/get-all-products', admin_controller_product_1.getAllProducts);
router.put('/update-product', handle_file_middleware_1.updateProductImageMiddleware, admin_controller_product_1.updateProduct);
router.get('/get-total-pages', admin_controller_product_1.getTotalPages);
router.delete('/delete-product', handle_file_middleware_1.deleteProductImageMiddleware, admin_controller_product_1.deleteProduct);
router.get('/get-product-by-id', admin_controller_product_1.getProductById);
router.post('/create-event', admin_controller_event_1.createEvent);
router.get('/get-all-events', admin_controller_event_1.getAllEvents);
router.put('/update-event', admin_controller_event_1.updateEvent);
router.delete('/delete-event', admin_controller_event_1.deleteEvent);
router.get('/get-all-admin-emails', admin_controller_others_1.getAllAdminEmails);
router.put('/add-admin-email', admin_controller_others_1.addAdminEmail);
router.get('/get-all-orders', admin_controller_order_1.getAllOrders);
router.put('/verify-order', admin_controller_order_1.verifyOrder);
router.delete('/delete-order', admin_controller_order_1.deleteOrder);
exports.default = router;
