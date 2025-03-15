import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"
import { cloudinary } from "../../lib/cloudinary"
import { decodeBase64Image } from "../../utils"
const createProduct = async (req: Request, res: Response) => {
    const {title, description, displayImages, categoryId, variants, eventIds} = req.body
    try {
      const variantsWithoutImage = variants.map((variant: any, index: number) => {
        return {
          ...variant,
          image: `${index}`,
          id: undefined,
          productId: undefined,
          discountExpiry: variant.discountExpiry ? new Date(variant.discountExpiry) : null,
          discountPrice: variant.discountPrice
        }
      })
      const product = await prisma.product.create({
          data: {
              title,
              description,
              displayImages: [],
              events: {
                connect: eventIds.map((eventId: string) => ({ id: eventId })),
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
      })
      const uploadDisplayImagesPromises = displayImages.map((image: string, index: number) => {
        return new Promise((resolve, reject) => {
          const imageBuffer = decodeBase64Image(image);
          if (!imageBuffer) {
            resolve(null);
            return;
          }
          cloudinary.uploader.upload_stream(
            { 
              folder: 'product', 
              public_id: `${product.id}-${index}`, 
              resource_type: 'image', 
              overwrite: true 
            },
            async (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
                return;
              }
  
              const url = result?.secure_url;
              if (url) {
                try {
                  await prisma.product.update({
                    where: { id: product.id },
                    data: {
                      displayImages: { push: url },
                    },
                  });
                  resolve(url);
                } catch (updateError) {
                  console.error('Database update error:', updateError);
                  reject(updateError);
                }
              } else {
                resolve(null);
              }
            }
          ).end(imageBuffer.buffer);
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
      const oldVariantsData = await prisma.productVariant.findMany({
        where: {
          productId: product.id
        }
      })
      const uploadVariantImagesPromises = oldVariantsData.map((variant: any) => {
        return new Promise((resolve, reject) => {
          const imageBuffer = decodeBase64Image(variants[parseInt(variant.image)].image);
          if (!imageBuffer) {
            resolve(null);
            return;
          }
          cloudinary.uploader.upload_stream(
            { 
              folder: 'product-variant', 
              public_id: variant.id, 
              resource_type: 'image', 
              overwrite: true 
            },
            async (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
                return;
              }
  
              const url = result?.secure_url;
              if (url) {
                try {
                  await prisma.productVariant.update({
                    where: { id: variant.id },
                    data: {
                      image: url,
                    },
                  });
                  resolve(url);
                } catch (updateError) {
                  console.error('Database update error:', updateError);
                  reject(updateError);
                }
              } else {
                resolve(null);
              }
            }
          ).end(imageBuffer.buffer);
        })
      })
      const uploadedVariantImageUrls = await Promise.all(uploadVariantImagesPromises);
      const successfulVariantUploads = uploadedVariantImageUrls.filter(url => url !== null);  
      if (successfulVariantUploads.length === 0) {
        res.status(500).json({
          success: false,
          message: 'Images were not successfully uploaded.',
        });
        return;
      }
      const finalProduct = await prisma.product.findUnique({
        where: {
          id: product.id
        },
        include: {
          category: true,
          variants: true,
          events: true,
        }
      })
      res.status(200).json({
          success: true,
          message: "Product created successfully",
          product: finalProduct
      })  
    } catch (error) {
      console.log(error)
      res.status(500).json({
          success: false,
          message: "Internal server error"
      })
    }
}
const getAllProducts = async (req: Request, res: Response) => {
  const {page, limit, query, category, price_order, price_min, price_max, updateAt_order} = req.query
  try {
    const products = await prisma.product.findMany({
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
    const formattedProducts = products.filter((product: any) => {
      const minPrice = Math.min(...product.variants.map((variant: any) => variant.price));
      const maxPrice = Math.max(...product.variants.map((variant: any) => variant.price));
      return !(Number(price_min) > maxPrice || Number(price_max) < minPrice);
    }).sort((a: any, b: any) => {
      if (price_order === 'asc') {
        const minPriceA = Math.min(...a.variants.map((variant: any) => variant.price));
        const minPriceB = Math.min(...b.variants.map((variant: any) => variant.price));
        return Number(minPriceA) - Number(minPriceB);
      } 
      else if (price_order === 'desc') {
        const maxPriceA = Math.max(...a.variants.map((variant: any) => variant.price));
        const maxPriceB = Math.max(...b.variants.map((variant: any) => variant.price));
        return Number(maxPriceB) - Number(maxPriceA);
      }
      return 0;
    })
    
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}
const getTotalPages = async (req: Request, res: Response) => {
  const {limit} = req.query
  try {
    const count = await prisma.product.count();
    const totalPages = Math.ceil(count / Number(limit));
    res.status(200).json({
      success: true,
      message: "Total pages fetched successfully",
      totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}
const updateProduct = async (req: Request, res: Response) => {
  const {id, title, description, displayImages, categoryId, variants, eventIds} = req.body
  try {
    const variantsToUpdate = variants.filter((variant: any) => variant.id);
    const variantsToCreate = variants.filter((variant: any) => !variant.id);

    const updateOperations = variantsToUpdate.map((variant: any) =>
      prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          name: variant.name,
          price: variant.price,
          image: variant.image,
          inStock: variant.inStock,
          discountExpiry: variant.discountExpiry ? new Date(variant.discountExpiry) : null,
          discountPrice: variant.discountPrice || null,
        },
      })
    );
    const createOperations = variantsToCreate.map((variant: any) =>
      prisma.productVariant.create({
        data: {
          productId: id,
          name: variant.name,
          price: variant.price,
          image: variant.image,
          inStock: variant.inStock,
          discountExpiry: variant.discountExpiry ? new Date(variant.discountExpiry) : null,
          discountPrice: variant.discountPrice || null,
        },
      })
    );
    const oldVariantsData = await prisma.productVariant.findMany({
      where: {
        productId: id
      }
    })
    const newVariantsData = await prisma.$transaction([
      prisma.product.update({
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
            set: [...eventIds.map((eventId: string) => ({ id: eventId }))]
          },
          updatedAt: new Date(),
        },
      }),
      ...updateOperations,
      ...createOperations,
    ]).then((data) => {
      return data.slice(1);
    });
    const deleteVariantImagesPromises = oldVariantsData.map((variant: any) => {
      return new Promise((resolve, reject) => {
        if(newVariantsData.map((v: any) => v.id).includes(variant.id)){
          resolve(null);
          return
        }
        else if(!newVariantsData.map((v: any) => v.id).includes(variant.id)){
          cloudinary.uploader.destroy(`product-variant/${variant.id}`, async (error) => {
            if (error) {
              console.error('Cloudinary delete error:', error);
              reject(error);
              return;
            }
            try {
              await prisma.productVariant.delete({ 
                where: { id: variant.id },
              });
              resolve(null);
            } catch (deleteError) {
              console.error('Database delete error:', deleteError);
              reject(deleteError);
            }
          })
          return
        }
      })
    })
    const updateVariantImagesPromises = newVariantsData.map((variant: any) => {
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
            overwrite: true 
          },
          async (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
              return;
            }
            const url = result?.secure_url;
            if (url) {
              try {
                await prisma.productVariant.update({
                  where: { id: variant.id },
                  data: {
                    image: url,
                  },
                });
                resolve(url);
              } catch (updateError) {
                console.error('Database update error:', updateError);
                reject(updateError);
              }
            } else {
              resolve(null);
            }
          }
        ).end(imageBuffer.buffer);
      })
    })
    await Promise.all(deleteVariantImagesPromises)
    await Promise.all(updateVariantImagesPromises)
    const finalProduct = await prisma.product.findUnique({
      where: {
        id
      },
      include: {
        category: true,
        variants: true,
        events: true,
      }
    })
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: finalProduct
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}
const deleteProduct = async (req: Request, res: Response) => {
  const {id} = req.query
  try {
    await prisma.product.update({
      where: {
        id: id as string
      },
      data: {
        events: {
          set: []
        }
      }
    })
    const product = await prisma.product.delete({
      where: {
        id: id as string
      },
    })
    await prisma.productVariant.deleteMany({
      where: {
        productId: id as string
      }
    })
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}
const getProductById = async (req: Request, res: Response) => {
  const {id} = req.query
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: id as string
      },
      include: {
        category: true,
        events: true,
        variants: true
      }
    })
    if(!product) {
      res.status(404).json({
        success: false,
        message: "Product not found"
      })
      return
    }
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product
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
  createProduct,
  getAllProducts,
  updateProduct,
  getTotalPages,
  deleteProduct,
  getProductById
}