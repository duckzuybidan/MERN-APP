"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductImageMiddleware = exports.updateProductImageMiddleware = exports.deleteCategoryImageMiddleware = exports.updateCategoryImageMiddleware = exports.uploadWebInterfaceMiddleware = exports.uploadAvatarMiddleware = void 0;
const cloudinary_1 = require("../lib/cloudinary");
const utils_1 = require("../utils");
const prisma_1 = require("../lib/prisma");
const uploadAvatarMiddleware = async (req, res, next) => {
    const { email, avatar } = req.body;
    try {
        const imageBuffer = (0, utils_1.decodeBase64Image)(avatar);
        if (!imageBuffer) {
            return next();
        }
        let url = '';
        cloudinary_1.cloudinary.uploader
            .upload_stream({ folder: 'avatar', public_id: email, resource_type: 'image', overwrite: true }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Something went wrong, please try again!',
                });
            }
            url = result?.secure_url;
            req.body.avatar = url;
            next();
        })
            .end(imageBuffer.buffer);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        });
    }
};
exports.uploadAvatarMiddleware = uploadAvatarMiddleware;
const uploadWebInterfaceMiddleware = async (req, res, next) => {
    try {
        const jsonData = JSON.stringify(req.body);
        cloudinary_1.cloudinary.uploader.upload_stream({ public_id: 'web', format: 'json', resource_type: 'raw', overwrite: true }, (error) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    message: 'Something went wrong, please try again!',
                });
                return;
            }
            next();
        }).end(jsonData);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        });
    }
};
exports.uploadWebInterfaceMiddleware = uploadWebInterfaceMiddleware;
const updateCategoryImageMiddleware = async (req, res, next) => {
    const { id, image, parentId } = req.body;
    try {
        if (parentId) {
            return next();
        }
        const imageBuffer = (0, utils_1.decodeBase64Image)(image);
        if (!imageBuffer) {
            return next();
        }
        let url = '';
        cloudinary_1.cloudinary.uploader
            .upload_stream({ folder: 'category', public_id: id, resource_type: 'image', overwrite: true }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Something went wrong, please try again!',
                });
            }
            url = result?.secure_url;
            req.body.image = url;
            next();
        })
            .end(imageBuffer.buffer);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        });
    }
};
exports.updateCategoryImageMiddleware = updateCategoryImageMiddleware;
const deleteCategoryImageMiddleware = async (req, res, next) => {
    const { id } = req.query;
    try {
        const category = await prisma_1.prisma.category.findUnique({
            where: {
                id: id
            }
        });
        if (!category) {
            res.status(404).json({ success: false, message: "Something went wrong, please try again!" });
            return;
        }
        if (category.parentId) {
            return next();
        }
        cloudinary_1.cloudinary.uploader.destroy(`category/${id}`, (error) => {
            if (error) {
                console.error('Error deleting the file:', error);
                res.status(500).json({
                    success: false,
                    message: 'Something went wrong, please try again!',
                });
            }
        });
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        });
    }
};
exports.deleteCategoryImageMiddleware = deleteCategoryImageMiddleware;
const updateProductImageMiddleware = async (req, res, next) => {
    const { id, displayImages, variants } = req.body;
    try {
        for (let index = 0; index < displayImages.length; index++) {
            const image = displayImages[index];
            await new Promise((resolve, reject) => {
                const imageBuffer = (0, utils_1.decodeBase64Image)(image);
                if (!imageBuffer) {
                    const image_public_id = image.split('/').pop()?.split('.')[0];
                    if (image_public_id !== `${id}-${index}`) {
                        cloudinary_1.cloudinary.uploader.rename(`product/${image_public_id}`, `product/${id}-${index}`, { overwrite: true }, (error, result) => {
                            if (error) {
                                console.error('Error renaming the file:', error);
                                reject(error);
                                return;
                            }
                            const url = result?.secure_url;
                            if (url) {
                                displayImages[index] = url;
                                resolve(url);
                            }
                            else {
                                resolve(null);
                            }
                        });
                    }
                    else {
                        resolve(null);
                    }
                    return;
                }
                cloudinary_1.cloudinary.uploader.upload_stream({
                    folder: 'product',
                    public_id: `${id}-${index}`,
                    resource_type: 'image',
                    overwrite: true,
                }, (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                        return;
                    }
                    const url = result?.secure_url;
                    if (url) {
                        displayImages[index] = url;
                        resolve(url);
                    }
                    else {
                        resolve(null);
                    }
                }).end(imageBuffer.buffer);
            });
        }
        const updateProductVariantImagePromises = variants.filter((variant) => variant.id).map((variant, index) => {
            return new Promise((resolve, reject) => {
                const imageBuffer = (0, utils_1.decodeBase64Image)(variant.image);
                if (!imageBuffer) {
                    resolve(null);
                    return;
                }
                cloudinary_1.cloudinary.uploader.upload_stream({
                    folder: 'product-variant',
                    public_id: variant.id,
                    resource_type: 'image',
                    overwrite: true,
                }, (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                        return;
                    }
                    const url = result?.secure_url;
                    if (url) {
                        variants[index].image = url;
                        resolve(url);
                    }
                    else {
                        resolve(null);
                    }
                }).end(imageBuffer.buffer);
            });
        });
        await Promise.all(updateProductVariantImagePromises);
        req.body.variants = variants;
        req.body.displayImages = displayImages;
        next();
    }
    catch (error) {
        console.error('Error processing images:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        });
    }
};
exports.updateProductImageMiddleware = updateProductImageMiddleware;
const deleteProductImageMiddleware = async (req, res, next) => {
    const { id } = req.query;
    try {
        const product = await prisma_1.prisma.product.findUnique({
            where: {
                id: id
            },
            include: {
                variants: true
            }
        });
        if (!product) {
            res.status(404).json({ success: false, message: "Something went wrong, please try again!" });
            return;
        }
        const { displayImages, variants } = product;
        for (let index = 0; index < displayImages.length; index++) {
            const image = displayImages[index];
            const image_public_id = image.split('/').pop()?.split('.')[0];
            cloudinary_1.cloudinary.uploader.destroy(`product/${image_public_id}`, (error) => {
                if (error) {
                    console.error('Error deleting the file:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Something went wrong, please try again!',
                    });
                }
            });
        }
        for (let index = 0; index < product.variants.length; index++) {
            const variant = variants[index];
            cloudinary_1.cloudinary.uploader.destroy(`product-variant/${variant.id}`, (error) => {
                if (error) {
                    console.error('Error deleting the file:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Something went wrong, please try again!',
                    });
                }
            });
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        });
    }
};
exports.deleteProductImageMiddleware = deleteProductImageMiddleware;
