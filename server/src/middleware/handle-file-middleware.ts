import{ NextFunction, Request, Response } from "express"
import { cloudinary } from "../lib/cloudinary"
import { decodeBase64Image } from "../utils"
import {prisma} from '../lib/prisma'
const uploadAvatarMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const {email, avatar } = req.body
    try {
        const imageBuffer = decodeBase64Image(avatar)
        if(!imageBuffer) {
            return next()
        }
        let url: string | undefined = ''
        cloudinary.uploader
        .upload_stream({folder: 'avatar', public_id: email, resource_type: 'image', overwrite: true }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                res.status(500).json({ 
                    success: false,
                    message: 'Something went wrong, please try again!',
                });
            }
            url = result?.secure_url
            req.body.avatar = url
            next()
        })
        .end(imageBuffer.buffer);
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        })
    }
}
const uploadWebInterfaceMiddleware = async (req: Request, res: Response, next: NextFunction) => {  
    try {
    const jsonData = JSON.stringify(req.body);
    cloudinary.uploader.upload_stream({ public_id: 'web', format: 'json', resource_type: 'raw', overwrite: true}, (error) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: 'Something went wrong, please try again!',
            });
            return
        }
        next()
    }).end(jsonData);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        }) 
    }
}
const updateCategoryImageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const {id, image, parentId} = req.body
    try {
        if(parentId){
            return next()
        }
        const imageBuffer = decodeBase64Image(image)
        if(!imageBuffer) {
            return next()
        }
        let url: string | undefined = ''
        cloudinary.uploader
        .upload_stream({folder: 'category', public_id: id, resource_type: 'image', overwrite: true }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                res.status(500).json({ 
                    success: false,
                    message: 'Something went wrong, please try again!',
                });
            }
            url = result?.secure_url
            req.body.image = url
            next()
        })
        .end(imageBuffer.buffer);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        })
    }
}
const deleteCategoryImageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.query
    try {
        const category = await prisma.category.findUnique({
            where: {
                id: id as string
            }
        })
        if(!category) {
            res.status(404).json({success: false, message: "Something went wrong, please try again!"})
            return
        }
        if(category.parentId) {
            return next()
        }
        cloudinary.uploader.destroy(`category/${id}`, (error: any) => {
            if (error) {
              console.error('Error deleting the file:', error);
              res.status(500).json({
                success: false,
                message: 'Something went wrong, please try again!',
              })
            }
        });
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        })
    }
}
const updateProductImageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { id, displayImages, variants} = req.body;
    try {
        for (let index = 0; index < displayImages.length; index++) {
            const image = displayImages[index];
            await new Promise((resolve, reject) => {
                const imageBuffer = decodeBase64Image(image);
                if (!imageBuffer) {
                    const image_public_id = image.split('/').pop()?.split('.')[0];
                    if (image_public_id !== `${id}-${index}`) {
                        cloudinary.uploader.rename(
                            `product/${image_public_id}`,
                            `product/${id}-${index}`,
                            { overwrite: true },
                            (error, result) => {
                                if (error) {
                                    console.error('Error renaming the file:', error);
                                    reject(error);
                                    return;
                                }
                                const url = result?.secure_url;
                                if (url) {
                                    displayImages[index] = url;
                                    resolve(url);
                                } else {
                                    resolve(null);
                                }
                            }
                        );
                    } else {
                        resolve(null);
                    }
                    return;
                }
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'product',
                        public_id: `${id}-${index}`,
                        resource_type: 'image',
                        overwrite: true,
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                            return;
                        }
                        const url = result?.secure_url;
                        if (url) {
                            displayImages[index] = url;
                            resolve(url);
                        } else {
                            resolve(null);
                        }
                    }
                ).end(imageBuffer.buffer);
            });
        }
        const updateProductVariantImagePromises = variants.filter((variant: any) => variant.id).map((variant: any, index: number) => {
            return new Promise((resolve, reject) => {
                const imageBuffer = decodeBase64Image(variant.image);
                if (!imageBuffer) {
                    resolve(null);
                    return;
                }
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'product-variant',
                        public_id: variant.id,
                        resource_type: 'image',
                        overwrite: true,
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                            return;
                        }
                        const url = result?.secure_url;
                        if (url) {
                            variants[index].image = url;
                            resolve(url);
                        } else {
                            resolve(null);
                        }
                    }
                ).end(imageBuffer.buffer);
            });
        })
        await Promise.all(updateProductVariantImagePromises);
        req.body.variants = variants;
        req.body.displayImages = displayImages;
        next();
    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        });
    }
};
const deleteProductImageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.query
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: id as string
            },
            include: {
                variants: true
            }
        })
        if(!product) {
            res.status(404).json({success: false, message: "Something went wrong, please try again!"})
            return
        }
        const {displayImages, variants} = product
        for (let index = 0; index < displayImages.length; index++) {
            const image = displayImages[index];
            const image_public_id = image.split('/').pop()?.split('.')[0];
            cloudinary.uploader.destroy(`product/${image_public_id}`, (error: any) => { 
                if (error) {
                    console.error('Error deleting the file:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Something went wrong, please try again!',
                    })
                }
            });
        }
        for (let index = 0; index < product.variants.length; index++) {
            const variant = variants[index];
            cloudinary.uploader.destroy(`product-variant/${variant.id}`, (error: any) => {
                if (error) {
                    console.error('Error deleting the file:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Something went wrong, please try again!',
                    })
                }
            })
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again!',
        })
    }
}
export { 
    uploadAvatarMiddleware, 
    uploadWebInterfaceMiddleware, 
    updateCategoryImageMiddleware,
    deleteCategoryImageMiddleware,
    updateProductImageMiddleware,
    deleteProductImageMiddleware
}