import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"
import { cloudinary } from "../../lib/cloudinary"
import { decodeBase64Image } from "../../utils"
const getAllCategories = async (_: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany(
            {
                include: {
                    children: true
                }
            }
        )
        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            categories
            
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
const createCategory = async (req: Request, res: Response) => {
    const {image, name, parentId} = req.body
    try {
        if(!name){
            res.status(400).json({
                success: false,
                message: "Missing name"
            })
            return
        }
        const category = await prisma.category.create({
            data: {
                image,
                name,
                parentId: parentId || null
            }
        })
        const imageBuffer = decodeBase64Image(image);
        if (!imageBuffer) {
            res.status(200).json({
                success: true,
                message: `${name} has added to categories`,
                category
            })
            return;
        }
        cloudinary.uploader.upload_stream(
        { 
            folder: 'category', 
            public_id: `${category.id}`, 
            resource_type: 'image', 
            overwrite: true 
        },
        async (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Something went wrong, please try again!',
                })
                return;
            }
            const url = result?.secure_url;
            if (url) {
                try {
                    await prisma.category.update({
                        where: { id: category.id },
                        data: { image: url },
                    });
                } catch (updateError) {
                    console.error('Database update error:', updateError);
                    res.status(500).json({
                        success: false,
                        message: 'Something went wrong, please try again!',
                    })
                    return;
                }
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Something went wrong, please try again!',
                })
                return;
            }
        }
        ).end(imageBuffer.buffer);
        res.status(200).json({
            success: true,
            message: `${name} has added to categories`,
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const updateCategory = async (req: Request, res: Response) => {
    const {id, image, name} = req.body
    try {
        if(!id || !name){
            res.status(400).json({
                success: false,
                message: "Missing id or name"
            })
            return
        }
        const category = await prisma.category.update({
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
        })
        res.status(200).json({
            success: true,
            message: `${name} has updated successfully`,
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
    
}
const deleteCategory = async (req: Request, res: Response) => {
    const {id} = req.query
    try {
        const category = await prisma.category.delete({
            where: {
                id : id as string
            }
        })
        res.status(200).json({
            success: true,
            message: "Deleted successfully",
            category
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
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
}

