"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.deleteProduct = exports.getTotalPages = exports.updateProduct = exports.getAllProducts = exports.createProduct = void 0;
const prisma_1 = require("../../lib/prisma");
const cloudinary_1 = require("../../lib/cloudinary");
const utils_1 = require("../../utils");
const createProduct = async (req, res) => {
    const { title, description, displayImages, categoryId, variants, eventIds } = req.body;
    try {
        const variantsWithoutImage = variants.map((variant, index) => {
            return {
                ...variant,
                image: `${index}`,
                id: undefined,
                productId: undefined,
                discountExpiry: variant.discountExpiry ? new Date(variant.discountExpiry) : null,
                discountPrice: variant.discountPrice
            };
        });
        const product = await prisma_1.prisma.product.create({
            data: {
                title,
                description,
                displayImages: [],
                events: {
                    connect: eventIds.map((eventId) => ({ id: eventId })),
                },
                category: {
                    connect: {
                        id: categoryId
                    }
                },
                variants: {
                    create: variantsWithoutImage
                },
            }
        });
        const uploadDisplayImagesPromises = displayImages.map((image, index) => {
            return new Promise((resolve, reject) => {
                const imageBuffer = (0, utils_1.decodeBase64Image)(image);
                if (!imageBuffer) {
                    resolve(null);
                    return;
                }
                cloudinary_1.cloudinary.uploader.upload_stream({
                    folder: 'product',
                    public_id: `${product.id}-${index}`,
                    resource_type: 'image',
                    overwrite: true
                }, async (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                        return;
                    }
                    const url = result?.secure_url;
                    if (url) {
                        try {
                            await prisma_1.prisma.product.update({
                                where: { id: product.id },
                                data: {
                                    displayImages: { push: url },
                                },
                            });
                            resolve(url);
                        }
                        catch (updateError) {
                            console.error('Database update error:', updateError);
                            reject(updateError);
                        }
                    }
                    else {
                        resolve(null);
                    }
                }).end(imageBuffer.buffer);
            });
        });
        const uploadedDisplayImageUrls = await Promise.all(uploadDisplayImagesPromises);
        const successfulUploads = uploadedDisplayImageUrls.filter(url => url !== null);
        if (successfulUploads.length === 0) {
            res.status(500).json({
                success: false,
                message: 'Images were not successfully uploaded.',
            });
            return;
        }
        const oldVariantsData = await prisma_1.prisma.productVariant.findMany({
            where: {
                productId: product.id
            }
        });
        const uploadVariantImagesPromises = oldVariantsData.map((variant) => {
            return new Promise((resolve, reject) => {
                const imageBuffer = (0, utils_1.decodeBase64Image)(variants[parseInt(variant.image)].image);
                if (!imageBuffer) {
                    resolve(null);
                    return;
                }
                cloudinary_1.cloudinary.uploader.upload_stream({
                    folder: 'product-variant',
                    public_id: variant.id,
                    resource_type: 'image',
                    overwrite: true
                }, async (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                        return;
                    }
                    const url = result?.secure_url;
                    if (url) {
                        try {
                            await prisma_1.prisma.productVariant.update({
                                where: { id: variant.id },
                                data: {
                                    image: url,
                                },
                            });
                            resolve(url);
                        }
                        catch (updateError) {
                            console.error('Database update error:', updateError);
                            reject(updateError);
                        }
                    }
                    else {
                        resolve(null);
                    }
                }).end(imageBuffer.buffer);
            });
        });
        const uploadedVariantImageUrls = await Promise.all(uploadVariantImagesPromises);
        const successfulVariantUploads = uploadedVariantImageUrls.filter(url => url !== null);
        if (successfulVariantUploads.length === 0) {
            res.status(500).json({
                success: false,
                message: 'Images were not successfully uploaded.',
            });
            return;
        }
        const finalProduct = await prisma_1.prisma.product.findUnique({
            where: {
                id: product.id
            },
            include: {
                category: true,
                variants: true,
                events: true,
            }
        });
        res.status(200).json({
            success: true,
            message: "Product created successfully",
            product: finalProduct
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
exports.createProduct = createProduct;
const getAllProducts = async (req, res) => {
    const { page, limit, query, category, price_order, price_min, price_max, updateAt_order } = req.query;
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: {
                title: {
                    contains: query?.toString().toLowerCase().trim(),
                    mode: 'insensitive'
                },
                category: {
                    name: {
                        contains: category?.toString().toLowerCase().trim(),
                        mode: 'insensitive'
                    }
                },
            },
            include: {
                category: true,
                variants: true,
                events: true,
            },
            orderBy: {
                updatedAt: updateAt_order === 'asc' ? 'asc' : 'desc',
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });
        const formattedProducts = products.filter((product) => {
            const minPrice = Math.min(...product.variants.map((variant) => variant.price));
            const maxPrice = Math.max(...product.variants.map((variant) => variant.price));
            return !(Number(price_min) > maxPrice || Number(price_max) < minPrice);
        }).sort((a, b) => {
            if (price_order === 'asc') {
                const minPriceA = Math.min(...a.variants.map((variant) => variant.price));
                const minPriceB = Math.min(...b.variants.map((variant) => variant.price));
                return Number(minPriceA) - Number(minPriceB);
            }
            else if (price_order === 'desc') {
                const maxPriceA = Math.max(...a.variants.map((variant) => variant.price));
                const maxPriceB = Math.max(...b.variants.map((variant) => variant.price));
                return Number(maxPriceB) - Number(maxPriceA);
            }
            return 0;
        });
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products: {
                page: Number(page),
                query: query,
                products: formattedProducts,
                filterCategory: category,
                priceOrder: price_order,
                priceMin: Number(price_min),
                priceMax: Number(price_max),
                updatedAtOrder: updateAt_order
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.getAllProducts = getAllProducts;
const getTotalPages = async (req, res) => {
    const { limit } = req.query;
    try {
        const count = await prisma_1.prisma.product.count();
        const totalPages = Math.ceil(count / Number(limit));
        res.status(200).json({
            success: true,
            message: "Total pages fetched successfully",
            totalPages
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.getTotalPages = getTotalPages;
const updateProduct = async (req, res) => {
    const { id, title, description, displayImages, categoryId, variants, eventIds } = req.body;
    try {
        const variantsToUpdate = variants.filter((variant) => variant.id);
        const variantsToCreate = variants.filter((variant) => !variant.id);
        const updateOperations = variantsToUpdate.map((variant) => prisma_1.prisma.productVariant.update({
            where: { id: variant.id },
            data: {
                name: variant.name,
                price: variant.price,
                image: variant.image,
                inStock: variant.inStock,
                discountExpiry: variant.discountExpiry ? new Date(variant.discountExpiry) : null,
                discountPrice: variant.discountPrice || null,
            },
        }));
        const createOperations = variantsToCreate.map((variant) => prisma_1.prisma.productVariant.create({
            data: {
                productId: id,
                name: variant.name,
                price: variant.price,
                image: variant.image,
                inStock: variant.inStock,
                discountExpiry: variant.discountExpiry ? new Date(variant.discountExpiry) : null,
                discountPrice: variant.discountPrice || null,
            },
        }));
        const oldVariantsData = await prisma_1.prisma.productVariant.findMany({
            where: {
                productId: id
            }
        });
        const newVariantsData = await prisma_1.prisma.$transaction([
            prisma_1.prisma.product.update({
                where: { id },
                data: {
                    title,
                    description,
                    displayImages,
                    category: {
                        connect: {
                            id: categoryId
                        },
                    },
                    events: {
                        set: [...eventIds.map((eventId) => ({ id: eventId }))]
                    },
                    updatedAt: new Date(),
                },
            }),
            ...updateOperations,
            ...createOperations,
        ]).then((data) => {
            return data.slice(1);
        });
        const deleteVariantImagesPromises = oldVariantsData.map((variant) => {
            return new Promise((resolve, reject) => {
                if (newVariantsData.map((v) => v.id).includes(variant.id)) {
                    resolve(null);
                    return;
                }
                else if (!newVariantsData.map((v) => v.id).includes(variant.id)) {
                    cloudinary_1.cloudinary.uploader.destroy(`product-variant/${variant.id}`, async (error) => {
                        if (error) {
                            console.error('Cloudinary delete error:', error);
                            reject(error);
                            return;
                        }
                        try {
                            await prisma_1.prisma.productVariant.delete({
                                where: { id: variant.id },
                            });
                            resolve(null);
                        }
                        catch (deleteError) {
                            console.error('Database delete error:', deleteError);
                            reject(deleteError);
                        }
                    });
                    return;
                }
            });
        });
        const updateVariantImagesPromises = newVariantsData.map((variant) => {
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
                    overwrite: true
                }, async (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                        return;
                    }
                    const url = result?.secure_url;
                    if (url) {
                        try {
                            await prisma_1.prisma.productVariant.update({
                                where: { id: variant.id },
                                data: {
                                    image: url,
                                },
                            });
                            resolve(url);
                        }
                        catch (updateError) {
                            console.error('Database update error:', updateError);
                            reject(updateError);
                        }
                    }
                    else {
                        resolve(null);
                    }
                }).end(imageBuffer.buffer);
            });
        });
        await Promise.all(deleteVariantImagesPromises);
        await Promise.all(updateVariantImagesPromises);
        const finalProduct = await prisma_1.prisma.product.findUnique({
            where: {
                id
            },
            include: {
                category: true,
                variants: true,
                events: true,
            }
        });
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: finalProduct
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
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    const { id } = req.query;
    try {
        await prisma_1.prisma.product.update({
            where: {
                id: id
            },
            data: {
                events: {
                    set: []
                }
            }
        });
        const product = await prisma_1.prisma.product.delete({
            where: {
                id: id
            },
        });
        await prisma_1.prisma.productVariant.deleteMany({
            where: {
                productId: id
            }
        });
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product
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
exports.deleteProduct = deleteProduct;
const getProductById = async (req, res) => {
    const { id } = req.query;
    try {
        const product = await prisma_1.prisma.product.findUnique({
            where: {
                id: id
            },
            include: {
                category: true,
                events: true,
                variants: true
            }
        });
        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            product
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
exports.getProductById = getProductById;
