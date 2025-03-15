"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = void 0;
const prisma_1 = require("../../lib/prisma");
const cloudinary_1 = require("../../lib/cloudinary");
const utils_1 = require("../../utils");
const getAllCategories = async (_, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            include: {
                children: true
            }
        });
        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            categories
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
exports.getAllCategories = getAllCategories;
const createCategory = async (req, res) => {
    const { image, name, parentId } = req.body;
    try {
        if (!name) {
            res.status(400).json({
                success: false,
                message: "Missing name"
            });
            return;
        }
        const category = await prisma_1.prisma.category.create({
            data: {
                image,
                name,
                parentId: parentId || null
            }
        });
        const imageBuffer = (0, utils_1.decodeBase64Image)(image);
        if (!imageBuffer) {
            res.status(200).json({
                success: true,
                message: `${name} has added to categories`,
                category
            });
            return;
        }
        cloudinary_1.cloudinary.uploader.upload_stream({
            folder: 'category',
            public_id: `${category.id}`,
            resource_type: 'image',
            overwrite: true
        }, async (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Something went wrong, please try again!',
                });
                return;
            }
            const url = result?.secure_url;
            if (url) {
                try {
                    await prisma_1.prisma.category.update({
                        where: { id: category.id },
                        data: { image: url },
                    });
                }
                catch (updateError) {
                    console.error('Database update error:', updateError);
                    res.status(500).json({
                        success: false,
                        message: 'Something went wrong, please try again!',
                    });
                    return;
                }
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Something went wrong, please try again!',
                });
                return;
            }
        }).end(imageBuffer.buffer);
        res.status(200).json({
            success: true,
            message: `${name} has added to categories`,
            category
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
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    const { id, image, name } = req.body;
    try {
        if (!id || !name) {
            res.status(400).json({
                success: false,
                message: "Missing id or name"
            });
            return;
        }
        const category = await prisma_1.prisma.category.update({
            where: {
                id
            },
            data: {
                image,
                name,
            },
            include: {
                children: true
            }
        });
        res.status(200).json({
            success: true,
            message: `${name} has updated successfully`,
            category
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
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    const { id } = req.query;
    try {
        const category = await prisma_1.prisma.category.delete({
            where: {
                id: id
            }
        });
        res.status(200).json({
            success: true,
            message: "Deleted successfully",
            category
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
exports.deleteCategory = deleteCategory;
