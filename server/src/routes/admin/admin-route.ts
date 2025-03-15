import express, { Request, Response } from "express";
import { 
    uploadWebInterfaceMiddleware, 
    updateCategoryImageMiddleware,
    deleteCategoryImageMiddleware,
    updateProductImageMiddleware,
    deleteProductImageMiddleware
} from "../../middleware/handle-file-middleware";
import { 
    createCategory, 
    getAllCategories, 
    updateCategory, 
    deleteCategory
} from "../../controllers/admin/admin-controller-category";
import { 
    createProduct, 
    getAllProducts, 
    updateProduct,
    getTotalPages,
    deleteProduct,
    getProductById
} from "../../controllers/admin/admin-controller-product";

import {
    createEvent,
    deleteEvent,
    getAllEvents,
    updateEvent
} from "../../controllers/admin/admin-controller-event"
import { 
    addAdminEmail,
    getAllAdminEmails 
} from "../../controllers/admin/admin-controller-others";
import {
    deleteOrder,
    getAllOrders,
    verifyOrder
} from "../../controllers/admin/admin-controller-order"
const router = express.Router();

router.put('/update-web-interface', uploadWebInterfaceMiddleware, (_: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Web interface updated successfully"
    })
})
router.post('/create-category', createCategory)
router.get('/get-all-categories', getAllCategories)
router.put('/update-category',updateCategoryImageMiddleware, updateCategory)
router.delete('/delete-category', deleteCategoryImageMiddleware, deleteCategory)

router.post('/create-product', createProduct)
router.get('/get-all-products', getAllProducts)
router.put('/update-product', updateProductImageMiddleware, updateProduct)
router.get('/get-total-pages', getTotalPages)
router.delete('/delete-product', deleteProductImageMiddleware, deleteProduct)
router.get('/get-product-by-id', getProductById)


router.post('/create-event', createEvent)
router.get('/get-all-events', getAllEvents)
router.put('/update-event', updateEvent)
router.delete('/delete-event', deleteEvent)

router.get('/get-all-admin-emails', getAllAdminEmails)
router.put('/add-admin-email', addAdminEmail)

router.get('/get-all-orders', getAllOrders)
router.put('/verify-order', verifyOrder)
router.delete('/delete-order', deleteOrder)

export default router